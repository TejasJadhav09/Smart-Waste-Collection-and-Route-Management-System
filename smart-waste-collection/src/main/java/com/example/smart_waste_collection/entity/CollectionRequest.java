package com.example.smart_waste_collection.entity;

import java.time.LocalDateTime;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity 
@Table (name="collection_requests")
public class CollectionRequest {



        @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
@ManyToOne 
@JoinColumn (name="bin_id",nullable = false)
private Bin bin;

    @Enumerated (EnumType.STRING)
    @Column (nullable = false)
    private RequestStatus status;

     @Enumerated (EnumType.STRING)
    @Column (nullable = false)
    private RequestPriority priority;

      private LocalDateTime createdAt;


      @ManyToOne
@JoinColumn(name = "driver_id")
private Driver driver;

@ManyToOne
@JoinColumn(name = "vehicle_id")
private Vehicle vehicle;
    public CollectionRequest()
    {

    }

    public CollectionRequest(Bin bin,RequestStatus status,RequestPriority priority,LocalDateTime createdAt)
    {
        this.bin = bin;
        this.status = status;
        this.priority = priority;
        this.createdAt = createdAt;
    }
     public int getId() {
        return id;
    }

    public Bin getBin() {
        return bin;
    }

    public RequestStatus getStatus() {
        return status;
    }

    public RequestPriority getPriority() {
        return priority;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
    }

    public void setPriority(RequestPriority priority) {
        this.priority = priority;
    }


    public Driver getDriver() {
    return driver;
}


public void setDriver(Driver driver) {
    this.driver = driver;
}


public Vehicle getVehicle() {
    return vehicle;
}


public void setVehicle(Vehicle vehicle) {
    this.vehicle = vehicle;
}
}
