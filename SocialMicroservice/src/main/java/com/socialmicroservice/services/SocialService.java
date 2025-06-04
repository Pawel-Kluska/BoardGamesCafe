package com.socialmicroservice.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.socialmicroservice.DataMapper;
import com.socialmicroservice.dto.AllGamesAndTablesDto;
import com.socialmicroservice.dto.SessionDto;
import com.socialmicroservice.dto.UserDto;
import com.socialmicroservice.entities.Session;
import com.socialmicroservice.keycloak.KeycloakUserService;
import com.socialmicroservice.rabbit.RabbitRpcClient;
import com.socialmicroservice.respositories.SocialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SocialService {

    private final SocialRepository socialRepository;
    private final DataMapper dataMapper;
    private final RabbitRpcClient rabbitClient;
    private final KeycloakUserService keycloakUserService;

    public List<SessionDto> getSessions(String email) throws JsonProcessingException {
        List<Session> sessions = socialRepository.findBySessionUsers_Email(email);
        AllGamesAndTablesDto allGamesAndTables = rabbitClient.getAllGamesAndTables();
        List<UserDto> users = keycloakUserService.getAllUsers();
        return dataMapper.mapToSessionDtoList(sessions, allGamesAndTables.getGames(), allGamesAndTables.getTables(), users);
    }

    public List<SessionDto> getSessions(LocalDate localDate) throws JsonProcessingException {
        List<Session> sessions = socialRepository.findByDate(localDate);
        AllGamesAndTablesDto allGamesAndTables = rabbitClient.getAllGamesAndTables();
        List<UserDto> users = keycloakUserService.getAllUsers();
        return dataMapper.mapToSessionDtoList(sessions, allGamesAndTables.getGames(), allGamesAndTables.getTables(), users);
    }

    public Session createSession(Session sessionData) {
        sessionData.setEndTime(sessionData.getStartTime().plusHours(2));
        return socialRepository.save(sessionData);
    }
}
