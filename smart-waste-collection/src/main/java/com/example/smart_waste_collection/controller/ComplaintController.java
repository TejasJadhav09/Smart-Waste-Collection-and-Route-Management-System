package com.example.smart_waste_collection.controller;

import com.example.smart_waste_collection.dto.ComplaintRequest;
import com.example.smart_waste_collection.entity.CollectionRequest;
import com.example.smart_waste_collection.entity.Complaint;
import com.example.smart_waste_collection.entity.ComplaintStatus;
import com.example.smart_waste_collection.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @PostMapping
    public Complaint createComplaint(
            @Valid @RequestBody ComplaintRequest request) {

        return complaintService.createComplaint(request);
    }

    @GetMapping
    public List<Complaint> getAllComplaints() {
        return complaintService.getAllComplaints();
    }


    @PutMapping("/{complaintId}/status")
public Complaint updateStatus(
        @PathVariable int complaintId,
        @RequestParam ComplaintStatus status) {

    return complaintService.updateStatus(
            complaintId,
            status);
}

@PostMapping("/{complaintId}/create-collection-request")
public CollectionRequest createCollectionRequest(
        @PathVariable int complaintId) {

    return complaintService
            .createCollectionRequestFromComplaint(complaintId);
}
}