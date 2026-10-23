package com.example.smart_waste_collection.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity 
@Table(name="bin_id")
public class BinReading {
     @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private double fillLevel;
    private LocalDateTime recordedAt;

     @ManyToOne
    @JoinColumn(name = "bin_id", nullable = false)
    private Bin bin;

       public BinReading() {
    }

    public BinReading(double fillLevel, LocalDateTime recordedAt, Bin bin) {
        this.fillLevel = fillLevel;
        this.recordedAt = recordedAt;
        this.bin = bin;
    }

    public int getId() {
        return id;
    }

    public double getFillLevel() {
        return fillLevel;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public Bin getBin() {
        return bin;
    }

    public void setFillLevel(double fillLevel) {
        this.fillLevel = fillLevel;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }

    public void setBin(Bin bin) {
        this.bin = bin;
    }
}
