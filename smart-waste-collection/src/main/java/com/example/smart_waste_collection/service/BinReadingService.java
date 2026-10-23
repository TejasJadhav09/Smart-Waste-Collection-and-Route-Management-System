package com.example.smart_waste_collection.service;

import com.example.smart_waste_collection.dto.BinReadingRequest;
import com.example.smart_waste_collection.entity.Bin;
import com.example.smart_waste_collection.entity.BinReading;
import com.example.smart_waste_collection.entity.BinStatus;
import com.example.smart_waste_collection.repository.BinReadingRepo;
import com.example.smart_waste_collection.repository.BinRepo;


import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class BinReadingService {

    private final BinReadingRepo binReadingRepo;
    private final BinRepo binRepo;
private final NotificationService notificationService;

public BinReadingService(
        BinReadingRepo binReadingRepo,
        BinRepo binRepo,
        NotificationService notificationService) {

    this.binReadingRepo = binReadingRepo;
    this.binRepo = binRepo;
    this.notificationService = notificationService;
}

    @Transactional
    public BinReading addReading(BinReadingRequest request) {

        Bin bin = binRepo.findById(request.getBinId())
                .orElseThrow(() -> new RuntimeException("Bin not found"));

        BinReading reading = new BinReading(
                request.getFillLevel(),
                request.getRecordedAt(),
                bin
        );

        BinReading savedReading=binReadingRepo.save(reading);
       BinStatus oldStatus = bin.getStatus();

bin.setCurrentFillLevel(request.getFillLevel());

double fillPercentage =
        (request.getFillLevel() / bin.getCapacity()) * 100;

BinStatus newStatus;

if (fillPercentage < 30) {
    newStatus = BinStatus.LOW;
}
else if (fillPercentage < 60) {
    newStatus = BinStatus.NORMAL;
}
else if (fillPercentage < 80) {
    newStatus = BinStatus.HIGH;
}
else {
    newStatus = BinStatus.CRITICAL;
}

bin.setStatus(newStatus);

binRepo.save(bin);

if (oldStatus != BinStatus.CRITICAL
        && newStatus == BinStatus.CRITICAL) {

    notificationService.notifyCriticalBin(
            bin.getId(),
            bin.getLocationName()
    );
}
        return savedReading;
    }



    public double calculateFillRate(int binId)
    {
        List<BinReading>readings=binReadingRepo.findTop2ByBinIdOrderByRecordedAtDesc(binId);
         if (readings.size() < 2) {
        return 0;
    }
    BinReading latest=readings.get(0);
     BinReading previous = readings.get(1);

      double fillDifference =
            latest.getFillLevel() - previous.getFillLevel();

   long minutes = ChronoUnit.MINUTES.between(
            previous.getRecordedAt(),
            latest.getRecordedAt()
    );

    if (minutes <= 0) {
        return 0;
    }

    double hours = minutes / 60.0;

    return fillDifference / hours;
    }

    public List<BinReading> getAllReadings() {
        return binReadingRepo.findAll();
    }
}