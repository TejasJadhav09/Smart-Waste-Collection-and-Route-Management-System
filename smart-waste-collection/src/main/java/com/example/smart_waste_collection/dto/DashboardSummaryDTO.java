package com.example.smart_waste_collection.dto;

public class DashboardSummaryDTO {

    private long totalBins;
    private long criticalBins;
    private long highBins;
    private long normalBins;
    private long lowBins;

    private long pendingRequests;
    private long activeRequests;
    private long completedRequests;

    private long availableDrivers;
    private long onDutyDrivers;

    private long availableVehicles;
    private long inUseVehicles;

    public DashboardSummaryDTO() {
    }

    public DashboardSummaryDTO(
            long totalBins,
            long criticalBins,
            long highBins,
            long normalBins,
            long lowBins,
            long pendingRequests,
            long activeRequests,
            long completedRequests,
            long availableDrivers,
            long onDutyDrivers,
            long availableVehicles,
            long inUseVehicles) {

        this.totalBins = totalBins;
        this.criticalBins = criticalBins;
        this.highBins = highBins;
        this.normalBins = normalBins;
        this.lowBins = lowBins;
        this.pendingRequests = pendingRequests;
        this.activeRequests = activeRequests;
        this.completedRequests = completedRequests;
        this.availableDrivers = availableDrivers;
        this.onDutyDrivers = onDutyDrivers;
        this.availableVehicles = availableVehicles;
        this.inUseVehicles = inUseVehicles;
    }

    public long getTotalBins() {
        return totalBins;
    }

    public long getCriticalBins() {
        return criticalBins;
    }

    public long getHighBins() {
        return highBins;
    }

    public long getNormalBins() {
        return normalBins;
    }

    public long getLowBins() {
        return lowBins;
    }

    public long getPendingRequests() {
        return pendingRequests;
    }

    public long getActiveRequests() {
        return activeRequests;
    }

    public long getCompletedRequests() {
        return completedRequests;
    }

    public long getAvailableDrivers() {
        return availableDrivers;
    }

    public long getOnDutyDrivers() {
        return onDutyDrivers;
    }

    public long getAvailableVehicles() {
        return availableVehicles;
    }

    public long getInUseVehicles() {
        return inUseVehicles;
    }
}