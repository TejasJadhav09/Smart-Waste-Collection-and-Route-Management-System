package com.example.smart_waste_collection.controller;

import com.example.smart_waste_collection.entity.CollectionRequest;
import com.example.smart_waste_collection.service.AssignmentService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/assignments")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @PutMapping("/{requestId}")
    public CollectionRequest assignRequest(
            @PathVariable int requestId,
            @RequestParam int driverId,
            @RequestParam int vehicleId) {

        return assignmentService.assignRequest(
                requestId,
                driverId,
                vehicleId
        );
    }
}