package com.example.smart_waste_collection.repository;

import com.example.smart_waste_collection.entity.Bin;
import com.example.smart_waste_collection.entity.BinStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BinRepo extends JpaRepository<Bin, Integer> {

    long countByStatus(BinStatus status);
}