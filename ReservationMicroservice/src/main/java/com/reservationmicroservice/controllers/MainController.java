package com.reservationmicroservice.controllers;

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

    @GetMapping
    public ResponseEntity<List<ReservationDto>> getAll(
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String date) throws JsonProcessingException {

        if (email != null) {
            return ResponseEntity.ok(reservationService.getReservations(email));
        } else if (date != null) {
            LocalDate localDate = LocalDate.parse(date, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            return ResponseEntity.ok(reservationService.getReservations(localDate));
        } else {
            return ResponseEntity.badRequest().build();
        }
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
