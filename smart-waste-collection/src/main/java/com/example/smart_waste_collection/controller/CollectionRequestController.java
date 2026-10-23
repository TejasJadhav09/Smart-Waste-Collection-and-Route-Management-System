package com.example.smart_waste_collection.controller;

import com.example.smart_waste_collection.entity.CollectionRequest;
import com.example.smart_waste_collection.entity.RequestStatus;
import com.example.smart_waste_collection.service.CollectionRequestService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import com.example.smart_waste_collection.repository.UserRepo;
import com.example.smart_waste_collection.repository.DriverRepo;
import java.util.List;

@RestController
@RequestMapping("/collection-requests")
public class CollectionRequestController {

    private final CollectionRequestService collectionRequestService;
private final UserRepo userRepo;
private final DriverRepo driverRepo;
    public CollectionRequestController(
        CollectionRequestService collectionRequestService,
        UserRepo userRepo,
        DriverRepo driverRepo) {

    this.collectionRequestService = collectionRequestService;
    this.userRepo = userRepo;
    this.driverRepo = driverRepo;
}

    @PostMapping("/{binId}")
    public CollectionRequest createRequest(@PathVariable int binId) {
        return collectionRequestService.createRequest(binId);
    }

    @GetMapping
    public List<CollectionRequest> getAllRequests() {
        return collectionRequestService.getAllRequests();
    }

  
@GetMapping("/driver/{driverId}")
public List<CollectionRequest> getDriverRequests(
        @PathVariable int driverId,
        Authentication authentication) {

    String email = authentication.getName();
    int authenticatedDriverId = getAuthenticatedDriverId(email);

    if (driverId != authenticatedDriverId) {
        throw new ResponseStatusException(
                HttpStatus.FORBIDDEN,
                "You can only view your own collection requests");
    }

    return collectionRequestService.getDriverRequests(
            authenticatedDriverId);
}


    @PutMapping("/{requestId}/status")
public CollectionRequest updateStatus(
        @PathVariable int requestId,
        @RequestParam RequestStatus status) {

    return collectionRequestService.updateStatus(
            requestId,
            status
    );
}


@PutMapping("/{requestId}/complete")
public CollectionRequest completeRequest(
        @PathVariable int requestId,
        Authentication authentication) {

    String email = authentication.getName();

    return collectionRequestService.completeRequestForDriver(
            requestId,
            getAuthenticatedDriverId(email)
    );
}



@PutMapping("/{requestId}/start")
public CollectionRequest startRequest(
        @PathVariable int requestId,
        Authentication authentication) {

    String email = authentication.getName();

    return collectionRequestService.startRequestForDriver(
            requestId,
            getAuthenticatedDriverId(email)
    );
}

private int getAuthenticatedDriverId(String email) {
    // We will resolve the authenticated user to their driver ID here.
    // This requires UserRepo and DriverRepo.
    var user = userRepo.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED, "User not found"));

    var driver = driverRepo.findByUserId(user.getId())
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Driver profile not found"));

    return driver.getId();
}

}