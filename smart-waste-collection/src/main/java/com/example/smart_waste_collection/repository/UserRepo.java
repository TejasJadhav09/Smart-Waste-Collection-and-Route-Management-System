package com.example.smart_waste_collection.repository;

import com.example.smart_waste_collection.entity.Role;
import com.example.smart_waste_collection.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepo extends JpaRepository<User, Integer> {

    Optional<User> findByEmail(String email);

    List<User> findByRole(Role role);
}