package com.example.smart_waste_collection.controller;
import java.util.List;

import com.example.smart_waste_collection.entity.Bin;

import com.example.smart_waste_collection.service.BinService;

import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/bins")
public class BinController {

    private final BinService binService;

    public BinController(BinService binService) {
        this.binService = binService;
    }

    @PostMapping
    public Bin addBin(@RequestBody Bin bin) {
        return binService.addBin(bin);
    }

    @GetMapping
public List<Bin> getAllBins() {

    System.out.println("========== BIN CONTROLLER ==========");

    List<Bin> bins = binService.getAllBins();

    System.out.println("BIN COUNT = " + bins.size());

    return bins;
}
}
