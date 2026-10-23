package com.example.smart_waste_collection.dto;

public class RouteCandidateDTO {

    private int requestId;
    private int binId;
    private String locationName;
    private double latitude;
    private double longitude;
    private double distanceKm;
    private String priority;
    private double priorityScore;

    public RouteCandidateDTO() {
    }

    public RouteCandidateDTO(
            int requestId,
            int binId,
            String locationName,
            double latitude,
            double longitude,
            double distanceKm,
            String priority,
            double priorityScore) {

        this.requestId = requestId;
        this.binId = binId;
        this.locationName = locationName;
        this.latitude = latitude;
        this.longitude = longitude;
        this.distanceKm = distanceKm;
        this.priority = priority;
        this.priorityScore = priorityScore;
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

    public double getLatitude() {
        return latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public double getDistanceKm() {
        return distanceKm;
    }

    public String getPriority() {
        return priority;
    }

    public double getPriorityScore() {
        return priorityScore;
    }
}