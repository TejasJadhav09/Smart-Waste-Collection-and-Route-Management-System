package com.example.smart_waste_collection.service;

import com.example.smart_waste_collection.dto.NearestRequestDTO;
import com.example.smart_waste_collection.dto.RouteCandidateDTO;
import com.example.smart_waste_collection.dto.RoutingResultDTO;
import com.example.smart_waste_collection.entity.Bin;
import com.example.smart_waste_collection.entity.CollectionRequest;
import com.example.smart_waste_collection.entity.Driver;
import com.example.smart_waste_collection.entity.DriverLocation;
import com.example.smart_waste_collection.entity.RequestStatus;
import com.example.smart_waste_collection.entity.Route;
import com.example.smart_waste_collection.entity.RouteStatus;
import com.example.smart_waste_collection.entity.RouteStop;
import com.example.smart_waste_collection.entity.Vehicle;
import com.example.smart_waste_collection.repository.CollectionRequestRepo;
import com.example.smart_waste_collection.repository.DriverLocationRepo;
import com.example.smart_waste_collection.repository.DriverRepo;
import com.example.smart_waste_collection.repository.RouteRepo;
import com.example.smart_waste_collection.repository.RouteStopRepo;
import com.example.smart_waste_collection.repository.VehicleRepo;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;


@Service
public class RouteService {

    private final RouteRepo routeRepo;
    private final DriverRepo driverRepo;
    private final VehicleRepo vehicleRepo;
    private final RouteStopRepo routeStopRepo;
    private final DriverLocationRepo driverLocationRepo;
private final DistanceService distanceService;
private final CollectionRequestRepo collectionRequestRepo;
private final RoutingService routingService;
   public RouteService(
        RouteRepo routeRepo,
        DriverRepo driverRepo,
        VehicleRepo vehicleRepo,
        RouteStopRepo routeStopRepo,
        CollectionRequestRepo collectionRequestRepo,
        DriverLocationRepo driverLocationRepo,
        DistanceService distanceService,
        RoutingService routingService) {

    this.routeRepo = routeRepo;
    this.driverRepo = driverRepo;
    this.vehicleRepo = vehicleRepo;
    this.routeStopRepo = routeStopRepo;
    this.collectionRequestRepo = collectionRequestRepo;
    this.driverLocationRepo = driverLocationRepo;
    this.distanceService = distanceService;
    this.routingService = routingService;
}

   
public Route createRoute(int driverId, int vehicleId) {

    Driver driver = driverRepo.findById(driverId)
            .orElseThrow(() ->
                    new RuntimeException("Driver not found"));

    Vehicle vehicle = vehicleRepo.findById(vehicleId)
            .orElseThrow(() ->
                    new RuntimeException("Vehicle not found"));

    if (driver.getStatus() == com.example.smart_waste_collection.entity.DriverStatus.OFF_DUTY) {
        throw new RuntimeException(
                "This driver is off duty and cannot be assigned a route");
    }

    if (vehicle.getStatus() != com.example.smart_waste_collection.entity.VehicleStatus.AVAILABLE) {
        throw new RuntimeException(
                "This vehicle is not available for a new route");
    }

    Route route = new Route(
            LocalDateTime.now(),
            RouteStatus.PLANNED,
            driver,
            vehicle
    );

    return routeRepo.save(route);
}


    public List<Route> getAllRoutes() {
        return routeRepo.findAll();
    }

    public RouteStop addStop(int routeId, int requestId) {

    Route route = routeRepo.findById(routeId)
            .orElseThrow(() ->
                    new RuntimeException("Route not found"));


    

    CollectionRequest request = collectionRequestRepo.findById(requestId)
            .orElseThrow(() ->
                    new RuntimeException("Collection request not found"));



    if (request.getStatus() == RequestStatus.COMPLETED
        || request.getStatus() == RequestStatus.CANCELLED) {

    throw new RuntimeException(
            "Completed or cancelled requests cannot be added to a route");
}



if (routeStopRepo.existsByRouteIdAndCollectionRequestId(
        routeId, requestId)) {

    throw new RuntimeException(
            "This collection request is already added to this route");
}
    List<RouteStop> existingStops =
            routeStopRepo.findByRouteIdOrderByStopOrderAsc(routeId);

    int nextOrder = existingStops.size() + 1;

    RouteStop routeStop = new RouteStop(
            nextOrder,
            route,
            request
    );

    return routeStopRepo.save(routeStop);
}
public List<RouteStop> getRouteStops(int routeId) {

    routeRepo.findById(routeId)
            .orElseThrow(() ->
                    new RuntimeException("Route not found"));

    return routeStopRepo.findByRouteIdOrderByStopOrderAsc(routeId);
}


public Route updateRouteStatus(int routeId, RouteStatus newStatus) {

    Route route = routeRepo.findById(routeId)
            .orElseThrow(() ->
                    new RuntimeException("Route not found"));

    RouteStatus currentStatus = route.getStatus();

    boolean valid = false;

    if (currentStatus == RouteStatus.PLANNED) {
        valid = newStatus == RouteStatus.IN_PROGRESS
                || newStatus == RouteStatus.CANCELLED;
    }
    else if (currentStatus == RouteStatus.IN_PROGRESS) {
        valid = newStatus == RouteStatus.COMPLETED
                || newStatus == RouteStatus.CANCELLED;
    }

    if (!valid) {
        throw new RuntimeException(
                "Invalid route status transition: "
                + currentStatus + " -> " + newStatus);
    }

    route.setStatus(newStatus);

    return routeRepo.save(route);
}



@Transactional
public void completeRouteIfAllRequestsCompleted(int requestId) {

    List<RouteStop> stops =
            routeStopRepo.findByCollectionRequestId(requestId);

    for (RouteStop stop : stops) {

        int routeId = stop.getRoute().getId();

        Route route = routeRepo.findById(routeId)
                .orElseThrow(() ->
                        new RuntimeException("Route not found"));

        // Only automatically complete routes currently in progress
        if (route.getStatus() != RouteStatus.IN_PROGRESS) {
            continue;
        }

        List<RouteStop> routeStops =
                routeStopRepo.findByRouteIdOrderByStopOrderAsc(routeId);

        if (routeStops.isEmpty()) {
            continue;
        }

        boolean allCompleted = routeStops.stream()
                .allMatch(routeStop ->
                        routeStop.getCollectionRequest().getStatus()
                                == RequestStatus.COMPLETED);

        if (allCompleted) {
            updateRouteStatus(routeId, RouteStatus.COMPLETED);
        }
    }
}


public NearestRequestDTO findNearestRequest(int driverId) {

    DriverLocation latestLocation =
            driverLocationRepo
                    .findTop1ByDriverIdOrderByRecordedAtDesc(driverId)
                    .stream()
                    .findFirst()
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "No location found for driver"));

    List<CollectionRequest> requests =
            collectionRequestRepo.findByDriverIdAndStatus(
                    driverId,
                    RequestStatus.ASSIGNED);

    if (requests.isEmpty()) {
        throw new RuntimeException(
                "No assigned collection requests found");
    }

    CollectionRequest nearestRequest = null;
    double shortestDistance = Double.MAX_VALUE;

    for (CollectionRequest request : requests) {
if (routeStopRepo.existsByCollectionRequestId(request.getId())) {
    continue;
}


        Bin bin = request.getBin();

        double distance =
                distanceService.calculateDistance(
                        latestLocation.getLatitude(),
                        latestLocation.getLongitude(),
                        bin.getLatitude(),
                        bin.getLongitude()
                );

        if (distance < shortestDistance) {
            shortestDistance = distance;
            nearestRequest = request;
        }
    }
if (nearestRequest == null) {
    throw new RuntimeException(
            "No unrouted collection requests available");
}
    Bin nearestBin = nearestRequest.getBin();

    return new NearestRequestDTO(
            nearestRequest.getId(),
            nearestBin.getId(),
            nearestBin.getLocationName(),
            shortestDistance
    );
}

public List<RouteCandidateDTO> getRouteCandidates(int driverId) {

    DriverLocation latestLocation =
            driverLocationRepo
                    .findTop1ByDriverIdOrderByRecordedAtDesc(driverId)
                    .stream()
                    .findFirst()
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "No location found for driver"));

    List<CollectionRequest> requests =
            collectionRequestRepo.findByDriverIdAndStatus(
                    driverId,
                    RequestStatus.ASSIGNED);

    List<RouteCandidateDTO> candidates = new ArrayList<>();

    for (CollectionRequest request : requests) {

        if (routeStopRepo.existsByCollectionRequestId(request.getId())) {
            continue;
        }

        Bin bin = request.getBin();
RoutingResultDTO routingResult =
        routingService.getDrivingRoute(
                latestLocation.getLatitude(),
                latestLocation.getLongitude(),
                bin.getLatitude(),
                bin.getLongitude()
        );

double distance =
        routingResult.getDistanceKm();
     int priorityWeight =
        getPriorityWeight(request.getPriority().name());

double score =
        priorityWeight / (distance + 1);
        candidates.add(
               new RouteCandidateDTO(
        request.getId(),
        bin.getId(),
        bin.getLocationName(),
        bin.getLatitude(),
        bin.getLongitude(),
        distance,
        request.getPriority().name(),
        score
)
        );
    }

    if (candidates.isEmpty()) {
        throw new RuntimeException(
                "No unrouted collection requests available");
    }
candidates.sort(
        Comparator.comparingDouble(
                RouteCandidateDTO::getPriorityScore
        ).reversed()
);
    return candidates;
}


private int getPriorityWeight(String priority) {

    return switch (priority) {
        case "CRITICAL" -> 4;
        case "HIGH" -> 3;
        case "MEDIUM" -> 2;
        case "LOW" -> 1;
        default -> 1;
    };
}

public List<RouteCandidateDTO> planRoute(int driverId) {

    DriverLocation latestLocation =
            driverLocationRepo
                    .findTop1ByDriverIdOrderByRecordedAtDesc(driverId)
                    .stream()
                    .findFirst()
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "No location found for driver"));

    List<CollectionRequest> requests =
            collectionRequestRepo.findByDriverIdAndStatus(
                    driverId,
                    RequestStatus.ASSIGNED);

    List<CollectionRequest> remainingRequests =
            new ArrayList<>();

    for (CollectionRequest request : requests) {

        if (!routeStopRepo.existsByCollectionRequestId(
                request.getId())) {

            remainingRequests.add(request);
        }
    }

    if (remainingRequests.isEmpty()) {
        throw new RuntimeException(
                "No unrouted collection requests available");
    }

    List<RouteCandidateDTO> plannedRoute =
            new ArrayList<>();

    double currentLatitude =
            latestLocation.getLatitude();

    double currentLongitude =
            latestLocation.getLongitude();

    while (!remainingRequests.isEmpty()) {

        CollectionRequest bestRequest = null;
        double bestScore = -1;
        double bestDistance = 0;

        for (CollectionRequest request : remainingRequests) {

            Bin bin = request.getBin();

          RoutingResultDTO routingResult =
        routingService.getDrivingRoute(
                currentLatitude,
                currentLongitude,
                bin.getLatitude(),
                bin.getLongitude()
        );

double distance =
        routingResult.getDistanceKm();

            int priorityWeight =
                    getPriorityWeight(
                            request.getPriority().name());

            double score =
                    priorityWeight / (distance + 1);

            if (score > bestScore) {
                bestScore = score;
                bestRequest = request;
                bestDistance = distance;
            }
        }

        Bin selectedBin = bestRequest.getBin();

        plannedRoute.add(
                new RouteCandidateDTO(
                        bestRequest.getId(),
                        selectedBin.getId(),
                        selectedBin.getLocationName(),
                        selectedBin.getLatitude(),
                        selectedBin.getLongitude(),
                        bestDistance,
                        bestRequest.getPriority().name(),
                        bestScore
                )
        );

        currentLatitude = selectedBin.getLatitude();
        currentLongitude = selectedBin.getLongitude();

        remainingRequests.remove(bestRequest);
    }

    return plannedRoute;
}



@Transactional
public Route autoPlanRoute(int driverId, int vehicleId) {

    // Find an existing planned route for this driver
    Route existingRoute = routeRepo.findFirstByDriverIdAndStatus(
            driverId,
            RouteStatus.PLANNED
    ).orElse(null);

    // Reuse the existing route when one is available
    if (existingRoute != null) {

        if (existingRoute.getVehicle().getId() != vehicleId) {
            throw new RuntimeException(
                    "Select the vehicle already assigned to this route"
            );
        }

        List<RouteStop> existingStops =
                routeStopRepo.findByRouteIdOrderByStopOrderAsc(
                        existingRoute.getId()
                );

        if (existingStops.isEmpty()) {
            throw new RuntimeException(
                    "This planned route has no stops to optimize"
            );
        }

        DriverLocation latestLocation =
                driverLocationRepo
                        .findTop1ByDriverIdOrderByRecordedAtDesc(driverId)
                        .stream()
                        .findFirst()
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No location found for driver"
                                )
                        );

        double currentLatitude = latestLocation.getLatitude();
        double currentLongitude = latestLocation.getLongitude();

        List<RouteStop> remainingStops =
                new ArrayList<>(existingStops);

        List<RouteStop> optimizedStops = new ArrayList<>();

        // Reorder existing stops using priority and driving distance
        while (!remainingStops.isEmpty()) {

            RouteStop bestStop = null;
            double bestScore = -1;

            for (RouteStop stop : remainingStops) {

                CollectionRequest request =
                        stop.getCollectionRequest();

                Bin bin = request.getBin();

                RoutingResultDTO routingResult =
                        routingService.getDrivingRoute(
                                currentLatitude,
                                currentLongitude,
                                bin.getLatitude(),
                                bin.getLongitude()
                        );

                double distance = routingResult.getDistanceKm();

                int priorityWeight =
                        getPriorityWeight(request.getPriority().name());

                double score = priorityWeight / (distance + 1);

                if (score > bestScore) {
                    bestScore = score;
                    bestStop = stop;
                }
            }

            optimizedStops.add(bestStop);

            Bin selectedBin = bestStop.getCollectionRequest().getBin();

            currentLatitude = selectedBin.getLatitude();
            currentLongitude = selectedBin.getLongitude();

            remainingStops.remove(bestStop);
        }

        // Update the existing stop order
        for (int i = 0; i < optimizedStops.size(); i++) {
            optimizedStops.get(i).setStopOrder(i + 1);
        }

        routeStopRepo.saveAll(optimizedStops);

        return routeRepo.findById(existingRoute.getId())
                .orElseThrow(() ->
                        new RuntimeException("Route not found")
                );
    }

    // No existing planned route: use the original behavior
    List<RouteCandidateDTO> plannedRoute = planRoute(driverId);

    Route route = createRoute(driverId, vehicleId);

    for (RouteCandidateDTO candidate : plannedRoute) {
        addStop(route.getId(), candidate.getRequestId());
    }

    return routeRepo.findById(route.getId())
            .orElseThrow(() ->
                    new RuntimeException("Route not found")
            );
}


public RoutingResultDTO getRoadRoute(
        double startLatitude,
        double startLongitude,
        double endLatitude,
        double endLongitude) {

    return routingService.getDrivingRoute(
            startLatitude,
            startLongitude,
            endLatitude,
            endLongitude
    );
}
}