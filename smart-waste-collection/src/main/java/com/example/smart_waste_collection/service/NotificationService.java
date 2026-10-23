package com.example.smart_waste_collection.service;

import com.example.smart_waste_collection.entity.Notification;
import com.example.smart_waste_collection.entity.User;
import com.example.smart_waste_collection.repository.NotificationRepo;
import com.example.smart_waste_collection.repository.UserRepo;
import org.springframework.stereotype.Service;
import com.example.smart_waste_collection.entity.Role;
import java.util.List;
import java.time.LocalDateTime;


@Service
public class NotificationService {

    private final NotificationRepo notificationRepo;
    private final UserRepo userRepo;

    public NotificationService(NotificationRepo notificationRepo,
                               UserRepo userRepo) {
        this.notificationRepo = notificationRepo;
        this.userRepo = userRepo;
    }

    public Notification createNotification(
            Integer userId,
            String type,
            String message) {

        User user = userRepo.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Notification notification = new Notification();

        notification.setType(type);
        notification.setMessage(message);
        notification.setRecipient(user);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);

        return notificationRepo.save(notification);
    }

    public List<Notification> getUserNotifications(Integer userId) {

        return notificationRepo
                .findByRecipientIdOrderByCreatedAtDesc(userId);
    }

    public Notification markAsRead(Integer notificationId) {

        Notification notification = notificationRepo
                .findById(notificationId)
                .orElseThrow(() ->
                        new RuntimeException("Notification not found"));

        notification.setRead(true);

        return notificationRepo.save(notification);
    }


    public void notifyCriticalBin(
        Integer binId,
        String locationName) {

    List<User> admins = userRepo.findByRole(Role.ADMIN);
    List<User> dispatchers = userRepo.findByRole(Role.DISPATCHER);

    String message = "Bin #" + binId
            + " at " + locationName
            + " has reached CRITICAL level.";

    for (User user : admins) {
        createNotification(
                user.getId(),
                "CRITICAL_BIN",
                message
        );
    }

    for (User user : dispatchers) {
        createNotification(
                user.getId(),
                "CRITICAL_BIN",
                message
        );
    }
}
}