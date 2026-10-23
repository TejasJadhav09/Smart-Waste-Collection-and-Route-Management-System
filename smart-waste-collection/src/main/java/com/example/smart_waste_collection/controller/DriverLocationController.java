
package com.example.smart_waste_collection.controller;

import com.example.smart_waste_collection.entity.Driver;
import com.example.smart_waste_collection.entity.DriverLocation;
import com.example.smart_waste_collection.repository.DriverRepo;
import com.example.smart_waste_collection.repository.UserRepo;
import com.example.smart_waste_collection.service.DriverLocationService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/driver-locations")
public class DriverLocationController {

    private final DriverLocationService driverLocationService;
    private final DriverRepo driverRepo;
    private final UserRepo userRepo;

    public DriverLocationController(
            DriverLocationService driverLocationService,
            DriverRepo driverRepo,
            UserRepo userRepo) {
        this.driverLocationService = driverLocationService;
        this.driverRepo = driverRepo;
        this.userRepo = userRepo;
    }

    private int getAuthenticatedDriverId(Authentication authentication) {
        String email = authentication.getName();

        var user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "User not found"));

        Driver driver = driverRepo.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN, "No driver profile found"));

        return driver.getId();
    }

    @PostMapping("/{driverId}")
    public DriverLocation updateLocation(
            @PathVariable int driverId,
            @RequestParam double latitude,
            @RequestParam double longitude,
            Authentication authentication) {

        int authenticatedDriverId =
                getAuthenticatedDriverId(authentication);

        if (driverId != authenticatedDriverId) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only update your own location");
        }

        return driverLocationService.updateLocation(
                authenticatedDriverId, latitude, longitude);
    }

    @GetMapping("/{driverId}/latest")
    public DriverLocation getLatestLocation(
            @PathVariable int driverId,
            Authentication authentication) {

        int authenticatedDriverId =
                getAuthenticatedDriverId(authentication);

        if (driverId != authenticatedDriverId) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You can only access your own location");
        }

        return driverLocationService.getLatestLocation(
                authenticatedDriverId);
    }
}
