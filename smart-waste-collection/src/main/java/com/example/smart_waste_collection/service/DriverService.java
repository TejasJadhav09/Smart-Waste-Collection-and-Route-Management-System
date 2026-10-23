package com.example.smart_waste_collection.service;

import com.example.smart_waste_collection.entity.Driver;
import com.example.smart_waste_collection.entity.DriverStatus;
import com.example.smart_waste_collection.entity.Role;
import com.example.smart_waste_collection.entity.User;
import com.example.smart_waste_collection.repository.DriverRepo;
import com.example.smart_waste_collection.repository.UserRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DriverService {

    private final DriverRepo driverRepo;
    private final UserRepo userRepo;

    public DriverService(DriverRepo driverRepo,
                         UserRepo userRepo) {
        this.driverRepo = driverRepo;
        this.userRepo = userRepo;
    }

    public Driver addDriver(Driver driver) {

    User user = driver.getUser();

    if (user == null) {
        throw new RuntimeException("User is required");
    }

    User existingUser = userRepo.findById(user.getId())
            .orElseThrow(() ->
                    new RuntimeException("User not found"));

    if (existingUser.getRole() != Role.DRIVER) {
        throw new RuntimeException(
                "User must have DRIVER role"
        );
    }

    driver.setStatus(DriverStatus.AVAILABLE);

    driver = new Driver(
            existingUser,
            driver.getLicenseNumber(),
            driver.getStatus()
    );

    return driverRepo.save(driver);
}

    public List<Driver> getAllDrivers() {
        return driverRepo.findAll();
    }
}