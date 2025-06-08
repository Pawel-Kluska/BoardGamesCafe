package com.socialmicroservice.rabbit;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.socialmicroservice.dto.SessionDto;
import com.socialmicroservice.entities.Session;
import com.socialmicroservice.entities.SessionUser;
import com.socialmicroservice.services.SocialService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.List;


/*example payloads:
Get all reservation for current date
{
  "action": "getSessionsByDate",
  "date": "2025-04-08"
}

Get all reservation for specific user
{
  "action": "getReservationsByEmail",
  "email": "123@wp.pl"
}
Add new session:
{
  "action": "createReservation",
  "email": ”123@wp.pl”,
  "tableId": 1,
  "gameId": 101,
  "date": "2025-04-15",
  "startTime": "18:00",
}
 */

@Component
@RequiredArgsConstructor
@Slf4j
public class RabbitRpcServer {

    private final SocialService socialService;
    private final ObjectMapper objectMapper;

    @RabbitListener(queues = "social.rpc.queue")
    public String handleIncomingRpc(String requestJson) {

        try {
            log.info("Received RPC request: " + requestJson);

            JsonNode requestNode = objectMapper.readTree(requestJson);
            String action = requestNode.has("action") ? requestNode.get("action").asText() : null;

            if (action == null) {
                return "{\"status\": \"error\", \"message\": \"No action field present\"}";
            }

            return switch (action) {
                case "getSessionsByDate" -> {
                    log.info("Processing 'getAllGamesAndTables' request.");
                    yield handleGetAllReservationsByDate(requestJson);
                }
                case "getSessionsByEmail" -> {
                    log.info("Processing 'addNewGame' request.");
                    yield handleGetAllReservationsByEmail(requestJson);
                }
                case "createSession" -> {
                    log.info("Processing 'updateGame' request.");
                    yield handleCreateReservation(requestJson);
                }
                default -> {
                    log.info("Invalid action: " + action);
                    yield "{\"status\": \"error\", \"message\": \"Invalid action\"}";
                }
            };
        } catch (Exception e) {
            log.error("Error processing RPC request: " + e.getMessage());
            return "{\"status\": \"error\", \"message\": \"Failed to process the request\"}";
        }
    }

    private String handleGetAllReservationsByDate(String requestJson) throws Exception {
        log.info("Fetching all sessions");
        Session session = objectMapper.readValue(requestJson, Session.class);
        List<SessionDto> reservations = socialService.getSessions(session.getDate());
        String responseJson = objectMapper.writeValueAsString(reservations);
        log.info("Response: " + responseJson);
        return responseJson;
    }

    private String handleGetAllReservationsByEmail(String requestJson) throws Exception {
        log.info("Fetching all sessions");
        SessionUser session = objectMapper.readValue(requestJson, SessionUser.class);
        List<SessionDto> sessions = socialService.getSessions(session.getEmail());
        String responseJson = objectMapper.writeValueAsString(sessions);
        log.info("Response: " + responseJson);
        return responseJson;
    }

    private String handleCreateReservation(String requestJson) throws Exception {
        log.info("Creating session: " + requestJson);
        Session session = objectMapper.readValue(requestJson, Session.class);
        Session newReservation = socialService.addToSession(session);
        String responseJson = objectMapper.writeValueAsString(newReservation);
        log.info("Created reservation: " + responseJson);
        return responseJson;
    }
}
