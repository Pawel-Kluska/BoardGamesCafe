package com.adminmicroservice.services;

import com.adminmicroservice.entities.Table;
import com.adminmicroservice.repositories.TableRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TableService {
    private final TableRepository tableRepository;

    public List<Table> getAllTables() {
        return tableRepository.findAll();
    }

    public Table addNewTable(Table table) {
        table.setId(null);
        return tableRepository.save(table);
    }

    public Table updateTable(Table table) {
        if (table.getId() == null) throw new EntityNotFoundException();
        return tableRepository.save(table);
    }

    public void deleteTable(Table game) {
        tableRepository.deleteById(game.getId());
    }
}
