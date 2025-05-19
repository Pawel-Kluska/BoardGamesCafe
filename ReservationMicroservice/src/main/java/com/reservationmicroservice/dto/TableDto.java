package com.reservationmicroservice.dto;

import lombok.Data;

@Data
public class TableDto {
    private Long id;
    private String number;
    private Integer seats;
}
