package com.example.smart_waste_collection.repository;

import com.example.smart_waste_collection.entity.BinReading;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface BinReadingRepo extends JpaRepository<BinReading, Integer> {
    List<BinReading> findTop2ByBinIdOrderByRecordedAtDesc(int binId);
}