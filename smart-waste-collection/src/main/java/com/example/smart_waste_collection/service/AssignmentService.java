
package com.example.smart_waste_collection.service;

import com.example.smart_waste_collection.entity.*;
import com.example.smart_waste_collection.repository.CollectionRequestRepo;
import com.example.smart_waste_collection.repository.DriverRepo;
import com.example.smart_waste_collection.repository.RouteRepo;
import com.example.smart_waste_collection.repository.VehicleRepo;

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class AssignmentService {

    private final CollectionRequestRepo collectionRequestRepo;
    private final DriverRepo driverRepo;
    private final VehicleRepo vehicleRepo;
    private final RouteRepo routeRepo;
    private final RouteService routeService;

    public AssignmentService(
            CollectionRequestRepo collectionRequestRepo,
            DriverRepo driverRepo,
            VehicleRepo vehicleRepo,
            RouteRepo routeRepo,
            RouteService routeService) {

        this.collectionRequestRepo = collectionRequestRepo;
        this.driverRepo = driverRepo;
        this.vehicleRepo = vehicleRepo;
        this.routeRepo = routeRepo;
        this.routeService = routeService;
    }

    @Transactional
    public CollectionRequest assignRequest(
            int requestId,
            int driverId,
            int vehicleId) {

        CollectionRequest request =
                collectionRequestRepo.findById(requestId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Collection request not found"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException(
                    "Only PENDING requests can be assigned");
        }

        Driver driver = driverRepo.findById(driverId)
                .orElseThrow(() ->
                        new RuntimeException("Driver not found"));

        Vehicle vehicle = vehicleRepo.findById(vehicleId)
                .orElseThrow(() ->
                        new RuntimeException("Vehicle not found"));

        // Check whether this driver already has a planned route.
        var existingRoute =
                routeRepo.findFirstByDriverIdAndStatus(
                        driverId,
                        RouteStatus.PLANNED);

        if (existingRoute.isPresent()) {

            Route route = existingRoute.get();

            if (route.getVehicle().getId() != vehicleId) {
                throw new RuntimeException(
                        "Select the vehicle already assigned to this driver's planned route.");
            }

            // Assign request to the driver and vehicle.
            request.setDriver(driver);
            request.setVehicle(vehicle);
            request.setStatus(RequestStatus.ASSIGNED);

            collectionRequestRepo.save(request);

            // Reuse the existing route by adding a stop.
            routeService.addStop(route.getId(), requestId);

            return collectionRequestRepo.save(request);
        }

        // Normal assignment for a driver without a planned route.
        if (driver.getStatus() != DriverStatus.AVAILABLE) {
            throw new RuntimeException(
                    "Driver is not available and has no planned route.");
        }

        if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new RuntimeException(
                    "Vehicle is not available.");
        }

        request.setDriver(driver);
        request.setVehicle(vehicle);
        request.setStatus(RequestStatus.ASSIGNED);

        driver.setStatus(DriverStatus.ON_DUTY);
        vehicle.setStatus(VehicleStatus.IN_USE);

        driverRepo.save(driver);
        vehicleRepo.save(vehicle);

        return collectionRequestRepo.save(request);
    }
}
