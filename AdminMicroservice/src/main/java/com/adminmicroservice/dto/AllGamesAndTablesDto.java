package com.adminmicroservice.dto;

import com.adminmicroservice.entities.Game;
import com.adminmicroservice.entities.Table;
import lombok.Data;

import java.util.List;

@Data
public class AllGamesAndTablesDto {
    private List<Table> tables;
    private List<Game> games;
}
