package com.rfid.rfid_control.controller;



import com.rfid.rfid_control.model.AccessLog;
import com.rfid.rfid_control.model.Card;
import com.rfid.rfid_control.model.dto.RegisterRequest;
import com.rfid.rfid_control.model.dto.RegisterResponse;
import com.rfid.rfid_control.service.AccessService;
import com.rfid.rfid_control.service.MqttService;
import java.util.concurrent.ConcurrentHashMap;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class AccessController {

    private final MqttService mqttService;
    private final AccessService accessService;

    @PostMapping("/register/start")
    public ResponseEntity<RegisterResponse> startRegistration(@Valid @RequestBody RegisterRequest req) {
        String sessionId = mqttService.startRegistration(
                req.getUserName(),
                req.getAge(),
                req.getTimeout()
        );

        return ResponseEntity.ok(RegisterResponse.builder()
                .status("waiting")
                .message("Scan card on ESP32 within " + (req.getTimeout() != null ? req.getTimeout() : 30) + " seconds")
                .sessionId(sessionId)
                .timeout(req.getTimeout() != null ? req.getTimeout() : 30)
                .build());
    }

    @GetMapping("/cards")
    public ResponseEntity<Map<String, Object>> listCards() {
        List<Card> cards = accessService.getAllCards();
        return ResponseEntity.ok(Map.of(
                "total", cards.size(),
                "cards", cards
        ));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "healthy"));
    }

    @GetMapping("/esp32/status")
    public ResponseEntity<Map<String, Object>> getEsp32Status() {
        Map<String, Object> status = new java.util.HashMap<>();
        
        // Check if MQTT service is connected
        boolean isConnected = mqttService.isConnected();
        
        if (isConnected) {
            status.put("status", "connected");
            status.put("message", "ESP32 MQTT connection active - Cards are being scanned");
            status.put("mqttBroker", mqttService.getBrokerUrl());
            status.put("connected", true);
            status.put("lastActivity", "Card scans detected");
        } else {
            status.put("status", "disconnected");
            status.put("message", "Connect ESP32 to MQTT broker");
            status.put("mqttBroker", mqttService.getBrokerUrl());
            status.put("connected", false);
        }
        
        return ResponseEntity.ok(status);
    }

    @GetMapping("/access/latest")
    public ResponseEntity<Map<String, Object>> getLatestAccess() {
        // Get the latest access log entry
        AccessLog latestLog = accessService.getLatestAccessLog();
        
        Map<String, Object> response = new java.util.HashMap<>();
        
        if (latestLog != null) {
            // Get card details for the UID
            Optional<Card> card = accessService.getCardByUid(latestLog.getUid());
            
            response.put("timestamp", latestLog.getTimestamp());
            response.put("uid", latestLog.getUid());
            response.put("result", latestLog.getResult());
            response.put("userName", card.isPresent() ? card.get().getUserName() : "Unknown");
            response.put("hasRecentActivity", true);
        } else {
            response.put("hasRecentActivity", false);
            response.put("message", "No card scans yet");
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/door/status")
    public ResponseEntity<Map<String, Object>> getDoorStatus() {
        Map<String, Object> doorStatus = new java.util.HashMap<>();
        
        // Get the latest ESP32 status from MQTT service
        Map<String, Object> esp32Data = mqttService.getEsp32StatusData();
        
        if (esp32Data != null && !esp32Data.isEmpty()) {
            doorStatus.put("doorState", esp32Data.get("door_state") != null ? esp32Data.get("door_state") : "UNKNOWN");
            doorStatus.put("lastUpdate", esp32Data.get("timestamp") != null ? esp32Data.get("timestamp") : 0L);
            doorStatus.put("deviceId", esp32Data.get("device_id") != null ? esp32Data.get("device_id") : "ESP32-RFID-01");
            doorStatus.put("scanMode", esp32Data.get("scan_mode") != null ? esp32Data.get("scan_mode") : "ACCESS");
            
            if (esp32Data.get("door_state") != null && esp32Data.get("door_state").equals("OPEN")) {
                doorStatus.put("doorOpenFor", esp32Data.get("door_open_for") != null ? esp32Data.get("door_open_for") : 0);
                doorStatus.put("doorClosesIn", esp32Data.get("door_closes_in") != null ? esp32Data.get("door_closes_in") : 10);
            }
            doorStatus.put("hasData", true);
        } else {
            doorStatus.put("doorState", "UNKNOWN");
            doorStatus.put("hasData", false);
            doorStatus.put("message", "Waiting for ESP32 status updates...");
        }
        
        return ResponseEntity.ok(doorStatus);
    }
}