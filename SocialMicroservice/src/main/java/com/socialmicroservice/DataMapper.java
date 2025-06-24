package com.socialmicroservice;


import com.socialmicroservice.dto.GameDto;
import com.socialmicroservice.dto.SessionDto;
import com.socialmicroservice.dto.TableDto;
import com.socialmicroservice.dto.UserDto;
import com.socialmicroservice.entities.Session;
import com.socialmicroservice.entities.SessionUser;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class DataMapper {

    public SessionDto mapToSessionDto(Session session, GameDto game, TableDto table) {
        SessionDto sessionDto = new SessionDto();
        sessionDto.setId(session.getId());
        sessionDto.setDate(session.getDate());
        sessionDto.setStartTime(session.getStartTime());
        sessionDto.setGameId(game.getId());
        sessionDto.setGameName(game.getName());
        sessionDto.setTableId(table.getId());
        sessionDto.setTableNumber(table.getNumber());
        sessionDto.setTableSeats(table.getSeats());
        sessionDto.setEndTime(session.getEndTime());
        sessionDto.setUserSessionEmails(session.getSessionUsers().stream()
                .map(SessionUser::getEmail)
                .collect(Collectors.toList()));
        return sessionDto;
    }

    public List<SessionDto> mapToSessionDtoList(List<Session> sessions,
                                                List<GameDto> games,
                                                List<TableDto> tables) {
        Map<Long, GameDto> gameMap = games.stream()
                .collect(Collectors.toMap(GameDto::getId, Function.identity()));

        Map<Long, TableDto> tableMap = tables.stream()
                .collect(Collectors.toMap(TableDto::getId, Function.identity()));

        return sessions.stream()
                .map(session -> {
                    GameDto game = gameMap.get(session.getGameId());
                    TableDto table = tableMap.get(session.getTableId());
                    return mapToSessionDto(session, game, table);

                })
                .collect(Collectors.toList());
    }
}
