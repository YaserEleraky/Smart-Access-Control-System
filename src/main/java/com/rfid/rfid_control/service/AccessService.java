package com.rfid.rfid_control.service;


import com.rfid.rfid_control.model.AccessLog;
import com.rfid.rfid_control.model.Card;
import com.rfid.rfid_control.repository.AccessLogRepository;
import com.rfid.rfid_control.repository.CardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AccessService {

    private final CardRepository cardRepository;
    private final AccessLogRepository accessLogRepository;

    public List<Card> getAllCards() {
        return cardRepository.findAll();
    }

    public Card registerCard(String uid, String userName, Integer age) {
        return cardRepository.save(Card.builder()
                .uid(uid.toUpperCase())
                .userName(userName)
                .age(age)
                .build());
    }

    public Optional<Card> getCardByUid(String uid) {
        return cardRepository.findByUid(uid.toUpperCase());
    }

    public AccessLog getLatestAccessLog() {
        return accessLogRepository.findTopByOrderByTimestampDesc();
    }
}
