
package com.example.smart_waste_collection.repository;

import com.example.smart_waste_collection.entity.Route;
import com.example.smart_waste_collection.entity.RouteStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RouteRepo extends JpaRepository<Route, Integer> {

    Optional<Route> findFirstByDriverIdAndStatus(
            int driverId,
            RouteStatus status
    );

    List<Route> findByDriverIdAndStatus(
            int driverId,
            RouteStatus status
    );
}
