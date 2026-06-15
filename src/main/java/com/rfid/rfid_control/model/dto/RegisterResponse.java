package com.rfid.rfid_control.model.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class RegisterResponse {
    private String status;
    private String message;
    private String sessionId;
    private Integer timeout;
}