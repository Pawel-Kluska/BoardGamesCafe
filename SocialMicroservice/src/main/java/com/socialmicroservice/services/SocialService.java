package com.socialmicroservice.services;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.socialmicroservice.DataMapper;
import com.socialmicroservice.dto.AllGamesAndTablesDto;
import com.socialmicroservice.dto.SessionDto;
import com.socialmicroservice.dto.TableDto;
import com.socialmicroservice.dto.UserDto;
import com.socialmicroservice.entities.Session;
import com.socialmicroservice.entities.SessionUser;
import com.socialmicroservice.keycloak.KeycloakUserService;
import com.socialmicroservice.rabbit.RabbitRpcClient;
import com.socialmicroservice.respositories.SocialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SocialService {

    private final SocialRepository socialRepository;
    private final DataMapper dataMapper;
    private final RabbitRpcClient rabbitClient;
    private final KeycloakUserService keycloakUserService;
    private final EmailService emailService;

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

    public Session addToSession(Session sessionData) throws JsonProcessingException {
        List<Session> sessionsAtTime = socialRepository.findByDate(sessionData.getDate())
                .stream()
                .filter(session -> session.getStartTime().equals(sessionData.getStartTime()))
                .toList();

        sessionsAtTime.stream()
                .filter(session -> session.getSessionUsers().stream()
                .anyMatch(user -> user.getEmail().equals(sessionData.getSessionUsers().get(0).getEmail())))
                .findFirst()
                .ifPresent(session -> {
                    throw new IllegalArgumentException("User already assigned to a session at this time");
                });

        Optional<Session> existingSession = sessionsAtTime.stream()
                .filter(session -> session.getGameId().equals(sessionData.getGameId()))
                .findFirst();

        AllGamesAndTablesDto allGamesAndTables = rabbitClient.getAllGamesAndTables();

        List<TableDto> allAvailableTables = getAvailableTables(sessionsAtTime, allGamesAndTables);

        if (existingSession.isPresent()) {
            Session session = existingSession.get();
            SessionUser sessionUser = new SessionUser();
            sessionUser.setEmail(sessionData.getSessionUsers().get(0).getEmail());
            session.addSessionUser(sessionUser);

            if (isSessionFull(session, allGamesAndTables)) {
                findBiggerSessionTable(allAvailableTables, session.getSessionUsers().size())
                        .ifPresentOrElse(
                            table -> session.setTableId(table.getId()),
                            () -> {
                                throw new IllegalArgumentException("No available table with enough seats for the session");
                            }
                        );
            }

            emailService.sendEmail(
                    sessionData.getSessionUsers().get(0).getEmail(),
                    "Guest",
                    "You've been added to a session",
                    "You have been added to a game session on " + session.getDate() + " at " + session.getStartTime(),
                    "<p>You have been <strong>added</strong> to a session on " + session.getDate() + " at " + session.getStartTime() + ".</p>"
            );

            return socialRepository.save(session);
        } else {

            Session newSession = createNewSession(sessionData, allAvailableTables);

            emailService.sendEmail(
                    sessionData.getSessionUsers().get(0).getEmail(),
                    "Guest",
                    "Session created",
                    "You have created a session on " + newSession.getDate() + " at " + newSession.getStartTime(),
                    "<p>You have <strong>created</strong> a session on " + newSession.getDate() + " at " + newSession.getStartTime() + ".</p>"
            );

            return newSession;
        }
    }

    public Session deleteFromSession(Long id, String email) throws JsonProcessingException {
        Session session = socialRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));

        SessionUser sessionUser = session.getSessionUsers()
                .stream()
                .filter(user -> user.getEmail().equals(email))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("User not found in session"));

        session.removeSessionUser(sessionUser);

        List<Session> sessionsAtTime = socialRepository.findByDate(session.getDate())
                .stream()
                .filter(s -> session.getStartTime().equals(s.getStartTime()))
                .toList();

        Optional<Session> existingSession = sessionsAtTime.stream()
                .filter(s -> session.getGameId().equals(s.getGameId()))
                .findFirst();

        AllGamesAndTablesDto allGamesAndTables = rabbitClient.getAllGamesAndTables();
        List<TableDto> allAvailableTables = getAvailableTables(sessionsAtTime, allGamesAndTables);

        emailService.sendEmail(
                email,
                "Guest",
                "You've been removed from a session",
                "You have been removed from a session on " + session.getDate() + " at " + session.getStartTime(),
                "<p>You have been <strong>removed</strong> from the session on " + session.getDate() + " at " + session.getStartTime() + ".</p>"
        );

        if (existingSession.isPresent()) {
            Session existing = existingSession.get();
            if (existing.getSessionUsers().isEmpty()) {
                socialRepository.delete(existing);
                return existing;
            } else {
                findSmallerSessionTable(allAvailableTables, existing.getSessionUsers().size())
                        .ifPresent(
                            table -> existing.setTableId(table.getId())
                        );
                return socialRepository.save(existing);
            }
        }
        return socialRepository.save(session);
    }

    private Optional<TableDto> findSmallerSessionTable(List<TableDto> availableTables, int maxSeats) {
        return availableTables.stream()
                .filter( table -> table.getSeats() == maxSeats)
                .findFirst();
    }

    private TableDto findTable(Long tableId, AllGamesAndTablesDto allGamesAndTables) {
        return allGamesAndTables.getTables()
                .stream()
                .filter(table -> table.getId().equals(tableId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Table not found"));
    }

    private boolean isSessionFull(Session session, AllGamesAndTablesDto allGamesAndTables) {
        return session.getSessionUsers().size() > findTable(session.getTableId(), allGamesAndTables).getSeats();
    }

    private Optional<TableDto> findBiggerSessionTable(List<TableDto> availableTables, Integer minSeats) {
        return availableTables.stream()
                .filter( table -> table.getSeats() >= minSeats)
                .findFirst();
    }

    private Session createNewSession(Session sessionData, List<TableDto> availableTables) {
        TableDto table = availableTables.stream()
                .min(Comparator.comparingInt(TableDto::getSeats))
                .orElseThrow(() -> new IllegalArgumentException("No available tables"));
        sessionData.setTableId(table.getId());
        sessionData.setEndTime(sessionData.getStartTime().plusHours(2));
        sessionData.setId(null);
        return socialRepository.save(sessionData);
    }

    private List<TableDto> getAvailableTables(List<Session> sessionsAtTime, AllGamesAndTablesDto allGamesAndTables) throws JsonProcessingException {

        Set<Long> occupiedTableIds = sessionsAtTime.stream()
                .map(Session::getTableId)
                .collect(Collectors.toSet());

        return allGamesAndTables.getTables().stream()
                .filter(table -> !occupiedTableIds.contains(table.getId()))
                .toList();
    }
}