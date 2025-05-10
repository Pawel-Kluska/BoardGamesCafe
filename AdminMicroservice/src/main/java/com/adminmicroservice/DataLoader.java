package com.adminmicroservice;

import com.adminmicroservice.entities.Game;
import com.adminmicroservice.entities.Table;
import com.adminmicroservice.repositories.GameRepository;
import com.adminmicroservice.repositories.TableRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.InputStream;
import java.util.List;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner loadData(GameRepository gameRepo, TableRepository tableRepo) {
        return args -> {
            ObjectMapper mapper = new ObjectMapper();

            // GAMES
            if (gameRepo.count() == 0) {
                try (InputStream input = getClass().getResourceAsStream("/games.json")) {
                    if (input != null) {
                        List<Game> games = mapper.readValue(input, new TypeReference<>() {});
                        gameRepo.saveAll(games);

                    } else {
                        System.err.println("games.json doesn't exist");
                    }
                }
            }

            // TABLES
            if (tableRepo.count() == 0) {
                try (InputStream input = getClass().getResourceAsStream("/tables.json")) {
                    if (input != null) {
                        List<Table> tables = mapper.readValue(input, new TypeReference<>() {});
                        tableRepo.saveAll(tables);

                    } else {
                        System.err.println("tables.json  doesn't exist");
                    }
                }
            }
        };
    }


}
