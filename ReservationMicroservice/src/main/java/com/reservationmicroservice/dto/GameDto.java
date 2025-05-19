package com.reservationmicroservice.dto;

import lombok.Data;

@Data
public class GameDto {
    private Long id;
    private String name;
    private Integer minPlayers;
    private Integer maxPlayers;
}
