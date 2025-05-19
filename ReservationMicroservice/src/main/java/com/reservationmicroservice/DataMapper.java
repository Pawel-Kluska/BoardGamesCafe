package com.reservationmicroservice;

import com.reservationmicroservice.dto.GameDto;
import com.reservationmicroservice.dto.ReservationDto;
import com.reservationmicroservice.dto.TableDto;
import com.reservationmicroservice.entities.Reservation;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class DataMapper {

    public ReservationDto mapToReservationDto(Reservation reservation, GameDto game, TableDto table) {
        ReservationDto reservationDto = new ReservationDto();
        reservationDto.setId(reservation.getId());
        reservationDto.setStatus(reservation.getStatus());
        reservationDto.setDate(reservation.getDate());
        reservationDto.setStartTime(reservation.getStartTime());
        reservationDto.setEndTime(reservation.getEndTime());
        reservationDto.setEmail(reservation.getEmail());
        reservationDto.setGameId(game.getId());
        reservationDto.setGameName(game.getName());
        reservationDto.setTableId(table.getId());
        reservationDto.setTableNumber(table.getNumber());
        reservationDto.setTableSeats(table.getSeats());
        return reservationDto;
    }

    public List<ReservationDto> mapToReservationDtoList(List<Reservation> reservations,
                                                        List<GameDto> games,
                                                        List<TableDto> tables) {
        Map<Long, GameDto> gameMap = games.stream()
                .collect(Collectors.toMap(GameDto::getId, Function.identity()));

        Map<Long, TableDto> tableMap = tables.stream()
                .collect(Collectors.toMap(TableDto::getId, Function.identity()));

        return reservations.stream()
                .map(reservation -> {
                    GameDto game = gameMap.get(reservation.getGameId());
                    TableDto table = tableMap.get(reservation.getTableId());
                    return mapToReservationDto(reservation, game, table);
                })
                .collect(Collectors.toList());
    }
}
