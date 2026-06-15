package com.rfid.rfid_control.service;

import com.rfid.rfid_control.repository.CardRepository;
import com.rfid.rfid_control.repository.AccessLogRepository;
import com.rfid.rfid_control.model.Card;
import com.rfid.rfid_control.model.AccessLog;
import com.google.gson.Gson;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.google.gson.reflect.TypeToken;
import java.lang.reflect.Type;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class MqttService implements MqttCallback {

    @Autowired
    private MqttConnectOptions options;

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private AccessLogRepository logRepository;

    @Value("${mqtt.broker-url}")
    private String brokerUrl;

    @Value("${mqtt.client-id}")
    private String clientId;

    @Value("${mqtt.topic.check}")
    private String TOPIC_CHECK;

    @Value("${mqtt.topic.response}")
    private String TOPIC_RESPONSE;

    @Value("${mqtt.topic.mode-set}")
    private String TOPIC_MODE_SET;

    @Value("${mqtt.topic.scan-result}")
    private String TOPIC_SCAN_RESULT;

    private MqttClient client;
    private Gson gson;
    private Map<String, PendingRegistration> pending;
    private Map<String, Object> esp32StatusData;

    @PostConstruct
    public void init() {
        this.gson = new Gson();
        this.pending = new ConcurrentHashMap<>();
        this.esp32StatusData = new ConcurrentHashMap<>();
        
        try {
            this.client = new MqttClient(brokerUrl, clientId, null);
            client.setCallback(this);
            client.connect(options);
            // Subscribe to additional topics including ESP32 status
            client.subscribe(new String[]{TOPIC_CHECK, TOPIC_SCAN_RESULT, "esp32/status"}, new int[]{1, 1, 1});
            log.info("MQTT Connected to {}", brokerUrl);
        } catch (MqttException e) {
            log.error("MQTT connection failed at startup (broker: {}): {}", brokerUrl, e.getMessage());
        }
    }

    public void publish(String topic, String payload) {
        if (client == null || !client.isConnected()) {
            log.warn("MQTT not connected, skipping publish to {}", topic);
            return;
        }
        try {
            client.publish(topic, payload.getBytes(), 1, false);
        } catch (MqttException e) {
            log.error("MQTT publish failed: {}", e.getMessage());
        }
    }

    public String startRegistration(String userName, Integer age, Integer timeout) {
        String sessionId = java.util.UUID.randomUUID().toString().substring(0, 8);
        pending.put(sessionId, new PendingRegistration(userName, age, System.currentTimeMillis()));

        String cmd = gson.toJson(Map.of(
                "mode", "register",
                "session_id", sessionId,
                "timeout", timeout != null ? timeout : 30
        ));
        publish(TOPIC_MODE_SET, cmd);
        log.info("Registration started: {} -> {}", sessionId, userName);
        return sessionId;
    }

    @Override
    public void connectionLost(Throwable cause) {
        log.error("MQTT connection lost: {}", cause.getMessage());
        // automaticReconnect=true in MqttConnectOptions handles reconnection
    }

    @Override
    public void messageArrived(String topic, MqttMessage message) throws Exception {
        String payload = new String(message.getPayload()).trim();
        log.info("[{}] {}", topic, payload);

        if (TOPIC_CHECK.equals(topic)) {
            handleAccessCheck(payload.toUpperCase());
        } else if (TOPIC_SCAN_RESULT.equals(topic)) {
            handleScanResult(payload);
        } else if ("esp32/status".equals(topic)) {
            handleESP32Status(payload);
        }
    }

    private void handleAccessCheck(String uid) {
        Optional<Card> card = cardRepository.findByUid(uid);
        String result = card.isPresent() && "active".equals(card.get().getStatus()) ? "ALLOWED" : "DENIED";

        logRepository.save(AccessLog.builder().uid(uid).result(result).build());
        publish(TOPIC_RESPONSE, result);
        log.info("{} -> {}", uid, result);
    }

    private void handleScanResult(String payload) {
        try {
            Map<?, ?> data = gson.fromJson(payload, Map.class);
            String sessionId = (String) data.get("session_id");
            String uid = (String) data.get("uid");
            String status = (String) data.get("status");

            if ("TIMEOUT".equals(status) || sessionId == null || uid == null) return;

            PendingRegistration form = pending.remove(sessionId);
            if (form == null) return;

            cardRepository.save(Card.builder().uid(uid.toUpperCase()).userName(form.userName()).age(form.age()).build());
            log.info("Registered: {} | {}", uid, form.userName());

        } catch (Exception e) {
            log.error("Scan handler error: {}", e.getMessage());
        }
    }

    @Override
    public void deliveryComplete(IMqttDeliveryToken token) {}

    public boolean isConnected() {
        return client != null && client.isConnected();
    }

    private void handleESP32Status(String payload) {
        try {
            Type type = new TypeToken<Map<String, Object>>(){}.getType();
            Map<String, Object> statusData = gson.fromJson(payload, type);
            esp32StatusData = statusData;
            log.info("ESP32 Status Updated - Door: {}", statusData.get("door_state"));
        } catch (Exception e) {
            log.error("Failed to parse ESP32 status: {}", e.getMessage());
        }
    }

    public String getBrokerUrl() {
        return brokerUrl;
    }

    public Map<String, Object> getEsp32StatusData() {
        return esp32StatusData;
    }

    public record PendingRegistration(String userName, Integer age, long created) {}
}
