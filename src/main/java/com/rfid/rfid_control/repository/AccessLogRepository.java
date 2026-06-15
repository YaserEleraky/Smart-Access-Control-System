package com.rfid.rfid_control.repository;


import com.rfid.rfid_control.model.AccessLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AccessLogRepository extends JpaRepository<AccessLog, Long> {
    AccessLog findTopByOrderByTimestampDesc();
}