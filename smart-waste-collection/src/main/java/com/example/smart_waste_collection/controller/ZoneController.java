package com.example.smart_waste_collection.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.smart_waste_collection.entity.Zone;
import com.example.smart_waste_collection.service.ZoneService;


@RestController 
@RequestMapping ("/zones")
public class ZoneController {
    private final ZoneService zoneService;

    public ZoneController(ZoneService zoneService)
    {
        this.zoneService=zoneService;
    }
    @PostMapping 
    public Zone addZone(@RequestBody Zone zone)
    {
        return zoneService.addZone(zone);
    }

     @GetMapping
    public List<Zone> getAllZones() {
        return zoneService.getAllZones();
    }

    
}
