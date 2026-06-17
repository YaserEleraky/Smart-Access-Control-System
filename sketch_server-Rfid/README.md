# 📡 ESP32 RFID Access Control - Arduino Sketch Documentation

![ESP32](https://img.shields.io/badge/Platform-ESP32_DevKit-blue?style=for-the-badge&logo=espressif)
![Arduino](https://img.shields.io/badge/IDE-Arduino_IDE-00979D?style=for-the-badge&logo=arduino)
![Language](https://img.shields.io/badge/Language-C++-blue?style=for-the-badge&logo=cplusplus)
![RFID](https://img.shields.io/badge/RFID-MFRC522-red?style=for-the-badge)
![MQTT](https://img.shields.io/badge/MQTT-PubSubClient-orange?style=for-the-badge)

> **Complete documentation for `sketch_server-Rfid.ino`** - ESP32 firmware for RFID-based access control system with MQTT integration.

---

## 📋 Table of Contents

- [📖 Overview](#-overview)
- [🔧 Hardware Requirements](#-hardware-requirements)
- [📌 Pin Configuration & Wiring Diagrams](#-pin-configuration--wiring-diagrams)
- [📦 Required Libraries](#-required-libraries)
- [⚙️ Configuration Settings](#️-configuration-settings)
- [🏗️ System Architecture](#️-system-architecture)
- [🔄 Operation Modes](#-operation-modes)
- [📨 MQTT Communication](#-mqtt-communication)
- [🚀 Installation Guide](#-installation-guide)
- [🐛 Troubleshooting](#-troubleshooting)
- [📊 Code Structure](#-code-structure)
- [🔐 Security Notes](#-security-notes)

---

## 📖 Overview

This Arduino sketch transforms an **ESP32 microcontroller** into an intelligent RFID access control gateway that communicates with a Spring Boot backend via MQTT protocol. The system reads RFID cards, controls a servo-driven door lock, provides visual feedback through LEDs, and maintains real-time status updates.

### Key Capabilities

✅ **RFID Card Reading** - MFRC522 module reads 13.56 MHz RFID/NFC tags  
✅ **Access Verification** - Real-time card validation via MQTT  
✅ **Door Lock Control** - Servo motor controls physical locking mechanism  
✅ **Visual Indicators** - Green (granted) and Red (denied/timeout) LEDs  
✅ **Dual Operation Modes** - ACCESS mode and REGISTERING mode  
✅ **Auto-Close Safety** - Automatic door closure with timeout warnings  
✅ **Health Monitoring** - Periodic status reporting and diagnostics  
✅ **WiFi Connectivity** - Wireless communication with MQTT broker  

---

## 🔧 Hardware Requirements

### Essential Components

| Component | Quantity | Specification | Estimated Cost |
|-----------|----------|---------------|----------------|
| **ESP32 DevKit V1** | 1 | Dual-core, WiFi, Bluetooth | $5-8 |
| **MFRC522 RFID Module** | 1 | 13.56 MHz, SPI interface | $2-4 |
| **SG90 Micro Servo** | 1 | 180° rotation, 5V | $2-3 |
| **LEDs** | 2 | 5mm Green + Red | $0.10 |
| **Resistors** | 2 | 220Ω for current limiting | $0.05 |
| **Jumper Wires** | 15+ | Male-to-male/female | $2-3 |
| **Breadboard** | 1 | 400-point (optional) | $2-5 |
| **Power Supply** | 1 | 5V 2A USB adapter | $3-5 |

### Optional Components

- **MG996R Servo** - Higher torque for heavier doors
- **Relay Module** - For electromagnetic locks
- **Buzzer** - Audio feedback
- **LCD Display** - Local status display
- **Push Button** - Manual override

---

## 📌 Pin Configuration & Wiring Diagrams

### 🎯 Complete Pin Mapping Table

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ESP32 PIN CONNECTION TABLE                        │
├──────────────────┬───────────┬──────────────────┬───────────────────┤
│ Component        │ ESP32 Pin │ Wire Color       │ Function          │
├──────────────────┼───────────┼──────────────────┼───────────────────┤
│ MFRC522 RFID     │           │                  │                   │
│ ├─ SDA (SS)      │ GPIO 5    │ Orange           │ Slave Select      │
│ ├─ SCK           │ GPIO 18   │ Yellow           │ SPI Clock         │
│ ├─ MOSI          │ GPIO 23   │ Green            │ Master Out        │
│ ├─ MISO          │ GPIO 19   │ Blue             │ Master In         │
│ ├─ RST           │ GPIO 22   │ Purple           │ Reset             │
│ ├─ 3.3V          │ 3.3V      │ Red              │ Power (3.3V ONLY!)│
│ └─ GND           │ GND       │ Black            │ Ground            │
├──────────────────┼───────────┼──────────────────┼───────────────────┤
│ Servo Motor      │           │                  │                   │
│ ├─ Signal        │ GPIO 4    │ White/Yellow     │ PWM Control       │
│ ├─ VCC           │ 5V        │ Red              │ Power (5V)        │
│ └─ GND           │ GND       │ Brown/Black      │ Ground            │
├──────────────────┼───────────┼──────────────────┼───────────────────┤
│ LED Indicators   │           │                  │                   │
│ ├─ Green LED (+) │ GPIO 15   │ Green            │ Access Granted    │
│ ├─ Red LED (+)   │ GPIO 2    │ Red              │ Access Denied     │
│ └─ LED (-)       │ GND       │ Black            │ Common Ground     │
└──────────────────┴───────────┴──────────────────┴───────────────────┘
```

### ⚠️ Critical Warnings

> 🔴 **DANGER**: MFRC522 operates at **3.3V ONLY**! Connecting to 5V will permanently damage the module!  
> 🟡 **WARNING**: Servo motors draw high current. Use external 5V power supply if possible.  
> 🟢 **NOTE**: All components must share common ground (GND).

---

### 📐 Detailed Wiring Diagram #1: ASCII Schematic

```
                         ESP32 DEVKIT V1
                         ╔═══════════════╗
                         ║               ║
    MFRC522 RFID         ║   ESP32       ║   Servo Motor
    ┌──────────┐         ║               ║   ┌──────────┐
    │          │         ║               ║   │          │
    │ SDA ─────╫─────────║── GPIO 5      ║   │ Signal ──╫── GPIO 4
    │ SCK ─────╫─────────║── GPIO 18     ║   │          │
    │ MOSI ────╫─────────║── GPIO 23     ║   │ VCC  ────╫── 5V
    │ MISO ────╫─────────║── GPIO 19     ║   │ GND  ────╫── GND
    │ RST  ────╫─────────║── GPIO 22     ║   └──────────┘
    │ 3.3V ────╫─────────║── 3.3V ⚠️     ║
    │ GND  ────╫─────────║── GND         ║
    └──────────┘         ║               ║
                         ║               ║   LED Indicators
                         ║               ║   ┌──────────┐
                         ║               ║   │ Green ───╫── GPIO 15
                         ║               ║   │ Red   ───╫── GPIO 2
                         ║               ║   │ GND   ───╫── GND
                         ║               ║   └──────────┘
                         ╚═══════════════╝

    Power Connections:
    ┌─────────────────────────────────────────┐
    │ 5V Power Supply                         │
    │                                         │
    │ 5V ──→ Servo VCC (Red wire)            │
    │      ──→ ESP32 VIN (if needed)         │
    │                                         │
    │ GND ──→ ALL GND connections            │
    └─────────────────────────────────────────┘
```

---

### 🎨 Detailed Wiring Diagram #2: Visual Connection Map

```
┌──────────────────────────────────────────────────────────────────────┐
│                     COMPLETE HARDWARE CONNECTION                      │
└──────────────────────────────────────────────────────────────────────┘

POWER SUPPLY (5V 2A USB Adapter)
         │
         ├──→ [5V] ──────────────────────────────────┐
         │                                            │
         ├──→ [GND] ─────────────────────────────────┼──────────┐
         │                                            │          │
         ▼                                            ▼          ▼
    ┌─────────┐                                 ┌────────┐  ┌────────┐
    │ ESP32   │                                 │ SERVO  │  │ LEDs   │
    │ DevKit  │                                 │ SG90   │  │        │
    │         │                                 │        │  │        │
    │ [5V] ←──┼─────────────────────────────────┤ [VCC]  │  │        │
    │ [GND]←──┼─────────────────────────────────┼──[GND] │  │ [GND]  │
    │         │                                 │        │  │        │
    │ [GPIO4]─┼─────────────────────────────────┤[Signal]│  │        │
    │         │                                 └────────┘  │        │
    │         │                                             │        │
    │ [GPIO15]┼──[220Ω]──→ [Green LED+]                     │        │
    │         │                                              │        │
    │ [GPIO2]─┼──[220Ω]──→ [Red LED+]                       │        │
    │         │                                             │        │
    │         │    MFRC522 RFID Reader                      │        │
    │         │    ┌─────────────────┐                      │        │
    │ [GPIO5]─┼────┤ SDA (SS)        │                      │        │
    │         │    │                 │                      │        │
    │ [GPIO18]┼────┤ SCK             │                      │        │
    │         │    │                 │                      │        │
    │ [GPIO23]┼────┤ MOSI            │                      │        │
    │         │    │                 │                      │        │
    │ [GPIO19]┼────┤ MISO            │                      │        │
    │         │    │                 │                      │        │
    │ [GPIO22]┼────┤ RST             │                      │        │
    │         │    │                 │                      │        │
    │ [3.3V]──┼────┤ 3.3V ⚠️ NOT 5V!│                      │        │
    │         │    │                 │                      │        │
    │ [GND]───┼────┤ GND             │                      │        │
    │         │    └─────────────────┘                      │        │
    └─────────┘                                             │        │
                                                            │        │
    All GND connections connected together ←────────────────┴────────┘
```

---

### 🔌 Breadboard Layout Diagram

```
BREADBOARD LAYOUT (Top View)
═══════════════════════════════════════════════════════════════════════

     ┌──────────────────────────────────────────────────────────┐
     │  BREADBOARD (400 points)                                  │
     │                                                           │
     │  Column A-H (Top)           Column I-J (Bottom)          │
     │  ┌───┬───┬───┬───┬───┬───┬───┬───┐   ┌───┬───┐          │
     │  │ A │ B │ C │ D │ E │ F │ G │ H │   │ I │ J │          │
     │  ├───┼───┼───┼───┼───┼───┼───┼───┤   ├───┼───┤          │
     │  │   │   │   │   │   │   │   │   │   │   │   │  Row 1   │
     │  │   │   │   │   │   │   │   │   │   │   │   │  Row 2   │
     │  │   │   │   │   │   │   │   │   │   │   │   │  Row 3   │
     │  │   │   │   │   │   │   │   │   │   │   │   │  ...     │
     │  └───┴───┴───┴───┴───┴───┴───┴───┘   └───┴───┘          │
     └──────────────────────────────────────────────────────────┘

COMPONENT PLACEMENT:

Row 1-5:   MFRC522 Module (straddling center gap)
           Pins: SDA, SCK, MOSI, MISO, RST, 3.3V, GND

Row 10-12: ESP32 DevKit (mounted on side or using headers)
           Connect to MFRC522 via jumper wires

Row 20:    Servo Motor connector
           Signal → GPIO 4, VCC → 5V rail, GND → GND rail

Row 30-31: LEDs with resistors
           Green LED: Anode → GPIO 15 → 220Ω → Cathode → GND
           Red LED:   Anode → GPIO 2  → 220Ω → Cathode → GND

Power Rails (Side):
===========
Left Rail:  5V from power supply
Right Rail: GND (common ground)

Connect:
- ESP32 5V → Left rail
- Servo VCC → Left rail
- ESP32 GND → Right rail
- Servo GND → Right rail
- LED cathodes → Right rail
- MFRC522 GND → Right rail
```

---

### 📊 Pin Function Summary

```
PIN USAGE BREAKDOWN
═══════════════════════════════════════════════════════════════════════

DIGITAL PINS USED: 7 out of ~30 available
┌─────────┬──────────────┬──────────┬──────────────────────────────┐
│ GPIO    │ Component    │ Type     │ Notes                        │
├─────────┼──────────────┼──────────┼──────────────────────────────┤
│ GPIO 2  │ Red LED      │ OUTPUT   │ Built-in LED on some boards  │
│ GPIO 4  │ Servo Signal │ PWM      │ Must support PWM             │
│ GPIO 5  │ RFID SS      │ SPI      │ Hardware SPI                 │
│ GPIO 15 │ Green LED    │ OUTPUT   │ Standard digital output      │
│ GPIO 18 │ RFID SCK     │ SPI      │ Hardware SPI clock           │
│ GPIO 19 │ RFID MISO    │ SPI      │ Hardware SPI input           │
│ GPIO 22 │ RFID RST     │ OUTPUT   │ Digital reset                │
│ GPIO 23 │ RFID MOSI    │ SPI      │ Hardware SPI output          │
└─────────┴──────────────┴──────────┴──────────────────────────────┘

POWER PINS:
┌─────────┬──────────────┬──────────┬──────────────────────────────┐
│ Pin     │ Component    │ Voltage  │ Current Draw                 │
├─────────┼──────────────┼──────────┼──────────────────────────────┤
│ 3.3V    │ MFRC522      │ 3.3V     │ ~15 mA                       │
│ 5V      │ Servo        │ 5V       │ Up to 1A (stall)             │
│ GND     │ ALL          │ 0V       │ Common reference             │
└─────────┴──────────────┴──────────┴──────────────────────────────┘

⚠️ IMPORTANT: Total current draw can exceed 1A when servo moves!
   Use external 5V 2A power supply for reliable operation.
```

---

## 📦 Required Libraries

Install these libraries in Arduino IDE: **Sketch → Include Library → Manage Libraries**

| Library Name | Version | Author | Purpose | Install Command |
|--------------|---------|--------|---------|-----------------|
| **MFRC522** | 1.4.10+ | Miguel Balboa | RFID reader communication | Search "MFRC522" |
| **PubSubClient** | 2.8+ | Nick O'Leary | MQTT client | Search "PubSubClient" |
| **ArduinoJson** | 6.21.3+ | Benoit Blanchon | JSON parsing | Search "ArduinoJson" |
| **ESP32Servo** | 0.11.0+ | Kevin Harrington | Servo control for ESP32 | Search "ESP32Servo" |

### PlatformIO Users

Add to `platformio.ini`:

```ini
lib_deps =
    miguelbalboa/MFRC522@^1.4.10
    knolleary/PubSubClient@^2.8
    bblanchon/ArduinoJson@^6.21.3
    madhephaestus/ESP32Servo@^0.11.0
```

### Verify Installation

After installing, verify by compiling:
```
Sketch → Verify/Compile
```

Expected output: `Done compiling.`

---

## ⚙️ Configuration Settings

### WiFi Configuration

Edit these lines in `sketch_server-Rfid.ino` (lines 16-17):

```cpp
const char *ssid = "Only";              // ← Change to your WiFi name
const char *password = "123456789";     // ← Change to your WiFi password
```

> 💡 **Tip**: ESP32 only supports **2.4 GHz** WiFi networks (not 5 GHz).

### MQTT Broker Configuration

Edit line 18:

```cpp
const char *mqtt_server = "10.81.117.180";  // ← Your MQTT broker IP
const int mqtt_port = 1883;                  // Default MQTT port
```

**Popular MQTT Brokers:**
- **Mosquitto** (self-hosted): Install on Raspberry Pi or server
- **HiveMQ Cloud** (free tier): `broker.hivemq.com:1883`
- **CloudMQTT** (free tier): Provided after signup
- **EMQX Cloud** (free tier): `broker.emqx.io:1883`

### Timing Constants

Located around lines 50-55:

```cpp
const unsigned long REGISTER_DURATION = 30000;        // 30 seconds
const unsigned long DOOR_CLOSE_TIMEOUT = 10000;       // 10 seconds
const unsigned long DOOR_FORCE_CLOSE_DELAY = 15000;   // 15 seconds
const unsigned long STATUS_INTERVAL = 10000;          // 10 seconds
const unsigned long DIAGNOSTIC_INTERVAL = 30000;      // 30 seconds
const unsigned long CARD_READ_DELAY = 1000;           // 1 second debounce
```

### Servo Calibration

Lines 62-63:

```cpp
const int SERVO_OPEN_POS = 0;     // Door unlocked position
const int SERVO_CLOSED_POS = 90;  // Door locked position
```

> 🔧 **Calibration**: Adjust these values based on your servo mounting. Test with simple sweep sketch first.

---

## 🏗️ System Architecture

### Component Interaction Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    SYSTEM DATA FLOW                              │
└─────────────────────────────────────────────────────────────────┘

User presents RFID card
         │
         ▼
┌─────────────────┐
│  MFRC522 Reader │ ← Reads card UID via SPI
└────────┬────────┘
         │ UID string
         ▼
┌─────────────────┐
│    ESP32 CPU    │ ← Processes card data
└────────┬────────┘
         │ Publish UID to MQTT
         ▼
┌─────────────────┐
│  MQTT Broker    │ ← Message broker (Mosquitto)
└────────┬────────┘
         │ Forward message
         ▼
┌─────────────────┐
│ Spring Boot     │ ← Validates card in database
│   Backend       │ ← Checks SQLite
└────────┬────────┘
         │ Publish response
         ▼
┌─────────────────┐
│  MQTT Broker    │ ← Response message
└────────┬────────┘
         │ Subscribe response
         ▼
┌─────────────────┐
│    ESP32 CPU    │ ← Receives ALLOWED/DENIED
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
 ALLOWED   DENIED
    │         │
    ▼         ▼
┌──────┐  ┌────────┐
│Open  │  │Stay    │
│Door  │  │Locked  │
└──┬───┘  └────────┘
   │
   ▼
Wait 10s → Auto-close
```

### State Machine Diagram

```
DOOR STATE MACHINE
═══════════════════════════════════════════════════════════════════════

                    ┌──────────────┐
                    │              │
                    │   LOCKED     │ ← Initial state
                    │  (Red LED)   │
                    │              │
                    └──────┬───────┘
                           │
                    MQTT: "ALLOWED"
                           │
                           ▼
                    ┌──────────────────┐
                    │                  │
                    │UNLOCKED_WAIT_    │ ← Green LED ON
                    │   CLOSING        │ ← Timer starts
                    │                  │
                    └──────┬───────────┘
                           │
                    Timeout > 10s
                           │
                           ▼
                    ┌──────────────────┐
                    │                  │
                    │  OPEN_TIMEOUT    │ ← Red LED blinks
                    │                  │   (500ms interval)
                    └──────┬───────────┘
                           │
                    Timeout > 15s OR
                    Door closed
                           │
                           ▼
                    ┌──────────────┐
                    │   FORCE      │ ← Servo closes
                    │   CLOSE      │ ← Back to LOCKED
                    └──────────────┘
```

---

## 🔄 Operation Modes

### Mode 1: ACCESS Mode (Default)

**Purpose**: Normal operation - verify cards and grant/deny access

**Workflow**:
1. ESP32 scans for RFID cards continuously
2. When card detected, read UID
3. Publish UID to `access/check` topic
4. Wait for backend response on `access/response`
5. If "ALLOWED": Open door for 10 seconds
6. If "DENIED": Keep door locked, red LED stays on

**Serial Output Example**:
```
🔍 RFID Card Detected!
   Card UID: A1B2C3D4
   Current Mode: ACCESS
📤 Sending access check to server...
   ✅ Access check sent successfully

📩 MQTT Message Received
   Topic: access/response
   Message: ALLOWED
✅ ACCESS GRANTED by server
🔓 OPENING DOOR...
   Servo position: 0
✅ Door opened successfully!
⏳ Waiting for door to close automatically...
```

### Mode 2: REGISTERING Mode

**Purpose**: Enroll new RFID cards into the system

**Activation**: Backend sends JSON command to `access/mode/set`:

```json
{
  "mode": "register",
  "session_id": "REG-20260618-001",
  "timeout": 30
}
```

**Workflow**:
1. Receive registration command via MQTT
2. Enter REGISTERING mode for 30 seconds
3. Scan new card when presented
4. Send UID to `access/scan_result` topic
5. Backend registers card in database
6. Return to ACCESS mode automatically

**Serial Output Example**:
```
📩 MQTT Message Received
   Topic: access/mode/set
   Message: {"mode":"register","session_id":"REG-001","timeout":30}
🔐 Server command: Enter REGISTRATION mode
   Session: REG-001
   Timeout: 30 seconds
📇 Please scan a card to register it

🔍 RFID Card Detected!
   Card UID: E5F6A7B8
   Current Mode: REGISTERING
📝 Registering new card...
📤 Scan result sent to server
✅ Card registered! Returning to ACCESS mode
```

---

## 📨 MQTT Communication

### Topic Structure

| Topic | Direction | QoS | Retain | Payload Format |
|-------|-----------|-----|--------|----------------|
| `access/check` | ESP32 → Server | 0 | No | Plain text UID |
| `access/response` | Server → ESP32 | 0 | No | "ALLOWED" or "DENIED" |
| `access/mode/set` | Server → ESP32 | 0 | No | JSON object |
| `access/scan_result` | ESP32 → Server | 0 | No | JSON object |
| `esp32/status` | ESP32 → Server | 0 | No | JSON object |

### Message Formats

#### 1. Access Check (ESP32 → Server)

**Topic**: `access/check`  
**Payload**:
```
A1B2C3D4
```

#### 2. Access Response (Server → ESP32)

**Topic**: `access/response`  
**Payload**:
```
ALLOWED
```
or
```
DENIED
```

#### 3. Mode Command (Server → ESP32)

**Topic**: `access/mode/set`  
**Payload**:
```json
{
  "mode": "register",
  "session_id": "REG-20260618-001",
  "timeout": 30
}
```

#### 4. Scan Result (ESP32 → Server)

**Topic**: `access/scan_result`  
**Payload**:
```json
{
  "session_id": "REG-20260618-001",
  "uid": "E5F6A7B8",
  "status": "SCANNED"
}
```

#### 5. Status Update (ESP32 → Server)

**Topic**: `esp32/status`  
**Payload** (Door Locked):
```json
{
  "device_id": "ESP32-RFID-01",
  "ip_address": "192.168.1.100",
  "wifi_strength": -45,
  "door_state": "LOCKED",
  "scan_mode": "ACCESS",
  "timestamp": 123456789
}
```

**Payload** (Door Open):
```json
{
  "device_id": "ESP32-RFID-01",
  "ip_address": "192.168.1.100",
  "wifi_strength": -45,
  "door_state": "OPEN",
  "door_open_for": 5,
  "door_closes_in": 5,
  "scan_mode": "ACCESS",
  "timestamp": 123456794
}
```

---

## 🚀 Installation Guide

### Step 1: Install Arduino IDE

Download from [arduino.cc](https://www.arduino.cc/en/software)

**Recommended Version**: 2.x (newer interface)

### Step 2: Add ESP32 Board Support

1. Open Arduino IDE
2. Go to **File → Preferences**
3. In "Additional Boards Manager URLs", add:
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
4. Click **OK**
5. Go to **Tools → Board → Boards Manager**
6. Search for "ESP32"
7. Install **"esp32 by Espressif Systems"** (latest version)

### Step 3: Install Required Libraries

Go to **Sketch → Include Library → Manage Libraries** and install:

1. **MFRC522** by Miguel Balboa
2. **PubSubClient** by Nick O'Leary
3. **ArduinoJson** by Benoit Blanchon (version 6.x)
4. **ESP32Servo** by Kevin Harrington

### Step 4: Configure the Sketch

Open `sketch_server-Rfid.ino` and edit:

```cpp
// Line 16-17: WiFi credentials
const char *ssid = "Your_WiFi_Name";
const char *password = "Your_WiFi_Password";

// Line 18: MQTT broker
const char *mqtt_server = "your.mqtt.broker.ip";
```

### Step 5: Wire the Hardware

Follow the wiring diagrams in the [Pin Configuration](#-pin-configuration--wiring-diagrams) section above.

**Quick Checklist**:
- [ ] MFRC522 connected to 3.3V (NOT 5V!)
- [ ] All GND connections joined together
- [ ] Servo signal wire to GPIO 4
- [ ] LEDs have 220Ω current-limiting resistors
- [ ] SPI pins correct (SS=5, SCK=18, MOSI=23, MISO=19, RST=22)

### Step 6: Upload the Sketch

1. Connect ESP32 to computer via USB cable
2. In Arduino IDE:
   - **Tools → Board**: ESP32 Dev Module
   - **Tools → Port**: Select COM port (Windows) or /dev/ttyUSB0 (Linux)
   - **Tools → Upload Speed**: 115200
3. Click **Upload** button (→ arrow icon)
4. Wait for "Done uploading" message

### Step 7: Monitor Serial Output

1. Open **Serial Monitor** (Tools → Serial Monitor or Ctrl+Shift+M)
2. Set baud rate to **115200**
3. Press ESP32 RESET button
4. Observe initialization messages

**Expected Output**:
```
==================================
🔧 ESP32 RFID Access Control System
==================================
🔧 Initializing RFID Reader...
📡 RFID Reader Version: 0x92 -> ✅ RFID Reader detected
📡 RFID Antenna gain set to maximum
✅ RFID Reader initialization complete
📡 Connecting to WiFi.....
✅ WiFi Connected. IP: 192.168.1.100
🔄 Connecting to MQTT broker...
✅ Connected to MQTT!
   Subscribed to: access/response
   and: access/mode/set

🎮 System Ready! Waiting for commands...
📌 Door is LOCKED (Servo at 90°)
==================================
```

---

## 🐛 Troubleshooting

### Problem 1: RFID Reader Not Detected

**Symptoms**:
```
❌ ERROR: RFID Reader not detected!
Check wiring: SS=5, RST=22, MOSI=23, MISO=19, SCK=18
```

**Solutions**:
- ✅ Verify MFRC522 is powered with **3.3V** (not 5V!)
- ✅ Double-check all SPI connections
- ✅ Ensure GND is connected
- ✅ Try different jumper wires
- ✅ Test with another MFRC522 module
- ✅ Check for cold solder joints

### Problem 2: WiFi Connection Failed

**Symptoms**:
```
Connecting to WiFi..................
(stuck indefinitely)
```

**Solutions**:
- ✅ Verify WiFi SSID and password
- ✅ Use 2.4 GHz network (not 5 GHz)
- ✅ Check router MAC filtering
- ✅ Move ESP32 closer to router
- ✅ Restart router and ESP32
- ✅ Check for special characters in password

### Problem 3: MQTT Connection Failed

**Symptoms**:
```
❌ Failed! State: -2
🔄 Retrying in 5 seconds...
```

**Solutions**:
- ✅ Verify MQTT broker is running
- ✅ Check broker IP address and port
- ✅ Ensure firewall allows port 1883
- ✅ Test with MQTT client: `mosquitto_sub -h YOUR_IP -t test`
- ✅ Check network connectivity: `ping YOUR_IP`
- ✅ Verify broker allows anonymous connections (or configure auth)

### Problem 4: Servo Not Moving

**Symptoms**:
- No sound from servo
- Door doesn't open/close

**Solutions**:
- ✅ Verify servo connected to GPIO 4
- ✅ Ensure servo has 5V power (not 3.3V)
- ✅ Check signal wire connection
- ✅ Test servo with example sketch (Sweep)
- ✅ Adjust SERVO_OPEN_POS and SERVO_CLOSED_POS values
- ✅ Use external 5V power supply for servo

### Problem 5: Cards Not Reading

**Symptoms**:
- No response when scanning cards
- "Card detected but failed to read"

**Solutions**:
- ✅ Clean RFID card surface
- ✅ Hold card within 2 cm of reader
- ✅ Remove metal objects near reader
- ✅ Check antenna connections
- ✅ Increase distance from other electronics
- ✅ Replace MFRC522 if consistently failing

### Problem 6: Door Doesn't Auto-Close

**Symptoms**:
- Door stays open indefinitely

**Solutions**:
- ✅ Check DOOR_CLOSE_TIMEOUT value (should be 10000)
- ✅ Verify `millis()` is incrementing
- ✅ Ensure `loop()` is not blocked
- ✅ Check state machine logic in code

---

## 📊 Code Structure

### Main Functions

| Function | Purpose | Lines |
|----------|---------|-------|
| `setup()` | Initialize hardware, WiFi, MQTT | 68-120 |
| `loop()` | Main execution loop | 169-300 |
| `callback()` | Handle incoming MQTT messages | 302-380 |
| `openDoor()` | Unlock door, turn green LED | 133-143 |
| `closeDoor()` | Lock door, turn red LED | 145-154 |
| `setGreenLamp()` | Control green LED | 122-125 |
| `setRedLamp()` | Control red LED | 127-131 |
| `reconnectMQTT()` | Reconnect to MQTT broker | 382-410 |
| `publishESP32Status()` | Send status to MQTT | 412-450 |
| `sendScanResult()` | Send registration result | 452-470 |
| `getUID()` | Read RFID card UID | 472-500 |

### Global Variables

```cpp
// Operation modes
enum Mode { ACCESS, REGISTERING };
Mode currentMode = ACCESS;

// Door states
enum LockState { LOCKED, UNLOCKED_WAIT_CLOSING, OPEN_TIMEOUT };
LockState lockState = LOCKED;

// Timing constants
const unsigned long REGISTER_DURATION = 30000;
const unsigned long DOOR_CLOSE_TIMEOUT = 10000;
const unsigned long DOOR_FORCE_CLOSE_DELAY = 15000;

// Servo positions
const int SERVO_OPEN_POS = 0;
const int SERVO_CLOSED_POS = 90;
```

---

## 🔐 Security Notes

### Current Security Level: ⚠️ EDUCATIONAL/DEVELOPMENT ONLY

This sketch is designed for **learning purposes**. For production deployment, implement:

### Recommended Security Enhancements

1. **MQTT Authentication**
   ```cpp
   // Add username/password
   mqttClient.setCredentials("username", "password");
   ```

2. **TLS/SSL Encryption**
   ```cpp
   // Use WiFiClientSecure instead of WiFiClient
   #include <WiFiClientSecure.h>
   WiFiClientSecure espClient;
   ```

3. **Message Validation**
   ```cpp
   // Validate incoming MQTT messages
   if (isValidJSON(payload)) {
     // Process message
   }
   ```

4. **Rate Limiting**
   ```cpp
   // Prevent rapid repeated scans
   if (millis() - lastScanTime < MIN_SCAN_INTERVAL) {
     return;
   }
   ```

5. **Watchdog Timer**
   ```cpp
   // Reset if system hangs
   #include <esp_task_wdt.h>
   esp_task_wdt_init();
   ```

---

## 📞 Support & Resources

### Documentation Links

- **MFRC522 Library**: [GitHub Repository](https://github.com/miguelbalboa/rfid)
- **PubSubClient**: [GitHub Repository](https://github.com/knolleary/pubsubclient)
- **ArduinoJson**: [Documentation](https://arduinojson.org/)
- **ESP32Servo**: [GitHub Repository](https://github.com/madhephaestus/ESP32Servo)
- **ESP32 Official Docs**: [docs.espressif.com](https://docs.espressif.com/projects/arduino-esp32/)

### Community Support

- **Arduino Forum**: [forum.arduino.cc](https://forum.arduino.cc/)
- **ESP32 Forum**: [esp32.com](https://esp32.com/)
- **Stack Overflow**: Tag questions with `esp32`, `arduino`, `mqtt`

### Project-Specific Help

- **Backend Issues**: See [Backend-SpringBoot/README.md](../Backend-SpringBoot/README.md)
- **Frontend Issues**: See [rfid-frontend/README.md](../rfid-frontend/README.md)
- **General Project**: See [README.md](../README.md)

---

<div align="center">

**ESP32 RFID Access Control Sketch Documentation**  
*Version 1.0 | Last Updated: June 18, 2026*

Made with ❤️ for IoT Education - UUST 302B Course

[Report Issue](../../issues) · [Request Feature](../../issues)

</div>
