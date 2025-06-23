package com.adminmicroservice.services;

import com.adminmicroservice.entities.Game;
import com.adminmicroservice.repositories.GameRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GameService {

    private final GameRepository gameRepository;

    public List<Game> getAllGames() {
        return gameRepository.findAll();
    }

    public Game addNewGame(Game game) {
        game.setId(null);
        return gameRepository.save(game);
    }

    public Game updateGame(Game game) {
        if (game.getId() == null) {
            throw new EntityNotFoundException();
        }
        return gameRepository.save(game);
    }

    public void deleteGame(Game game) {
        gameRepository.deleteById(game.getId());
    }
}
