package com.reservationmicroservice.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.reservationmicroservice.dto.AllGamesAndTablesDto;
import com.reservationmicroservice.dto.GameDto;
import com.reservationmicroservice.dto.ReservationDto;
import com.reservationmicroservice.dto.TableDto;
import com.reservationmicroservice.entities.Reservation;
import com.reservationmicroservice.rabbit.RabbitRpcClient;
import com.reservationmicroservice.repositories.ReservationRepository;
import com.reservationmicroservice.util.DataMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationService {
    private final ReservationRepository reservationRepository;
    private final RabbitRpcClient rabbitClient;
    private final DataMapper dataMapper;
    private final EmailService emailService;

    public List<ReservationDto> getReservations(String email) throws JsonProcessingException {
        List<Reservation> reservations = reservationRepository.findByEmail(email);
        AllGamesAndTablesDto allGamesAndTables = rabbitClient.getAllGamesAndTables();
        return dataMapper.mapToReservationDtoList(reservations, allGamesAndTables.getGames(), allGamesAndTables.getTables());
    }

    public List<ReservationDto> getReservations(LocalDate date) throws JsonProcessingException {
        List<Reservation> reservations = reservationRepository.findByDate(date);
        AllGamesAndTablesDto allGamesAndTables = rabbitClient.getAllGamesAndTables();
        return dataMapper.mapToReservationDtoList(reservations, allGamesAndTables.getGames(), allGamesAndTables.getTables());
    }

    public ReservationDto createReservation(Reservation reservation) throws JsonProcessingException {
        reservation.setId(null);
        reservation.setEndTime(reservation.getStartTime().plusHours(2));

        reservationRepository.findByDate(reservation.getDate()).stream()
                .filter(res -> res.getStartTime().equals(reservation.getStartTime()) && res.getTableId().equals(reservation.getTableId()))
                .findFirst()
                .ifPresent(res -> {
                    throw new IllegalArgumentException("Reservation already exists for this date and time.");
                });
        AllGamesAndTablesDto allGamesAndTables = rabbitClient.getAllGamesAndTables();
        TableDto table = allGamesAndTables.getTables()
                .stream().filter(elem -> elem.getId().equals(reservation.getTableId()))
                .findFirst().orElseThrow(EntityNotFoundException::new);
        GameDto game = allGamesAndTables.getGames()
                .stream().filter(elem -> elem.getId().equals(reservation.getGameId()))
                .findFirst().orElseThrow(EntityNotFoundException::new);
        Reservation saved = reservationRepository.save(reservation);

        emailService.sendEmail(
                reservation.getEmail(),
                "Guest",
                "Reservation Confirmation",
                "Your reservation has been created for " + reservation.getDate() + " at " + reservation.getStartTime(),
                "<p>Your reservation has been <strong>created</strong> for " + reservation.getDate() + " at " + reservation.getStartTime() + ".</p>"
        );

        return dataMapper.mapToReservationDto(saved, game, table);
    }

    public ReservationDto updateReservation(Reservation reservation) throws JsonProcessingException {
        if (reservation.getId() == null) throw new EntityNotFoundException();

        reservationRepository.findByDate(reservation.getDate()).stream()
                .filter(res -> res.getStartTime().equals(reservation.getStartTime())
                        && res.getTableId().equals(reservation.getTableId())
                        && !res.getId().equals(reservation.getId()))
                .findFirst()
                .ifPresent(res -> {
                    throw new IllegalArgumentException("Reservation already exists for this date and time.");
                });
        reservation.setEndTime(reservation.getStartTime().plusHours(2));
        AllGamesAndTablesDto allGamesAndTables = rabbitClient.getAllGamesAndTables();
        TableDto table = allGamesAndTables.getTables()
                .stream().filter(elem -> elem.getId().equals(reservation.getTableId()))
                .findFirst().orElseThrow(EntityNotFoundException::new);
        GameDto game = allGamesAndTables.getGames()
                .stream().filter(elem -> elem.getId().equals(reservation.getGameId()))
                .findFirst().orElseThrow(EntityNotFoundException::new);
        Reservation updated = reservationRepository.save(reservation);
        emailService.sendEmail(
                updated.getEmail(),
                "Guest",
                "Reservation Updated",
                "Your reservation has been updated to " + updated.getDate() + " at " + updated.getStartTime(),
                "<p>Your reservation has been <strong>updated</strong> to " + updated.getDate() + " at " + updated.getStartTime() + ".</p>"
        );

        return dataMapper.mapToReservationDto(updated, game, table);
    }

    public void deleteReservation(Reservation reservation) {
        reservationRepository.deleteById(reservation.getId());

        emailService.sendEmail(
                reservation.getEmail(),
                "Guest",
                "Reservation Cancelled",
                "Your reservation for " + reservation.getDate() + " at " + reservation.getStartTime() + " has been cancelled.",
                "<p>Your reservation for <strong>" + reservation.getDate() + " at " + reservation.getStartTime() + "</strong> has been <strong>cancelled</strong>.</p>"
        );
    }
}
