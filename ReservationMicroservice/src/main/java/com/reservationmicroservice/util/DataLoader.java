package com.reservationmicroservice.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reservationmicroservice.entities.Reservation;
import com.reservationmicroservice.repositories.ReservationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.InputStream;
import java.util.List;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner loadData(ReservationRepository repository, ObjectMapper objectMapper) {
        return args -> {

            // GAMES
            if (repository.count() == 0) {
                try (InputStream input = getClass().getResourceAsStream("/reservations.json")) {
                    if (input != null) {
                        List<Reservation> reservations = objectMapper.readValue(input, new TypeReference<>() {});
                        repository.saveAll(reservations);

                    } else {
                        System.err.println("reservations.json doesn't exist");
                    }
                }
            }
        };
    }


}
