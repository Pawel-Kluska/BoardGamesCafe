package com.socialmicroservice.entities;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "session")
@Data
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long gameId;
    private Long tableId;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<SessionUser> sessionUsers;

    public void addSessionUser(SessionUser sessionUser) {
        sessionUsers.add(sessionUser);
        sessionUser.setSession(this);
    }

    public void removeSessionUser(SessionUser sessionUser) {
        sessionUsers.remove(sessionUser);
        sessionUser.setSession(null);
    }
}
