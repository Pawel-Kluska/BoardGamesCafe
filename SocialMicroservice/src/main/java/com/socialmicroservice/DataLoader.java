package com.socialmicroservice;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.socialmicroservice.entities.Session;
import com.socialmicroservice.respositories.SocialRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.InputStream;
import java.util.List;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner loadData(SocialRepository repository, ObjectMapper objectMapper) {
        return args -> {

            // GAMES
            if (repository.count() == 0) {
                try (InputStream input = getClass().getResourceAsStream("/sessions.json")) {
                    if (input != null) {
                        List<Session> reservations = objectMapper.readValue(input, new TypeReference<>() {});
                        repository.saveAll(reservations);

                    } else {
                        System.err.println("sessions.json doesn't exist");
                    }
                }
            }
        };
    }


}
