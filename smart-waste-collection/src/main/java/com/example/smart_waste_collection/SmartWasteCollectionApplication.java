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
        String dbUrl = context.getEnvironment().getProperty("DB_URL");
        String datasourceUrl = context.getEnvironment()
                .getProperty("spring.datasource.url");

        System.out.println("DB_URL present: "
                + (dbUrl != null && !dbUrl.isBlank()));

        System.out.println("Datasource URL configured: "
                + (datasourceUrl != null && !datasourceUrl.isBlank()));
    });

    app.run(args);
}

}
