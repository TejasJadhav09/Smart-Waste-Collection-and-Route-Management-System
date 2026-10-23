package com.example.smart_waste_collection.controller;

import com.example.smart_waste_collection.entity.Notification;
import com.example.smart_waste_collection.service.NotificationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping
    public Notification createNotification(
            @RequestParam Integer userId,
            @RequestParam String type,
            @RequestParam String message) {

        return notificationService.createNotification(
                userId, type, message);
    }

    @GetMapping("/user/{userId}")
    public List<Notification> getUserNotifications(
            @PathVariable Integer userId) {
   System.out.println("========== NOTIFICATION CONTROLLER ==========");
        return notificationService
                .getUserNotifications(userId);
    }

    @PutMapping("/{notificationId}/read")
    public Notification markAsRead(
            @PathVariable Integer notificationId) {

        return notificationService
                .markAsRead(notificationId);
    }

    @GetMapping("/test")
public String test() {
    return "Notification controller is working";
}
}