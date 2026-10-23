package com.example.smart_waste_collection.service;

import com.example.smart_waste_collection.dto.RoutingResultDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class RoutingService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${routing.api-key}")
    private String apiKey;

    public RoutingService() {
        this.objectMapper = new ObjectMapper();

        this.restClient = RestClient.builder()
                .baseUrl("https://api.heigit.org")
                .build();
    }

    public RoutingResultDTO getDrivingRoute(
            double startLatitude,
            double startLongitude,
            double endLatitude,
            double endLongitude) {

        String url =
                "/openrouteservice/v2/directions/driving-car";

        Map<String, Object> requestBody = Map.of(
                "coordinates",
                new double[][]{
                        {startLongitude, startLatitude},
                        {endLongitude, endLatitude}
                }
        );

        try {

        String response = restClient.post()
        .uri(url)
        .header(HttpHeaders.AUTHORIZATION, apiKey)
        .contentType(MediaType.APPLICATION_JSON)
        .body(requestBody)
        .retrieve()
        .body(String.class);

       JsonNode root = objectMapper.readTree(response);

JsonNode route =
        root.path("routes")
                .get(0);

JsonNode summary =
        route.path("summary");

double distanceMeters =
        summary.path("distance").asDouble();

double durationSeconds =
        summary.path("duration").asDouble();

double distanceKm =
        distanceMeters / 1000.0;

double durationMinutes =
        durationSeconds / 60.0;


// Extract route geometry
JsonNode geometryNode = route.path("geometry");

List<List<Double>> geometry = new ArrayList<>();

if (geometryNode.isTextual()) {

    String encodedGeometry = geometryNode.asText();
    System.out.println("ENCODED GEOMETRY: " + encodedGeometry);

    geometry = decodePolyline(encodedGeometry);

}

System.out.println(
        "ROUTE GEOMETRY POINTS: " + geometry.size()
);

return new RoutingResultDTO(
        distanceKm,
        durationMinutes,
        geometry
);

        } catch (Exception e) {

            e.printStackTrace();

            throw new RuntimeException(
                    "Failed to process routing response", e);
        }
    }


    private List<List<Double>> decodePolyline(String encoded) {

    List<List<Double>> points = new ArrayList<>();

    int index = 0;
    int latitude = 0;
    int longitude = 0;

    while (index < encoded.length()) {

        // Decode latitude
        int result = 1;
        int shift = 0;
        int b;

        do {
            b = encoded.charAt(index++) - 63 - 1;
            result += b << shift;
            shift += 5;
        } while (b >= 0x1f);

        latitude +=
                ((result & 1) != 0)
                        ? ~(result >> 1)
                        : (result >> 1);


        // Decode longitude
        result = 1;
        shift = 0;

        do {
            b = encoded.charAt(index++) - 63 - 1;
            result += b << shift;
            shift += 5;
        } while (b >= 0x1f);

        longitude +=
                ((result & 1) != 0)
                        ? ~(result >> 1)
                        : (result >> 1);


        double decodedLatitude =
                latitude / 1E5;

        double decodedLongitude =
                longitude / 1E5;


        // Leaflet expects [latitude, longitude]
        points.add(
                List.of(
                        decodedLatitude,
                        decodedLongitude
                )
        );
    }

    return points;
}
}