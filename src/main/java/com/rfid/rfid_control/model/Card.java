package com.rfid.rfid_control.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cards")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Card {
    @Id
    @Column(nullable = false, unique = true)
    private String uid;

    @Column(nullable = false)
    private String userName;

    private Integer age;

    @Column(columnDefinition = "TEXT DEFAULT 'active'")
    private String status;

    @Column(updatable = false)
    private LocalDateTime registeredAt;

    @PrePersist
    protected void onCreate() {
        if (registeredAt == null) registeredAt = LocalDateTime.now();
        if (status == null) status = "active";
    }
}
