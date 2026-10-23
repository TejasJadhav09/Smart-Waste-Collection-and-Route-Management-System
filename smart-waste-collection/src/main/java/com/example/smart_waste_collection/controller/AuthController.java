package com.example.smart_waste_collection.controller;

import com.example.smart_waste_collection.dto.LoginRequest;
import com.example.smart_waste_collection.dto.RegisterRequest;
import com.example.smart_waste_collection.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.example.smart_waste_collection.entity.User;
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
public String login(
        @Valid @RequestBody LoginRequest request) {

    return authService.login(request);
}

@PostMapping("/register")
public User register(
        @Valid @RequestBody RegisterRequest request) {

    return authService.registerResident(request);
}
}