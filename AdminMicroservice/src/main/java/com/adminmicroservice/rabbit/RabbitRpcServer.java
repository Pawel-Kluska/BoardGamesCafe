package com.adminmicroservice.rabbit;

import com.adminmicroservice.dto.AllGamesAndTablesDto;
import com.adminmicroservice.entities.Game;
import com.adminmicroservice.entities.Table;
import com.adminmicroservice.services.GameService;
import com.adminmicroservice.services.TableService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import com.fasterxml.jackson.databind.JsonNode;

/*example payloads:
Get all games and tables:
{
  "action": "getAllGamesAndTables"
}
Add new game:
{
  "action": "addNewGame",
  "name": "Chess",
  "minPlayers": 2,
  "maxPlayers": 2
}
Update game:
{
  "action": "updateGame",
  "id": 1,
  "name": "Chess",
  "minPlayers": 2,
  "maxPlayers": 4
}
Delete game:
{
  "action": "deleteGame",
  "id": 1
}
Add new table:
{
  "action": "addNewTable",
  "number": "T1",
  "seats": 4
}
Update table:
{
  "action": "updateTable",
  "id": 1,
  "number": "T1",
  "seats": 6
}
Delete table:
{
  "action": "deleteTable",
  "id": 1
}
 */

//TODO (jasiex01): add error handling
@Component
public class RabbitRpcServer {

    private final GameService gameService;
    private final TableService tableService;
    private final ObjectMapper objectMapper;

    public RabbitRpcServer(GameService gameService, TableService tableService, ObjectMapper objectMapper) {
        this.gameService = gameService;
        this.tableService = tableService;
        this.objectMapper = objectMapper;
    }

    @RabbitListener(queues = "admin.rpc.queue")
    public String handleIncomingRpc(String requestJson) {
        try {
            System.out.println("Received RPC request: " + requestJson);

            JsonNode requestNode = objectMapper.readTree(requestJson);
            String action = requestNode.has("action") ? requestNode.get("action").asText() : null;

            if (action == null) {
                return "{\"status\": \"error\", \"message\": \"No action field present\"}";
            }

            switch (action) {
                case "getAllGamesAndTables":
                    System.out.println("Processing 'getAllGamesAndTables' request.");
                    return handleGetAllGamesAndTables();
                case "addNewGame":
                    System.out.println("Processing 'addNewGame' request.");
                    return handleAddNewGame(requestJson);
                case "updateGame":
                    System.out.println("Processing 'updateGame' request.");
                    return handleUpdateGame(requestJson);
                case "deleteGame":
                    System.out.println("Processing 'deleteGame' request.");
                    return handleDeleteGame(requestJson);
                case "addNewTable":
                    System.out.println("Processing 'addNewTable' request.");
                    return handleAddNewTable(requestJson);
                case "updateTable":
                    System.out.println("Processing 'updateTable' request.");
                    return handleUpdateTable(requestJson);
                case "deleteTable":
                    System.out.println("Processing 'deleteTable' request.");
                    return handleDeleteTable(requestJson);
                default:
                    System.out.println("Invalid action: " + action);
                    return "{\"status\": \"error\", \"message\": \"Invalid action\"}";
            }
        } catch (Exception e) {
            System.out.println("Error processing RPC request: " + e.getMessage());
            return "{\"status\": \"error\", \"message\": \"Failed to process the request\"}";
        }
    }

    private String handleGetAllGamesAndTables() throws Exception {
        System.out.println("Fetching all games and tables.");
        AllGamesAndTablesDto response = new AllGamesAndTablesDto();
        response.setGames(gameService.getAllGames());
        response.setTables(tableService.getAllTables());
        String responseJson = objectMapper.writeValueAsString(response);
        System.out.println("Response: " + responseJson);
        return responseJson;
    }

    private String handleAddNewGame(String requestJson) throws Exception {
        System.out.println("Adding a new game: " + requestJson);
        Game game = objectMapper.readValue(requestJson, Game.class);
        Game savedGame = gameService.addNewGame(game);
        String responseJson = objectMapper.writeValueAsString(savedGame);
        System.out.println("New game added: " + responseJson);
        return responseJson;
    }

    private String handleUpdateGame(String requestJson) throws Exception {
        System.out.println("Updating game: " + requestJson);
        Game game = objectMapper.readValue(requestJson, Game.class);
        Game updatedGame = gameService.updateGame(game);
        String responseJson = objectMapper.writeValueAsString(updatedGame);
        System.out.println("Game updated: " + responseJson);
        return responseJson;
    }

    private String handleDeleteGame(String requestJson) throws Exception {
        System.out.println("Deleting game: " + requestJson);
        Game game = objectMapper.readValue(requestJson, Game.class);
        gameService.deleteGame(game);
        String responseJson = "{\"status\": \"ok\", \"message\": \"Game deleted successfully\"}";
        System.out.println("Game deleted: " + responseJson);
        return responseJson;
    }

    private String handleAddNewTable(String requestJson) throws Exception {
        System.out.println("Adding a new table: " + requestJson);
        Table table = objectMapper.readValue(requestJson, Table.class);
        Table savedTable = tableService.addNewTable(table);
        String responseJson = objectMapper.writeValueAsString(savedTable);
        System.out.println("New table added: " + responseJson);
        return responseJson;
    }

    private String handleUpdateTable(String requestJson) throws Exception {
        System.out.println("Updating table: " + requestJson);
        Table table = objectMapper.readValue(requestJson, Table.class);
        Table updatedTable = tableService.updateTable(table);
        String responseJson = objectMapper.writeValueAsString(updatedTable);
        System.out.println("Table updated: " + responseJson);
        return responseJson;
    }

    private String handleDeleteTable(String requestJson) throws Exception {
        System.out.println("Deleting table: " + requestJson);
        Table table = objectMapper.readValue(requestJson, Table.class);
        tableService.deleteTable(table);
        String responseJson = "{\"status\": \"ok\", \"message\": \"Table deleted successfully\"}";
        System.out.println("Table deleted: " + responseJson);
        return responseJson;
    }
}
