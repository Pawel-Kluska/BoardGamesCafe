package com.reservationmicroservice.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.reservationmicroservice.DataMapper;
import com.reservationmicroservice.dto.AllGamesAndTablesDto;
import com.reservationmicroservice.dto.GameDto;
import com.reservationmicroservice.dto.ReservationDto;
import com.reservationmicroservice.dto.TableDto;
import com.reservationmicroservice.entities.Reservation;
import com.reservationmicroservice.rabbit.RabbitRpcClient;
import com.reservationmicroservice.repositories.ReservationRepository;
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
        Reservation saved = reservationRepository.save(reservation);
        AllGamesAndTablesDto allGamesAndTables = rabbitClient.getAllGamesAndTables();
        TableDto table = allGamesAndTables.getTables()
                .stream().filter(elem -> elem.getId().equals(saved.getTableId()))
                .findFirst().orElseThrow(EntityNotFoundException::new);
        GameDto game = allGamesAndTables.getGames()
                .stream().filter(elem -> elem.getId().equals(saved.getGameId()))
                .findFirst().orElseThrow(EntityNotFoundException::new);
        return dataMapper.mapToReservationDto(reservation, game, table);
    }

    public ReservationDto updateReservation(Reservation reservation) throws JsonProcessingException {
        if (reservation.getId() == null) throw new EntityNotFoundException();
        Reservation updated = reservationRepository.save(reservation);
        AllGamesAndTablesDto allGamesAndTables = rabbitClient.getAllGamesAndTables();
        TableDto table = allGamesAndTables.getTables()
                .stream().filter(elem -> elem.getId().equals(updated.getTableId()))
                .findFirst().orElseThrow(EntityNotFoundException::new);
        GameDto game = allGamesAndTables.getGames()
                .stream().filter(elem -> elem.getId().equals(updated.getGameId()))
                .findFirst().orElseThrow(EntityNotFoundException::new);
        return dataMapper.mapToReservationDto(reservation, game, table);
    }

    public void deleteReservation(Reservation reservation) {
        reservationRepository.deleteById(reservation.getId());
    }
}
