package com.example.smart_waste_collection.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.smart_waste_collection.entity.Zone;
import com.example.smart_waste_collection.repository.ZoneRepo;
@Service 
public class ZoneService {
    private final ZoneRepo zoneRepo;
    public ZoneService(ZoneRepo zonerepo)
    {
        this.zoneRepo=zonerepo;
    }
    public Zone addZone(Zone zone)
    {
        return zoneRepo.save(zone);
    }

     public List<Zone> getAllZones() {
        return zoneRepo.findAll();
    }
}
