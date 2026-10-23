package com.example.smart_waste_collection.service;

import com.example.smart_waste_collection.entity.CollectionRequest;
import com.example.smart_waste_collection.entity.DriverStatus;
import com.example.smart_waste_collection.entity.RequestPriority;
import com.example.smart_waste_collection.entity.RequestStatus;
import com.example.smart_waste_collection.entity.VehicleStatus;
import com.example.smart_waste_collection.exception.ActiveRequestExistsException;
import com.example.smart_waste_collection.exception.InvalidStatusTransitionException;
import com.example.smart_waste_collection.entity.Bin;
import com.example.smart_waste_collection.entity.BinStatus;
import com.example.smart_waste_collection.repository.CollectionRequestRepo;

import jakarta.transaction.Transactional;

import com.example.smart_waste_collection.repository.BinRepo;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CollectionRequestService {

    private final CollectionRequestRepo collectionRequestRepo;
    private final BinRepo binRepo;
private final RouteService routeService;
   public CollectionRequestService(
        CollectionRequestRepo collectionRequestRepo,
        BinRepo binRepo,
        RouteService routeService) {

    this.collectionRequestRepo = collectionRequestRepo;
    this.binRepo = binRepo;
    this.routeService = routeService;
}

   public CollectionRequest createRequest(int binId) {

    Bin bin = binRepo.findById(binId)
            .orElseThrow(() -> new RuntimeException("Bin not found"));


            List<RequestStatus> activeStatuses = List.of(
        RequestStatus.PENDING,
        RequestStatus.ASSIGNED,
        RequestStatus.IN_PROGRESS
);

List<CollectionRequest> activeRequests =
        collectionRequestRepo.findByBinIdAndStatusIn(
                binId,
                activeStatuses
        );

if (!activeRequests.isEmpty()) {
         throw new ActiveRequestExistsException(
        "An active collection request already exists for this bin"
); 
}


    double fillPercentage =
            (bin.getCurrentFillLevel() / bin.getCapacity()) * 100;

    RequestPriority priority;

    if (fillPercentage < 30) {
        priority = RequestPriority.LOW;
    } else if (fillPercentage < 60) {
        priority = RequestPriority.MEDIUM;
    } else if (fillPercentage < 80) {
        priority = RequestPriority.HIGH;
    } else {
        priority = RequestPriority.CRITICAL;
    }

    CollectionRequest request = new CollectionRequest(
            bin,
            RequestStatus.PENDING,
            priority,
            LocalDateTime.now()
    );

    return collectionRequestRepo.save(request);
}

    public List<CollectionRequest> getAllRequests() {
        return collectionRequestRepo.findAll();
    }

    public List<CollectionRequest> getDriverRequests(
        int driverId) {

    List<CollectionRequest> assigned =
            collectionRequestRepo.findByDriverIdAndStatus(
                    driverId,
                    RequestStatus.ASSIGNED
            );

    List<CollectionRequest> inProgress =
            collectionRequestRepo.findByDriverIdAndStatus(
                    driverId,
                    RequestStatus.IN_PROGRESS
            );

    assigned.addAll(inProgress);

    return assigned;
}


    public CollectionRequest updateStatus(
        int requestId,
        RequestStatus newStatus) {

    CollectionRequest request =
            collectionRequestRepo.findById(requestId)
                    .orElseThrow(() ->
                            new RuntimeException("Collection request not found"));

                boolean validTransition=false;
                RequestStatus currentStatus=request.getStatus();

                    if (currentStatus == RequestStatus.PENDING) {
        validTransition =
                newStatus == RequestStatus.ASSIGNED ||
                
                newStatus == RequestStatus.CANCELLED;

    } else if (currentStatus == RequestStatus.ASSIGNED) {
        validTransition =
                newStatus == RequestStatus.IN_PROGRESS ||
                newStatus == RequestStatus.CANCELLED;

    } else if (currentStatus == RequestStatus.IN_PROGRESS) {
        validTransition =
                newStatus == RequestStatus.COMPLETED ||
                newStatus == RequestStatus.CANCELLED;
    }

    if (!validTransition) {
        throw new InvalidStatusTransitionException(
        "Invalid status transition from "
        + currentStatus
        + " to "
        + newStatus
        );}

    request.setStatus(newStatus);

    return collectionRequestRepo.save(request);
}



@Transactional
public CollectionRequest completeRequest(int requestId) {

    CollectionRequest request =
            collectionRequestRepo.findById(requestId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Collection request not found"));

    if (request.getStatus() != RequestStatus.IN_PROGRESS) {
        throw new RuntimeException(
                "Only IN_PROGRESS requests can be completed");
    }

    Bin bin = request.getBin();

    bin.setCurrentFillLevel(0);
    bin.setStatus(BinStatus.LOW);

    if (request.getDriver() != null) {
        request.getDriver().setStatus(DriverStatus.AVAILABLE);
    }

    if (request.getVehicle() != null) {
        request.getVehicle().setStatus(VehicleStatus.AVAILABLE);
    }

   request.setStatus(RequestStatus.COMPLETED);

CollectionRequest completedRequest =
        collectionRequestRepo.save(request);

routeService.completeRouteIfAllRequestsCompleted(requestId);

return completedRequest;}


@Transactional
public CollectionRequest completeRequestForDriver(
        int requestId, int driverId) {

    CollectionRequest request =
            collectionRequestRepo.findById(requestId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Collection request not found"));

    if (request.getDriver() == null
            || request.getDriver().getId() != driverId) {
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.FORBIDDEN,
                "You can only complete your own collection requests");
    }

    return completeRequest(requestId);
}


public CollectionRequest startRequestForDriver(
        int requestId, int driverId) {

    CollectionRequest request =
            collectionRequestRepo.findById(requestId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Collection request not found"));

    if (request.getDriver() == null
            || request.getDriver().getId() != driverId) {
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.FORBIDDEN,
                "You can only start your own assigned requests");
    }

    return updateStatus(requestId, RequestStatus.IN_PROGRESS);
}

}