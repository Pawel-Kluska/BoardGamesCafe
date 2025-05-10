package com.adminmicroservice.repositories;

import com.adminmicroservice.entities.Game;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GameRepository extends JpaRepository<Game, Long> {
}
