package com.socialmicroservice.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class SessionDto {

    private Long id;
    private Long tableId;
    private String tableNumber;
    private Integer tableSeats;
    private Long gameId;
    private String gameName;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;
    private List<String> userSessionEmails;
}
