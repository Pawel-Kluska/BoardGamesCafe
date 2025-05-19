package com.reservationmicroservice.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.reservationmicroservice.entities.Status;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class ReservationDto {
    private Long id;
    private Long tableId;
    private String tableNumber;
    private Integer tableSeats;
    private String email;
    private Long gameId;
    private String gameName;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;
    @Enumerated(EnumType.STRING)
    private Status status;
}
