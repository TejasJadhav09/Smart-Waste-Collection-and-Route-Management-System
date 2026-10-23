package com.example.smart_waste_collection.service;

import com.example.smart_waste_collection.dto.DashboardSummaryDTO;
import com.example.smart_waste_collection.entity.BinStatus;
import com.example.smart_waste_collection.entity.DriverStatus;
import com.example.smart_waste_collection.entity.RequestStatus;
import com.example.smart_waste_collection.entity.VehicleStatus;
import com.example.smart_waste_collection.repository.BinRepo;
import com.example.smart_waste_collection.repository.CollectionRequestRepo;
import com.example.smart_waste_collection.repository.DriverRepo;
import com.example.smart_waste_collection.repository.VehicleRepo;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final BinRepo binRepo;
    private final CollectionRequestRepo collectionRequestRepo;
    private final DriverRepo driverRepo;
    private final VehicleRepo vehicleRepo;

    public DashboardService(
            BinRepo binRepo,
            CollectionRequestRepo collectionRequestRepo,
            DriverRepo driverRepo,
            VehicleRepo vehicleRepo) {

        this.binRepo = binRepo;
        this.collectionRequestRepo = collectionRequestRepo;
        this.driverRepo = driverRepo;
        this.vehicleRepo = vehicleRepo;
    }

    public DashboardSummaryDTO getSummary() {

        long totalBins = binRepo.count();

        long criticalBins =
                binRepo.countByStatus(BinStatus.CRITICAL);

        long highBins =
                binRepo.countByStatus(BinStatus.HIGH);

        long normalBins =
                binRepo.countByStatus(BinStatus.NORMAL);

        long lowBins =
                binRepo.countByStatus(BinStatus.LOW);

        long pendingRequests =
                collectionRequestRepo.countByStatus(
                        RequestStatus.PENDING);

        long assignedRequests =
                collectionRequestRepo.countByStatus(
                        RequestStatus.ASSIGNED);

        long inProgressRequests =
                collectionRequestRepo.countByStatus(
                        RequestStatus.IN_PROGRESS);

        long activeRequests =
                assignedRequests + inProgressRequests;

        long completedRequests =
                collectionRequestRepo.countByStatus(
                        RequestStatus.COMPLETED);

        long availableDrivers =
                driverRepo.countByStatus(
                        DriverStatus.AVAILABLE);

        long onDutyDrivers =
                driverRepo.countByStatus(
                        DriverStatus.ON_DUTY);

        long availableVehicles =
                vehicleRepo.countByStatus(
                        VehicleStatus.AVAILABLE);

        long inUseVehicles =
                vehicleRepo.countByStatus(
                        VehicleStatus.IN_USE);

        return new DashboardSummaryDTO(
                totalBins,
                criticalBins,
                highBins,
                normalBins,
                lowBins,
                pendingRequests,
                activeRequests,
                completedRequests,
                availableDrivers,
                onDutyDrivers,
                availableVehicles,
                inUseVehicles
        );
    }
}