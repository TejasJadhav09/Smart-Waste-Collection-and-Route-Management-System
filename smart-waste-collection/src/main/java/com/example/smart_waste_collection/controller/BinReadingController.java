package com.example.smart_waste_collection.controller;

import com.example.smart_waste_collection.dto.BinReadingRequest;
import com.example.smart_waste_collection.entity.BinReading;
import com.example.smart_waste_collection.service.BinReadingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/readings")
public class BinReadingController {

    private final BinReadingService binReadingService;

    public BinReadingController(BinReadingService binReadingService) {
        this.binReadingService = binReadingService;
    }

    @PostMapping
    public BinReading addReading(@RequestBody BinReadingRequest request) {
        return binReadingService.addReading(request);
    }

    @GetMapping
    public List<BinReading> getAllReadings() {
        return binReadingService.getAllReadings();
    }

@GetMapping("/bin/{binId}/fill-rate")
public double getFillRate(@PathVariable int binId) {
    return binReadingService.calculateFillRate(binId);
}
}