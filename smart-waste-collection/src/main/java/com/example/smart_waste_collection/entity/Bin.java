package com.example.smart_waste_collection.entity;

import jakarta.persistence.*;
@Entity 
@Table(name="bins")
public class Bin {
    @Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private int id;
    @Column(nullable = false)
    private String locationName;
    @Column(nullable = false)
    private double latitude;
    @Column(nullable = false)
    private double longitude;
    @Column(nullable = false)
    private double capacity;
    @Column(nullable = false)
    private double currentFillLevel;

    @Enumerated (EnumType.STRING)
    @Column(nullable = false)
    private BinStatus status;

    @ManyToOne 
    @JoinColumn(name="zone_id",nullable=false)
    private Zone zone;

    public Bin(String locationName, double latitude, double longitude,
               double capacity, double currentFillLevel,
               BinStatus status, Zone zone) {

        this.locationName = locationName;
        this.latitude = latitude;
        this.longitude = longitude;
        this.capacity = capacity;
        this.currentFillLevel = currentFillLevel;
        this.status = status;
        this.zone = zone;
    }

    public int getId()
    {
        return id;
    }

    public String getLocationName()
    {
        return locationName;
    }
    public double getLatitude() {
        return latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public double getCapacity() {
        return capacity;
    }

    public double getCurrentFillLevel() {
        return currentFillLevel;
    }

    public BinStatus getStatus() {
        return status;
    }

    public Zone getZone() {
        return zone;
    }

    public void setLocationName(String locationname)
    {
        this.locationName=locationname;
    }
      public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public void setCapacity(double capacity) {
        this.capacity = capacity;
    }

    public void setCurrentFillLevel(double currentFillLevel) {
        this.currentFillLevel = currentFillLevel;
    }

    public void setStatus(BinStatus status) {
        this.status = status;
    }

    public void setZone(Zone zone) {
        this.zone = zone;
    }




    public Bin()
    {

    }
}
