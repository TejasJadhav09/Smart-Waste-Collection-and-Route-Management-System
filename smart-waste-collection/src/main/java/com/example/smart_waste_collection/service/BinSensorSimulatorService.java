
package com.example.smart_waste_collection.service;

import com.example.smart_waste_collection.dto.BinReadingRequest;
import com.example.smart_waste_collection.entity.Bin;
import com.example.smart_waste_collection.repository.BinRepo;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class BinSensorSimulatorService {

    private final BinRepo binRepo;
    private final BinReadingService binReadingService;

    public BinSensorSimulatorService(
            BinRepo binRepo,
            BinReadingService binReadingService) {
        this.binRepo = binRepo;
        this.binReadingService = binReadingService;
    }

    // Simulate readings every 60 seconds
    @Scheduled(fixedRate = 60000)
    public void simulateBinReadings() {

        List<Bin> bins = binRepo.findAll();

        for (Bin bin : bins) {

            double currentFill = bin.getCurrentFillLevel();
            double capacity = bin.getCapacity();

            if (capacity <= 0 || currentFill >= capacity) {
                continue;
            }

            // Different bins fill at different speeds.
            // Fill level is measured in the same units as capacity.
            ThreadLocalRandom random = ThreadLocalRandom.current();

            double increase = random.nextDouble(0.1, 0.6);

            // Busy bins accumulate waste faster.
            // Use a random rate to simulate daily variation.
            if (random.nextDouble() < 0.20) {
                increase *= 2.0;
            }

            double newFillLevel = Math.min(
                    currentFill + increase,
                    capacity
            );

            BinReadingRequest request = new BinReadingRequest();
            request.setBinId(bin.getId());
            request.setFillLevel(newFillLevel);
            request.setRecordedAt(LocalDateTime.now());

            binReadingService.addReading(request);

            System.out.println(
                    "SENSOR SIMULATION -> Bin #"
                    + bin.getId()
                    + " | Fill: "
                    + String.format("%.2f", newFillLevel)
                    + " / "
                    + capacity
            );
        }
    }
}
