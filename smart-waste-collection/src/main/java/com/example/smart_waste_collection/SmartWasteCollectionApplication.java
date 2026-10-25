package com.example.smart_waste_collection;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
@SpringBootApplication
@EnableScheduling
public class SmartWasteCollectionApplication {
public static void main(String[] args) {
    SpringApplication app =
            new SpringApplication(SmartWasteCollectionApplication.class);

  app.addInitializers(context -> {
    var env = context.getEnvironment();

    System.out.println("Config location: "
            + env.getProperty("spring.config.location"));

    System.out.println("Config additional location: "
            + env.getProperty("spring.config.additional-location"));

    System.out.println("Config name: "
            + env.getProperty("spring.config.name", "application"));

    System.out.println("Datasource property sources:");

    env.getPropertySources().forEach(source ->
        System.out.println(source.getName())
    );
});

    app.run(args);
}

}
