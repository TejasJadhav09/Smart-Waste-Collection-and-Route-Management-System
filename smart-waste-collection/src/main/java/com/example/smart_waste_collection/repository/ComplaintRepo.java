package com.example.smart_waste_collection.repository;

import com.example.smart_waste_collection.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComplaintRepo extends JpaRepository<Complaint, Integer> {
}