package com.reservationmicroservice.rabbit;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reservationmicroservice.dto.ActionDto;
import com.reservationmicroservice.dto.AllGamesAndTablesDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
@Slf4j
public class RabbitRpcClient {

    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    public String sendToAdminAndReceive(String message) {
        Object response = rabbitTemplate.convertSendAndReceive(
                RabbitConfig.ADMIN_RPC_QUEUE, message
        );

        if (response instanceof byte[]) {
            return new String((byte[]) response, StandardCharsets.UTF_8);
        } else {
            return response != null ? response.toString() : null;
        }
    }

    public AllGamesAndTablesDto getAllGamesAndTables() throws JsonProcessingException {
        ActionDto actionDto = new ActionDto();
        actionDto.setAction("getAllGamesAndTables");
        String message = objectMapper.writeValueAsString(actionDto);
        String response = sendToAdminAndReceive(message);
        try {
            return objectMapper.readValue(response, AllGamesAndTablesDto.class);
        } catch (JsonProcessingException e) {
            log.error("Error while getting all tables and games");
            throw e;
        }
    }
}

