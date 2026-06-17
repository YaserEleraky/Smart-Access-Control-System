package com.rfid.rfid_control.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class RegisterRequest {
    @NotBlank(message = "User name is required")
    private String userName;

    private Integer age;

    @Builder.Default
    private Integer timeout = 30;
}