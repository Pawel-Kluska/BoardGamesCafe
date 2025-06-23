package com.adminmicroservice;

import com.adminmicroservice.dto.AllGamesAndTablesDto;
import com.adminmicroservice.entities.Game;
import com.adminmicroservice.entities.Table;
import com.adminmicroservice.services.GameService;
import com.adminmicroservice.services.TableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class MainController {

    private final GameService gameService;
    private final TableService tableService;

    @GetMapping
    public ResponseEntity<AllGamesAndTablesDto> getAllGamesAndTables() {
        AllGamesAndTablesDto response = new AllGamesAndTablesDto();
        response.setGames(gameService.getAllGames());
        response.setTables(tableService.getAllTables());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/games")
    public ResponseEntity<Game> addNewGame(@RequestBody Game game) {
        return ResponseEntity.ok(gameService.addNewGame(game));
    }
    @PutMapping("/games")
    public ResponseEntity<Game> updateGame(@RequestBody Game game) {
        return ResponseEntity.ok(gameService.updateGame(game));
    }

    @DeleteMapping("/games")
    public ResponseEntity<Game> deleteGame(@RequestBody Game game) {
        gameService.deleteGame(game);
        return ResponseEntity.ok().build();
    }


    @PostMapping("/tables")
    public ResponseEntity<Table> addNewTable(@RequestBody Table table) {
        return ResponseEntity.ok(tableService.addNewTable(table));
    }
    @PutMapping("/tables")
    public ResponseEntity<Table> updateTable(@RequestBody Table table) {
        return ResponseEntity.ok(tableService.updateTable(table));
    }
    @DeleteMapping("/tables")
    public ResponseEntity<Table> deleteTable(@RequestBody Table table) {
        tableService.deleteTable(table);
        return ResponseEntity.ok().build();
    }
}
