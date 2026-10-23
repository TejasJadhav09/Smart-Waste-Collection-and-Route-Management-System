package com.example.smart_waste_collection.service;

import com.example.smart_waste_collection.entity.Driver;
import java.time.LocalDateTime;

import java.util.List;
import org.springframework.stereotype.Service;

import com.example.smart_waste_collection.entity.DriverLocation;
import com.example.smart_waste_collection.entity.DriverStatus;
import com.example.smart_waste_collection.repository.DriverLocationRepo;
import com.example.smart_waste_collection.repository.DriverRepo;

@Service 
public class DriverLocationService {
    private final DriverLocationRepo driverLocationRepo;
    private final DriverRepo driverRepo;

    public DriverLocationService(DriverLocationRepo driverLocationRepo,DriverRepo driverRepo)
    {
        this.driverLocationRepo=driverLocationRepo;
        this.driverRepo=driverRepo;
    }

   public DriverLocation updateLocation(int driverId,double latitude,double longitude)
   {
    Driver driver =driverRepo.findById(driverId).orElseThrow(() ->new RuntimeException("Driver not found"));
    


    if (driver.getStatus() != DriverStatus.ON_DUTY) {
    throw new RuntimeException(
            "Driver is not currently on duty"
    );}



    DriverLocation location=new DriverLocation(latitude,longitude,LocalDateTime.now(),driver);


    return driverLocationRepo.save(location);
   } 

   public DriverLocation getLatestLocation(int driverId) {

    List<DriverLocation> locations =
            driverLocationRepo
                    .findTop1ByDriverIdOrderByRecordedAtDesc(driverId);

    if (locations.isEmpty()) {
        throw new RuntimeException(
                "No location found for driver"
        );
    }

    return locations.get(0);
}
}
