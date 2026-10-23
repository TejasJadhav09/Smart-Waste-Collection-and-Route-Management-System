package com.example.smart_waste_collection.repository;

import com.example.smart_waste_collection.entity.DriverLocation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DriverLocationRepo
        extends JpaRepository<DriverLocation, Integer> {

    List<DriverLocation> findTop1ByDriverIdOrderByRecordedAtDesc(
            int driverId
    );
}