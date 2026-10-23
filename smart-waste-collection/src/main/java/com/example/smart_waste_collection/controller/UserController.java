package com.example.smart_waste_collection.controller;

import com.example.smart_waste_collection.dto.UserResponseDTO;
import com.example.smart_waste_collection.entity.User;
import com.example.smart_waste_collection.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public User addUser(@RequestBody User user) {
        return userService.addUser(user);
    }

    @GetMapping
    public List<UserResponseDTO> getAllUsers() {
        return userService.getAllUsers();
    }

   
}