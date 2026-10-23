package com.example.smart_waste_collection.dto;

import java.time.LocalDateTime;

public class BinReadingRequest {

    private int binId;

    private double fillLevel;

    private LocalDateTime recordedAt;

    public BinReadingRequest() {
    }

    public int getBinId() {
        return binId;
    }

    public double getFillLevel() {
        return fillLevel;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setBinId(int binId) {
        this.binId = binId;
    }

    public void setFillLevel(double fillLevel) {
        this.fillLevel = fillLevel;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }
}