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

        System.out.println("DB_URL present: "
                + (env.getProperty("DB_URL") != null));

        System.out.println("Datasource URL configured: "
                + (env.getProperty("spring.datasource.url") != null));

        System.out.println("Property sources:");

        env.getPropertySources().forEach(source -> {
            if (source.containsProperty("spring.datasource.url")) {
                System.out.println(
                        "Datasource property found in: " + source.getName()
                );
            }
        });
    });

    app.run(args);
}

}
