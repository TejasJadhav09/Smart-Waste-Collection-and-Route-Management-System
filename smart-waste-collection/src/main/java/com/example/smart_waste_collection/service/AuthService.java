package com.example.smart_waste_collection.service;

import com.example.smart_waste_collection.dto.LoginRequest;
import com.example.smart_waste_collection.dto.RegisterRequest;
import com.example.smart_waste_collection.entity.Driver;
import com.example.smart_waste_collection.entity.Role;
import com.example.smart_waste_collection.entity.User;
import com.example.smart_waste_collection.repository.DriverRepo;
import com.example.smart_waste_collection.repository.UserRepo;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import com.example.smart_waste_collection.dto.RegisterRequest;
@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepo userRepo;
    private final DriverRepo driverRepo;
    private final JwtService jwtService;
    private final UserService userService;
  public AuthService(
        AuthenticationManager authenticationManager,
        UserRepo userRepo,
        DriverRepo driverRepo,
        JwtService jwtService,
        UserService userService) {

        this.authenticationManager = authenticationManager;
        this.userRepo = userRepo;
        this.driverRepo = driverRepo;
        this.jwtService = jwtService;
        this.userService = userService;
    }

    public String login(LoginRequest request) {

        UsernamePasswordAuthenticationToken token =
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                );

        Authentication authentication =
                authenticationManager.authenticate(token);

        User user = userRepo.findByEmail(
                authentication.getName()
        ).orElseThrow(() ->
                new RuntimeException("User not found"));

        Integer driverId = null;

        if (user.getRole() == Role.DRIVER) {

            Driver driver = driverRepo
                    .findByUserId(user.getId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Driver profile not found"
                            ));

            driverId = driver.getId();
        }

return jwtService.generateToken(
        user.getEmail(),
        user.getRole().name(),
        user.getId(),
        driverId
);
    }


    public User registerResident(RegisterRequest request) {

    if (userRepo.findByEmail(request.getEmail()).isPresent()) {
        throw new RuntimeException("Email already registered");
    }

    User user = new User();

    user.setName(request.getName());
    user.setEmail(request.getEmail());
    user.setPassword(request.getPassword());
    user.setPhone(request.getPhone());

    // Never accept role from the client
    user.setRole(Role.RESIDENT);

    return userService.addUser(user);
}
}