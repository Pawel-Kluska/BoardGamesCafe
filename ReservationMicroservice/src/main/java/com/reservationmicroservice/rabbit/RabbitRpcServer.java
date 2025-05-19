package com.reservationmicroservice.rabbit;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reservationmicroservice.dto.ReservationDto;
import com.reservationmicroservice.entities.Reservation;
import com.reservationmicroservice.services.ReservationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.List;


/*example payloads:
Get all reservation for current date
{
  "action": "getReservationsByDate",
  "date": "2025-04-08"
}

Get all reservation for specific user
{
  "action": "getReservationsByEmail",
  "email": "123@wp.pl"
}
Add new reservation:
{
  "action": "createReservation",
  "email": ”123@wp.pl”,
  "tableId": 1,
  "gameId": 101,
  "date": "2025-04-15",
  "startTime": "18:00",
  "endTime": "20:00"

}
Update reservation:
{
  "action": "updateReservation",
  "email": ”123@wp.pl”,
  "tableId": 1,
  "gameId": 101,
  "date": "2025-04-15",
  "startTime": "18:00",
  "endTime": "20:00"

}
Delete reservation:
{
  "action": "deleteReservation",
  "id": 1
}
 */

@Component
@RequiredArgsConstructor
@Slf4j
public class RabbitRpcServer {

    private final ReservationService reservationService;
    private final ObjectMapper objectMapper;

    @RabbitListener(queues = "reservation.rpc.queue")
    public String handleIncomingRpc(String requestJson) {

        try {
            log.info("Received RPC request: " + requestJson);

            JsonNode requestNode = objectMapper.readTree(requestJson);
            String action = requestNode.has("action") ? requestNode.get("action").asText() : null;

            if (action == null) {
                return "{\"status\": \"error\", \"message\": \"No action field present\"}";
            }

            return switch (action) {
                case "getReservationsByDate" -> {
                    log.info("Processing 'getAllGamesAndTables' request.");
                    yield handleGetAllReservationsByDate(requestJson);
                }
                case "getReservationsByEmail" -> {
                    log.info("Processing 'addNewGame' request.");
                    yield handleGetAllReservationsByEmail(requestJson);
                }
                case "createReservation" -> {
                    log.info("Processing 'updateGame' request.");
                    yield handleCreateReservation(requestJson);
                }
                case "updateReservation" -> {
                    log.info("Processing 'deleteGame' request.");
                    yield handleUpdateReservation(requestJson);
                }
                case "deleteReservation" -> {
                    log.info("Processing 'addNewTable' request.");
                    yield handleDeleteReservation(requestJson);
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
        log.info("Fetching all reservations");
        Reservation reservation = objectMapper.readValue(requestJson, Reservation.class);
        List<ReservationDto> reservations = reservationService.getReservations(reservation.getDate());
        String responseJson = objectMapper.writeValueAsString(reservations);
        log.info("Response: " + responseJson);
        return responseJson;
    }

    private String handleGetAllReservationsByEmail(String requestJson) throws Exception {
        log.info("Fetching all reservations");
        Reservation reservation = objectMapper.readValue(requestJson, Reservation.class);
        List<ReservationDto> reservations = reservationService.getReservations(reservation.getEmail());
        String responseJson = objectMapper.writeValueAsString(reservations);
        log.info("Response: " + responseJson);
        return responseJson;
    }

    private String handleCreateReservation(String requestJson) throws Exception {
        log.info("Creating reservation: " + requestJson);
        Reservation reservation = objectMapper.readValue(requestJson, Reservation.class);
        ReservationDto newReservation = reservationService.createReservation(reservation);
        String responseJson = objectMapper.writeValueAsString(newReservation);
        log.info("Created reservation: " + responseJson);
        return responseJson;
    }

    private String handleUpdateReservation(String requestJson) throws Exception {
        log.info("Updating reservation: " + requestJson);
        Reservation reservation = objectMapper.readValue(requestJson, Reservation.class);
        ReservationDto newReservation = reservationService.updateReservation(reservation);
        String responseJson = objectMapper.writeValueAsString(newReservation);
        log.info("Updated reservation: " + responseJson);
        return responseJson;
    }

    private String handleDeleteReservation(String requestJson) throws Exception {
        log.info("Deleting reservation: " + requestJson);
        Reservation reservation = objectMapper.readValue(requestJson, Reservation.class);
        reservationService.deleteReservation(reservation);
        String responseJson = "{\"status\": \"ok\", \"message\": \"Reservation deleted successfully\"}";
        log.info("Reservation deleted: " + responseJson);
        return responseJson;
    }
}
