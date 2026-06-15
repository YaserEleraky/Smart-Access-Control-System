#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h> // ⚠️ Install "ArduinoJson" library (v6.x)
#include <ESP32Servo.h>

// RFID Pins
#define RST_PIN 22
#define SS_PIN 5

#define SERVO_PIN 4  // سيرفو
#define LAMP1_PIN 15 // لمبة 1  (green)
#define LAMP2_PIN 2  // لمبة 2  (red)

// WiFi & MQTT
const char *ssid = "Only";
const char *password = "yaser1234";
const char *mqtt_server = "10.81.117.180";
const int mqtt_port = 1883;

// MQTT Topics
const char *TOPIC_CHECK = "access/check";
const char *TOPIC_RESPONSE = "access/response";
const char *TOPIC_MODE_SET = "access/mode/set";
const char *TOPIC_SCAN_RESULT = "access/scan_result";

MFRC522 mfrc522(SS_PIN, RST_PIN);
WiFiClient espClient;
PubSubClient mqttClient(espClient);
Servo lockServo;

// Function prototypes
void publishESP32Status();
void sendScanResult(String uid, String status);
String getUID();
void reconnectMQTT();
void callback(char* topic, byte* payload, unsigned int length);
void openDoor();
void closeDoor();
void setGreenLamp(bool on);
void setRedLamp(bool on);

enum Mode
{
  ACCESS,
  REGISTERING
};
Mode currentMode = ACCESS;
String pendingSessionId = "";
unsigned long registerTimeout = 0;
const unsigned long REGISTER_DURATION = 30000;

enum LockState
{
  LOCKED,
  UNLOCKED_WAIT_CLOSING,
  OPEN_TIMEOUT
};
LockState lockState = LOCKED;
const int SERVO_OPEN_POS = 0;    // باب مفتوح
const int SERVO_CLOSED_POS = 90; // باب مقفل (LOW position)
unsigned long doorOpenTimestamp = 0;
unsigned long lastRedToggle = 0;
bool redState = true;
const unsigned long DOOR_CLOSE_TIMEOUT = 10000;
const unsigned long DOOR_FORCE_CLOSE_DELAY = 15000;

void setup()
{
  Serial.begin(115200);
  Serial.println("\n==================================");
  Serial.println("🔧 ESP32 RFID Access Control System");
  Serial.println("==================================");

  SPI.begin();
  
  // Test RFID reader initialization
  Serial.println("🔧 Initializing RFID Reader...");
  mfrc522.PCD_Init();
  delay(100);
  
  // Check if RFID reader is working
  byte version = mfrc522.PCD_ReadRegister(MFRC522::VersionReg);
  Serial.print("📡 RFID Reader Version: 0x");
  Serial.print(version, HEX);
  
  if (version == 0x00 || version == 0xFF) {
    Serial.println(" -> ❌ ERROR: RFID Reader not detected!");
    Serial.println("   Check wiring: SS=5, RST=22, MOSI=23, MISO=19, SCK=18");
    Serial.println("   Check power: 3.3V and GND connections");
  } else {
    Serial.println(" -> ✅ RFID Reader detected");
    mfrc522.PCD_SetAntennaGain(MFRC522::RxGain_max);
    Serial.println("📡 RFID Antenna gain set to maximum");
  }
  
  Serial.println("✅ RFID Reader initialization complete");

  WiFi.begin(ssid, password);
  Serial.print("📡 Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi Connected. IP: " + WiFi.localIP().toString());

  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCallback(callback);
  reconnectMQTT();
  
  // Start ESP32 status publishing timer (initialized in loop)

  pinMode(LAMP1_PIN, OUTPUT);
  pinMode(LAMP2_PIN, OUTPUT);
  lockServo.attach(SERVO_PIN);
  closeDoor(); // الباب مقفل في البداية (servo في وضع LOW)

  Serial.println("\n🎮 System Ready! Waiting for commands...");
  Serial.println("📌 Door is LOCKED (Servo at 90°)");
  Serial.println("==================================\n");
}

void setGreenLamp(bool on)
{
  digitalWrite(LAMP1_PIN, on ? HIGH : LOW);
  // Serial.print("💚 Green Lamp: ");
  // Serial.println(on ? "ON" : "OFF");
}

void setRedLamp(bool on)
{
  digitalWrite(LAMP2_PIN, on ? HIGH : LOW);
  // Serial.print("❤️ Red Lamp: ");
  // Serial.println(on ? "ON" : "OFF");
}

void openDoor()
{
  Serial.println("🔓 OPENING DOOR...");
  lockServo.write(SERVO_OPEN_POS);
  Serial.print("   Servo position: ");
  Serial.println(SERVO_OPEN_POS);
  setGreenLamp(true);
  setRedLamp(false);
  doorOpenTimestamp = millis();
  lockState = UNLOCKED_WAIT_CLOSING;
  redState = false;
  lastRedToggle = millis();
  Serial.println("✅ Door opened successfully!");
  Serial.println("⏳ Waiting for door to close automatically...");
}

void closeDoor()
{
  Serial.println("🔒 CLOSING DOOR...");
  lockServo.write(SERVO_CLOSED_POS);
  Serial.print("   Servo position: ");
  Serial.println(SERVO_CLOSED_POS);
  Serial.println("   (Servo is now in LOW position - Door Locked)");
  setGreenLamp(false);
  setRedLamp(true);
  lockState = LOCKED;
  redState = true;
  Serial.println("✅ Door closed and locked!");
}

void loop()
{
  if (!mqttClient.connected())
  {
    Serial.println("⚠️ MQTT disconnected! Reconnecting...");
    reconnectMQTT();
  }
  mqttClient.loop();

  // Auto-exit registration mode after timeout
  if (currentMode == REGISTERING && millis() - registerTimeout > REGISTER_DURATION)
  {
    Serial.println("⏰ Registration timeout. Returning to ACCESS mode.");
    sendScanResult("", "TIMEOUT");
    currentMode = ACCESS;
    pendingSessionId = "";
  }

  // Handle door state while unlocked
  if (lockState == UNLOCKED_WAIT_CLOSING)
  {
    unsigned long elapsed = millis() - doorOpenTimestamp;
    if (elapsed > DOOR_CLOSE_TIMEOUT)
    {
      lockState = OPEN_TIMEOUT;
      lastRedToggle = millis();
      redState = false;
      Serial.println("⚠️ WARNING: Door not closed after 10 seconds!");
      Serial.println("🔄 Red lamp will now toggle every 500ms");
    }
    else
    {
      // Debug: show remaining time every 2 seconds
      static unsigned long lastDebugPrint = 0;
      if (millis() - lastDebugPrint > 2000)
      {
        unsigned long remaining = DOOR_CLOSE_TIMEOUT - elapsed;
        Serial.print("⏱️ Door open for ");
        Serial.print(elapsed / 1000);
        Serial.print("s - Will auto-close in ");
        Serial.print(remaining / 1000);
        Serial.println("s");
        lastDebugPrint = millis();
      }
    }
  }
  else if (lockState == OPEN_TIMEOUT)
  {
    if (millis() - lastRedToggle >= 500)
    {
      redState = !redState;
      setRedLamp(redState);
      lastRedToggle = millis();
      Serial.print("⚠️ Toggling red lamp: ");
      Serial.println(redState ? "ON" : "OFF");
    }

    if (millis() - doorOpenTimestamp > DOOR_FORCE_CLOSE_DELAY)
    {
      Serial.println("⏰ 15 seconds elapsed! Force closing door...");
      closeDoor();
      Serial.println("🔄 Door forced closed to test open/close cycle");
    }
  }
  else if (lockState == LOCKED)
  {
    // تأكد أن الـ servo في وضع LOW (مقفل)
    static bool lastServoCheck = false;
    if (!lastServoCheck)
    {
      Serial.println("🔐 System is LOCKED (Servo at LOW position - 90°)");
      lastServoCheck = true;
    }
    setRedLamp(true);
    setGreenLamp(false);
  }

  // SIMPLE RFID scanning - Most reliable approach
  static unsigned long lastCardRead = 0;
  const unsigned long CARD_READ_DELAY = 1000; // Wait 1 second between card reads
  
  // Only read cards when door is LOCKED
  if (lockState == LOCKED) {
    // Reset the RFID reader if no card was read for a while
    if (millis() - lastCardRead > 5000) {
      // Re-initialize RFID reader periodically
      mfrc522.PCD_Init();
      delay(50);
    }
    
    // Look for new cards
    if (mfrc522.PICC_IsNewCardPresent()) {
      // Try to read the card
      if (mfrc522.PICC_ReadCardSerial()) {
        String uid = getUID();
        lastCardRead = millis();
        
        Serial.println("\n🔍 RFID Card Detected!");
        Serial.print("   Card UID: ");
        Serial.println(uid);
        Serial.print("   Current Mode: ");
        Serial.println(currentMode == ACCESS ? "ACCESS" : "REGISTERING");
        
        if (currentMode == REGISTERING && !pendingSessionId.isEmpty()) {
          Serial.println("📝 Registering new card...");
          sendScanResult(uid, "SCANNED");
          currentMode = ACCESS;
          pendingSessionId = "";
          Serial.println("✅ Card registered! Returning to ACCESS mode");
        } else {
          Serial.println("📤 Sending access check to server...");
          if (mqttClient.publish(TOPIC_CHECK, uid.c_str())) {
            Serial.println("   ✅ Access check sent successfully");
          } else {
            Serial.println("   ❌ Failed to send access check");
          }
        }
        
        // Halt the card - NO PCD_StopCrypto1()
        mfrc522.PICC_HaltA();
        // DO NOT use PCD_StopCrypto1() - it stops scanning
        
        // Wait before next read to prevent reading same card multiple times
        delay(500);
      } else {
        // Card present but failed to read
        Serial.print("⚠️ Card detected but failed to read - Retrying...");
        // Reset communication
        mfrc522.PICC_HaltA();
      }
    }
  }

  // Publish ESP32 and door status to MQTT every 10 seconds
  static unsigned long statusTimer = 0;
  static const unsigned long STATUS_INTERVAL = 10000;
  
  if (millis() - statusTimer > STATUS_INTERVAL) {
    publishESP32Status();
    statusTimer = millis();
  }
  
  // Periodic RFID diagnostic check
  static unsigned long diagnosticTimer = 0;
  static const unsigned long DIAGNOSTIC_INTERVAL = 30000; // Every 30 seconds
  
  if (millis() - diagnosticTimer > DIAGNOSTIC_INTERVAL) {
    Serial.println("\n🔍 RFID Diagnostic Check:");
    Serial.println("   Checking reader status...");
    
    byte version = mfrc522.PCD_ReadRegister(MFRC522::VersionReg);
    Serial.print("   Reader Version: 0x");
    Serial.println(version, HEX);
    
    if (version == 0x00 || version == 0xFF) {
      Serial.println("   ❌ ERROR: RFID Reader not responding!");
      Serial.println("   🔧 Attempting to re-initialize...");
      mfrc522.PCD_Init();
      delay(100);
      version = mfrc522.PCD_ReadRegister(MFRC522::VersionReg);
      Serial.print("   New Version: 0x");
      Serial.println(version, HEX);
    } else {
      Serial.println("   ✅ RFID Reader is responding");
    }
    
    diagnosticTimer = millis();
  }
  
  // Small delay to prevent CPU hogging
  delay(10);
}

// ================= Helper Functions =================

String getUID()
{
  String content = "";
  for (byte i = 0; i < mfrc522.uid.size; i++)
  {
    content += String(mfrc522.uid.uidByte[i] < 0x10 ? "0" : "") +
               String(mfrc522.uid.uidByte[i], HEX);
  }
  content.toUpperCase();
  return content;
}

void publishESP32Status() {
  StaticJsonDocument<300> doc;
  
  // ESP32 status
  doc["device_id"] = "ESP32-RFID-01";
  doc["ip_address"] = WiFi.localIP().toString();
  doc["wifi_strength"] = WiFi.RSSI();
  
  // Door status
  doc["door_state"] = (lockState == LOCKED) ? "LOCKED" : 
                     (lockState == UNLOCKED_WAIT_CLOSING) ? "OPEN" : "TIMEOUT";
  
  if (lockState == UNLOCKED_WAIT_CLOSING) {
    unsigned long elapsed = millis() - doorOpenTimestamp;
    unsigned long remaining = DOOR_CLOSE_TIMEOUT - elapsed;
    if (remaining > 0) {
      doc["door_open_for"] = elapsed / 1000;
      doc["door_closes_in"] = remaining / 1000;
    }
  }
  
  doc["scan_mode"] = (currentMode == ACCESS) ? "ACCESS" : "REGISTERING";
  doc["timestamp"] = millis();
  
  char buffer[512];
  serializeJson(doc, buffer);
  
  if (mqttClient.publish("esp32/status", buffer)) {
    Serial.println("📤 ESP32 status published to MQTT");
    Serial.print("   Door: ");
    Serial.println(doc["door_state"].as<const char*>());
    if (lockState == UNLOCKED_WAIT_CLOSING) {
      Serial.print("   Open for: ");
      Serial.print(doc["door_open_for"].as<int>());
      Serial.print("s, Closes in: ");
      Serial.print(doc["door_closes_in"].as<int>());
      Serial.println("s");
    }
  }
}

void sendScanResult(String uid, String status)
{
  StaticJsonDocument<200> doc;
  doc["session_id"] = pendingSessionId;
  doc["uid"] = uid;
  doc["status"] = status;

  char buffer[256];
  serializeJson(doc, buffer);

  bool sent = mqttClient.publish(TOPIC_SCAN_RESULT, buffer);
  if (sent)
  {
    Serial.println("📤 Scan result sent to server");
    Serial.print("   Session ID: ");
    Serial.println(pendingSessionId);
    Serial.print("   Status: ");
    Serial.println(status);
  }
  else
  {
    Serial.println("❌ Failed to send scan result");
  }
}

// Handle JSON and plain-text separately
void callback(char *topic, byte *payload, unsigned int length)
{
  String topicStr = String(topic);
  String msg = "";
  for (unsigned int i = 0; i < length; i++)
  {
    msg += (char)payload[i];
  }

  Serial.println("\n📩 MQTT Message Received");
  Serial.print("   Topic: ");
  Serial.println(topicStr);
  Serial.print("   Message: ");
  Serial.println(msg);

  // Plain-text response (ALLOWED/DENIED) - NO JSON parsing
  if (topicStr == TOPIC_RESPONSE)
  {
    if (msg == "ALLOWED")
    {
      Serial.println("✅ ACCESS GRANTED by server");
      if (lockState == LOCKED)
      {
        Serial.println("🔓 Lock is currently LOCKED - Opening door...");
        openDoor();
      }
      else
      {
        Serial.println("⚠️ Lock already open - Access grant ignored until door is closed");
        Serial.print("   Current lock state: ");
        Serial.println(lockState == UNLOCKED_WAIT_CLOSING ? "UNLOCKED" : "TIMEOUT");
      }
    }
    else if (msg == "DENIED")
    {
      Serial.println("❌ ACCESS DENIED by server");
      Serial.println("🔔 Access rejected - Door remains locked");
    }
    else
    {
      Serial.println("⚠️ Unknown response from server");
    }
    return; // Exit early, no JSON parsing needed
  }

  // JSON messages (mode commands, scan results)
  if (topicStr == TOPIC_MODE_SET)
  {
    Serial.println("📝 Parsing JSON command...");
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, msg);

    if (error)
    {
      Serial.println("❌ JSON parse error in MODE_SET: " + String(error.c_str()));
      return;
    }

    String mode = doc["mode"] | "";
    String sessionId = doc["session_id"] | "";
    int timeout = doc["timeout"] | 30;

    Serial.print("   Mode: ");
    Serial.println(mode);
    Serial.print("   Session ID: ");
    Serial.println(sessionId);
    Serial.print("   Timeout: ");
    Serial.println(timeout);

    if (mode == "register")
    {
      currentMode = REGISTERING;
      pendingSessionId = sessionId;
      registerTimeout = millis();
      Serial.println("🔐 Server command: Enter REGISTRATION mode");
      Serial.print("   Session: ");
      Serial.println(sessionId);
      Serial.print("   Timeout: ");
      Serial.print(timeout);
      Serial.println(" seconds");
      Serial.println("📇 Please scan a card to register it");
    }
    else if (mode == "access")
    {
      currentMode = ACCESS;
      pendingSessionId = "";
      Serial.println("🔓 Server command: Return to ACCESS mode");
      Serial.println("🔍 Ready to scan cards for access control");
    }
    else
    {
      Serial.println("⚠️ Unknown mode command");
    }
  }
}

void reconnectMQTT()
{
  Serial.print("🔄 Connecting to MQTT broker...");
  String clientId = "ESP32-" + String(random(0xffff), HEX);

  if (mqttClient.connect(clientId.c_str()))
  {
    mqttClient.subscribe(TOPIC_RESPONSE);
    mqttClient.subscribe(TOPIC_MODE_SET);
    Serial.println("✅ Connected to MQTT!");
    Serial.print("   Subscribed to: ");
    Serial.println(TOPIC_RESPONSE);
    Serial.print("   and: ");
    Serial.println(TOPIC_MODE_SET);
  }
  else
  {
    Serial.print("❌ Failed! State: ");
    Serial.println(mqttClient.state());
    Serial.println("🔄 Retrying in 5 seconds...");
    delay(5000);
  }
}
