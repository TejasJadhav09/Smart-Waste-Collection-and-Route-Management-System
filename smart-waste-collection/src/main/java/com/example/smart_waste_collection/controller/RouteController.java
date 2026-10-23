package com.example.smart_waste_collection.controller;
import com.example.smart_waste_collection.dto.RoutingResultDTO;
import com.example.smart_waste_collection.dto.NearestRequestDTO;
import com.example.smart_waste_collection.dto.RouteCandidateDTO;
import com.example.smart_waste_collection.entity.Route;
import com.example.smart_waste_collection.entity.RouteStatus;
import com.example.smart_waste_collection.entity.RouteStop;
import com.example.smart_waste_collection.service.DistanceService;
import com.example.smart_waste_collection.service.RouteService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/routes")
public class RouteController {

    private final RouteService routeService;
    private final DistanceService distanceService;

  public RouteController(RouteService routeService,
                       DistanceService distanceService) {

    this.routeService = routeService;
    this.distanceService = distanceService;
}
    @PostMapping
    public Route createRoute(
            @RequestParam int driverId,
            @RequestParam int vehicleId) {

        return routeService.createRoute(driverId, vehicleId);
    }

    @GetMapping
    public List<Route> getAllRoutes() {
        return routeService.getAllRoutes();
    }


    @PostMapping("/{routeId}/stops")
public RouteStop addStop(
        @PathVariable int routeId,
        @RequestParam int requestId) {

    return routeService.addStop(routeId, requestId);
}

@GetMapping("/{routeId}/stops")
public List<RouteStop> getRouteStops(
        @PathVariable int routeId) {

    return routeService.getRouteStops(routeId);
}
@PutMapping("/{routeId}/status")
public Route updateRouteStatus(
        @PathVariable int routeId,
        @RequestParam RouteStatus status) {

    return routeService.updateRouteStatus(routeId, status);
}



@GetMapping("/distance")
public double calculateDistance(
        @RequestParam double latitude1,
        @RequestParam double longitude1,
        @RequestParam double latitude2,
        @RequestParam double longitude2) {

    return distanceService.calculateDistance(
            latitude1,
            longitude1,
            latitude2,
            longitude2);
}

@GetMapping("/nearest-request/{driverId}")
public NearestRequestDTO findNearestRequest(
        @PathVariable int driverId) {

    return routeService.findNearestRequest(driverId);
}
@GetMapping("/candidates/{driverId}")
public List<RouteCandidateDTO> getRouteCandidates(
        @PathVariable int driverId) {

    return routeService.getRouteCandidates(driverId);
}

@GetMapping("/plan/{driverId}")
public List<RouteCandidateDTO> planRoute(
        @PathVariable int driverId) {

    return routeService.planRoute(driverId);
}


@PostMapping("/auto-plan")
public Route autoPlanRoute(
        @RequestParam int driverId,
        @RequestParam int vehicleId) {

    return routeService.autoPlanRoute(
            driverId,
            vehicleId
    );
}


@GetMapping("/road-route")
public RoutingResultDTO getRoadRoute(
        @RequestParam double startLatitude,
        @RequestParam double startLongitude,
        @RequestParam double endLatitude,
        @RequestParam double endLongitude) {

    return routeService.getRoadRoute(
            startLatitude,
            startLongitude,
            endLatitude,
            endLongitude
    );
}
}