package com.reservationmicroservice.repositories;

import com.reservationmicroservice.entities.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByEmail(String email);
    List<Reservation> findByDate(LocalDate date);
}
