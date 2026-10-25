
package com.example.smart_waste_collection;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SmartWasteCollectionApplication {

    public static void main(String[] args) {
        SpringApplication.run(
                SmartWasteCollectionApplication.class, args);
    }
}
