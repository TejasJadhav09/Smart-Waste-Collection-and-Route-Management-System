
package com.example.smart_waste_collection.repository;

import com.example.smart_waste_collection.entity.RouteStop;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RouteStopRepo extends JpaRepository<RouteStop, Integer> {

    List<RouteStop> findByRouteIdOrderByStopOrderAsc(int routeId);

    boolean existsByCollectionRequestId(int collectionRequestId);

    boolean existsByRouteIdAndCollectionRequestId(
            int routeId,
            int collectionRequestId
    );


    
List<RouteStop> findByCollectionRequestId(int collectionRequestId);

}