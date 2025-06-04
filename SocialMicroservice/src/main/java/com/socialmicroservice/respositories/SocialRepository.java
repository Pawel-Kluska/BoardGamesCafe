package com.socialmicroservice.respositories;


import com.socialmicroservice.entities.Session;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface SocialRepository extends JpaRepository<Session, Long> {
    List<Session> findBySessionUsers_Email(String email);
    List<Session> findByDate(LocalDate date);
}
