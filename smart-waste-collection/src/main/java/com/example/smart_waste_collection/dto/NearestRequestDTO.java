package com.example.smart_waste_collection.dto;

public class NearestRequestDTO {

    private int requestId;
    private int binId;
    private String locationName;
    private double distanceKm;

    public NearestRequestDTO() {
    }

    public NearestRequestDTO(int requestId,
                             int binId,
                             String locationName,
                             double distanceKm) {
        this.requestId = requestId;
        this.binId = binId;
        this.locationName = locationName;
        this.distanceKm = distanceKm;
    }

    public int getRequestId() {
        return requestId;
    }

    public int getBinId() {
        return binId;
    }

    public String getLocationName() {
        return locationName;
    }

    public double getDistanceKm() {
        return distanceKm;
    }
}