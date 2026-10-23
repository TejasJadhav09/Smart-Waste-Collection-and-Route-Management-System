package com.example.smart_waste_collection.repository;

import com.example.smart_waste_collection.entity.CollectionRequest;
import com.example.smart_waste_collection.entity.RequestStatus;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CollectionRequestRepo
        extends JpaRepository<CollectionRequest, Integer> {
            List<CollectionRequest> findByBinIdAndStatusIn(
        int binId,
        List<RequestStatus> statuses
);

List<CollectionRequest> findByDriverIdAndStatus(
        int driverId,
        RequestStatus status);



          long countByStatus(RequestStatus status);
}