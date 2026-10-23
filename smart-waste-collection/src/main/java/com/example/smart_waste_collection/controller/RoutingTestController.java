package com.example.smart_waste_collection.controller;

import com.example.smart_waste_collection.dto.RoutingResultDTO;
import com.example.smart_waste_collection.service.RoutingService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/routing-test")
public class RoutingTestController {

    private final RoutingService routingService;

    public RoutingTestController(RoutingService routingService) {
        this.routingService = routingService;
    }

    @GetMapping
    public RoutingResultDTO testRouting(
            @RequestParam double startLatitude,
            @RequestParam double startLongitude,
            @RequestParam double endLatitude,
            @RequestParam double endLongitude) {

        return routingService.getDrivingRoute(
                startLatitude,
                startLongitude,
                endLatitude,
                endLongitude
        );
    }
}