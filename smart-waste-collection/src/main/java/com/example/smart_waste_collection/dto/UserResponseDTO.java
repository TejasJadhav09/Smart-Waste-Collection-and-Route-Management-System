package com.example.smart_waste_collection.dto;

import com.example.smart_waste_collection.entity.Role;

public class UserResponseDTO {

    private int id;
    private String name;
    private String email;
    private String phone;
    private Role role;

    public UserResponseDTO() {
    }

    public UserResponseDTO(
            int id,
            String name,
            String email,
            String phone,
            Role role) {

        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.role = role;
    }

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public Role getRole() {
        return role;
    }
}