package com.adminmicroservice.repositories;

import com.adminmicroservice.entities.Table;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TableRepository extends JpaRepository<Table, Long> {
}
