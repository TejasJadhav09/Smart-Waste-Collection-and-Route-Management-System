package com.example.smart_waste_collection.service;

import com.example.smart_waste_collection.dto.ComplaintRequest;
import com.example.smart_waste_collection.entity.*;
import com.example.smart_waste_collection.repository.BinRepo;
import com.example.smart_waste_collection.repository.ComplaintRepo;
import com.example.smart_waste_collection.repository.UserRepo;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ComplaintService {

    private final ComplaintRepo complaintRepo;
    private final UserRepo userRepo;
    private final BinRepo binRepo;
    private final CollectionRequestService collectionRequestService;
    public ComplaintService(ComplaintRepo complaintRepo,
                        UserRepo userRepo,
                        BinRepo binRepo,
                        CollectionRequestService collectionRequestService) {

    this.complaintRepo = complaintRepo;
    this.userRepo = userRepo;
    this.binRepo = binRepo;
    this.collectionRequestService = collectionRequestService;
}

    public Complaint createComplaint(ComplaintRequest request) {

        User resident =
                userRepo.findById(request.getResidentId())
                        .orElseThrow(() ->
                                new RuntimeException("Resident not found"));

        if (resident.getRole() != Role.RESIDENT) {
            throw new RuntimeException(
                    "Selected user is not a resident");
        }

        Bin bin =
                binRepo.findById(request.getBinId())
                        .orElseThrow(() ->
                                new RuntimeException("Bin not found"));

        Complaint complaint = new Complaint(
                request.getDescription(),
                request.getType(),
                ComplaintStatus.PENDING,
                LocalDateTime.now(),
                resident,
                bin
        );

        return complaintRepo.save(complaint);
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepo.findAll();
    }



    public Complaint updateStatus(int complaintId,
                              ComplaintStatus newStatus) {

    Complaint complaint =
            complaintRepo.findById(complaintId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Complaint not found"));

    ComplaintStatus currentStatus =
            complaint.getStatus();

    boolean valid = false;

    if (currentStatus == ComplaintStatus.PENDING) {

        valid = newStatus == ComplaintStatus.IN_PROGRESS
                || newStatus == ComplaintStatus.REJECTED;

    } else if (currentStatus == ComplaintStatus.IN_PROGRESS) {

        valid = newStatus == ComplaintStatus.RESOLVED;
    }

    if (!valid) {
        throw new RuntimeException(
                "Invalid complaint status transition: "
                        + currentStatus
                        + " -> "
                        + newStatus);
    }

    complaint.setStatus(newStatus);

    return complaintRepo.save(complaint);
}


public CollectionRequest createCollectionRequestFromComplaint(
        int complaintId) {

    Complaint complaint =
            complaintRepo.findById(complaintId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Complaint not found"));

    if (complaint.getType() != ComplaintType.OVERFLOW) {
        throw new RuntimeException(
                "Only OVERFLOW complaints can create a collection request");
    }

    if (complaint.getStatus() == ComplaintStatus.REJECTED) {
        throw new RuntimeException(
                "Rejected complaints cannot create collection requests");
    }

    Bin bin = complaint.getBin();

    return collectionRequestService.createRequest(bin.getId());
}
}