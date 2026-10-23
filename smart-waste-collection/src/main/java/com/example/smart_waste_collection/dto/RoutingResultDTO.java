package com.example.smart_waste_collection.dto;

import java.util.List;

public class RoutingResultDTO {

    private double distanceKm;
    private double durationMinutes;
    private List<List<Double>> geometry;

    public RoutingResultDTO() {
    }

    public RoutingResultDTO(
            double distanceKm,
            double durationMinutes,
            List<List<Double>> geometry) {

        this.distanceKm = distanceKm;
        this.durationMinutes = durationMinutes;
        this.geometry = geometry;
    }

    public double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public double getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(double durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public List<List<Double>> getGeometry() {
        return geometry;
    }

    public void setGeometry(List<List<Double>> geometry) {
        this.geometry = geometry;
    }
}