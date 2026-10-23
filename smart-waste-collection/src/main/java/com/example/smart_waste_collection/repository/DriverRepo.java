package com.example.smart_waste_collection.repository;

import com.example.smart_waste_collection.entity.Driver;
import com.example.smart_waste_collection.entity.DriverStatus;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DriverRepo extends JpaRepository<Driver, Integer> {

    long countByStatus(DriverStatus status);

    Optional<Driver> findByUserId(Integer userId);
}