package com.reservationmicroservice;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.reservationmicroservice.dto.ReservationDto;
import com.reservationmicroservice.entities.Reservation;
import com.reservationmicroservice.services.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/reservation")
public class MainController {

    private final ReservationService reservationService;

    @GetMapping("/{email}")
    public ResponseEntity<List<ReservationDto>> getAllRepositoriesByEmail(@PathVariable String email) throws JsonProcessingException {
        List<ReservationDto> reservations = reservationService.getReservations(email);
        return ResponseEntity.ok(reservations);
    }

    @GetMapping("/{date}")
    public ResponseEntity<List<ReservationDto>> getAllRepositoriesByDate(@PathVariable String date) throws JsonProcessingException {
        LocalDate localDate = LocalDate.parse(date, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        List<ReservationDto> reservations = reservationService.getReservations(localDate);
        return ResponseEntity.ok(reservations);
    }

    @PostMapping
    public ResponseEntity<ReservationDto> addReservation(@RequestBody Reservation reservation) throws JsonProcessingException {
        return ResponseEntity.ok(reservationService.createReservation(reservation));
    }
    @PutMapping
    public ResponseEntity<ReservationDto> updateReservation(@RequestBody Reservation reservation) throws JsonProcessingException {
        return ResponseEntity.ok(reservationService.updateReservation(reservation));
    }

    @DeleteMapping
    public ResponseEntity<Reservation> deleteReservation(@RequestBody Reservation reservation) {
        reservationService.deleteReservation(reservation);
        return ResponseEntity.ok().build();
    }

}
