package com.socialmicroservice.dto;

import lombok.Data;

import java.util.List;

@Data
public class AllGamesAndTablesDto {
    private List<TableDto> tables;
    private List<GameDto> games;
}
