package com.example.smart_waste_collection.dto;

import com.example.smart_waste_collection.entity.ComplaintType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ComplaintRequest {

    @NotBlank
    private String description;

    @NotNull
    private ComplaintType type;

    @NotNull
    private Integer residentId;

    @NotNull
    private Integer binId;

    public ComplaintRequest() {
    }

    public String getDescription() {
        return description;
    }

    public ComplaintType getType() {
        return type;
    }

    public Integer getResidentId() {
        return residentId;
    }

    public Integer getBinId() {
        return binId;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setType(ComplaintType type) {
        this.type = type;
    }

    public void setResidentId(Integer residentId) {
        this.residentId = residentId;
    }

    public void setBinId(Integer binId) {
        this.binId = binId;
    }
}