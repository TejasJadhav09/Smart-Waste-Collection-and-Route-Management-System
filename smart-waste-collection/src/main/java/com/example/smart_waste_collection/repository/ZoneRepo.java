package com.example.smart_waste_collection.repository;



import org.springframework.data.jpa.repository.JpaRepository;

import com.example.smart_waste_collection.entity.Zone;

public interface ZoneRepo extends JpaRepository<Zone, Integer> {
}
