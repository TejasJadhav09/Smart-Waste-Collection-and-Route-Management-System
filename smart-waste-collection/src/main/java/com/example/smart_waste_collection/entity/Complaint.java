package com.example.smart_waste_collection.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    private String description;

    @Enumerated(EnumType.STRING)
    private ComplaintType type;

    @Enumerated(EnumType.STRING)
    private ComplaintStatus status;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "resident_id", nullable = false)
    private User resident;

    @ManyToOne
    @JoinColumn(name = "bin_id", nullable = false)
    private Bin bin;

    public Complaint() {
    }

    public Complaint(String description,
                     ComplaintType type,
                     ComplaintStatus status,
                     LocalDateTime createdAt,
                     User resident,
                     Bin bin) {

        this.description = description;
        this.type = type;
        this.status = status;
        this.createdAt = createdAt;
        this.resident = resident;
        this.bin = bin;
    }

    public int getId() {
        return id;
    }

    public String getDescription() {
        return description;
    }

    public ComplaintType getType() {
        return type;
    }

    public ComplaintStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public User getResident() {
        return resident;
    }

    public Bin getBin() {
        return bin;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setType(ComplaintType type) {
        this.type = type;
    }

    public void setStatus(ComplaintStatus status) {
        this.status = status;
    }
}