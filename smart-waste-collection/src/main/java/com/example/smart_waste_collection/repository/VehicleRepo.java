package com.example.smart_waste_collection.repository;

import com.example.smart_waste_collection.entity.Vehicle;
import com.example.smart_waste_collection.entity.VehicleStatus;

import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleRepo extends JpaRepository<Vehicle, Integer> {
    long countByStatus(VehicleStatus status);
}