package com.example.smart_waste_collection.service;

import java.util.List;
import org.springframework.stereotype.Service;

import com.example.smart_waste_collection.entity.Bin;
import com.example.smart_waste_collection.repository.BinRepo;

@Service 
public class BinService{
    private final BinRepo binRepo;

    public BinService(BinRepo binRepo)
    {
        this.binRepo=binRepo;
    }

    public Bin addBin(Bin bin)
    {
        return binRepo.save(bin);
    }
     public List<Bin> getAllBins() {

    System.out.println("========== BIN SERVICE ==========");
    List<Bin> bins = binRepo.findAll();
    System.out.println("BIN COUNT = " + bins.size());
    System.out.println("================================");

    return bins;
}
}

