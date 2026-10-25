import { useEffect, useState } from "react";
import API_BASE_URL from "../api";
import {
    MapContainer,
    TileLayer,
    CircleMarker,
    Marker,
    Popup,
    Polyline
} from "react-leaflet";

import L from "leaflet";

const createNumberedIcon = (number) =>
    L.divIcon({
        className: "numbered-stop-marker",
        html: `
            <div style="
                background: #2563eb;
                color: white;
                width: 32px;
                height: 32px;
                border: 3px solid white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 14px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.35);
            ">${number}</div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
        popupAnchor: [0, -19]
    });

function RouteMap({ stops = [], driverId }) {

    const [driverLocation, setDriverLocation] = useState(null);
    const [roadRoute, setRoadRoute] = useState([]);


    // Get driver's latest location
   useEffect(() => {

    if (!driverId) {
        return;
    }

    const loadDriverLocation = async () => {

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API_BASE_URL}/driver-locations/${driverId}/latest`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Unable to load driver location");
            }

            const data = await response.json();

            setDriverLocation({
                latitude: Number(data.latitude),
                longitude: Number(data.longitude)
            });

        } catch (error) {

            console.error(
                "Driver location error:",
                error
            );

        }

    };

    // Load immediately
    loadDriverLocation();

    // Check for updated location every 5 seconds
    const intervalId = setInterval(
        loadDriverLocation,
        5000
    );

    return () => {
        clearInterval(intervalId);
    };

}, [driverId]);

useEffect(() => {
    let cancelled = false;

    const loadRoadRoute = async () => {
        if (!driverLocation || !stops.length) {
            setRoadRoute([]);
            return;
        }

        // Build the route through every stop in stop order.
        const orderedStops = [...stops].sort(
            (a, b) => a.stopOrder - b.stopOrder
        );

        const coordinates = [
            [
                driverLocation.latitude,
                driverLocation.longitude
            ],
            ...orderedStops
                .map(stop => stop.collectionRequest?.bin)
                .filter(bin =>
                    bin &&
                    bin.latitude != null &&
                    bin.longitude != null
                )
                .map(bin => [
                    Number(bin.latitude),
                    Number(bin.longitude)
                ])
        ];

        if (coordinates.length < 2) {
            setRoadRoute([]);
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const allCoordinates = [];

            // Request road geometry for each consecutive pair.
            for (let i = 0; i < coordinates.length - 1; i++) {
                const [startLatitude, startLongitude] = coordinates[i];
                const [endLatitude, endLongitude] = coordinates[i + 1];

                const params = new URLSearchParams({
                    startLatitude: String(startLatitude),
                    startLongitude: String(startLongitude),
                    endLatitude: String(endLatitude),
                    endLongitude: String(endLongitude)
                });

                const response = await fetch(
                    `${API_BASE_URL}/routes/road-route?${params}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Road route request failed: ${response.status}`
                    );
                }

                const data = await response.json();
                const geometry = data.geometry;

                if (!Array.isArray(geometry) || geometry.length < 2) {
                    throw new Error(
                        "The backend did not return route geometry coordinates."
                    );
                }

                // Avoid duplicating the join point between road segments.
                allCoordinates.push(
                    ...geometry.slice(
                        i === 0 ? 0 : 1
                    )
                );
            }

            if (!cancelled) {
                setRoadRoute(allCoordinates);
            }
        } catch (error) {
            console.error("Road route error:", error);

            if (!cancelled) {
                setRoadRoute([]);
            }
        }
    };

    loadRoadRoute();

    return () => {
        cancelled = true;
    };
}, [driverLocation, stops]);
    if (!stops.length) {
        return (
            <div>
                <p>No stops available to display on the map.</p>
            </div>
        );
    }


    const firstStop = stops[0]?.collectionRequest?.bin;


    if (
        firstStop?.latitude === undefined ||
        firstStop?.longitude === undefined
    ) {
        return (
            <div>
                <p>Stop location is not available.</p>
            </div>
        );
    }


    const center = [
        Number(firstStop.latitude),
        Number(firstStop.longitude)
    ];


    return (

      <MapContainer
    center={center}
    zoom={10}
    style={{
        height: "450px",
        width: "100%",
        borderRadius: "12px"
    }}
>
    <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />

    {/* ACTUAL ROAD ROUTE */}
    {roadRoute.length > 0 && (
        <Polyline
            positions={roadRoute}
            pathOptions={{
                color: "#2563eb",
                weight: 5,
                opacity: 0.9
            }}
        />
    )}

    

    {/* DRIVER LOCATION */}
    

            {driverLocation && (

                <CircleMarker
                    center={[
                        driverLocation.latitude,
                        driverLocation.longitude
                    ]}
                    radius={10}
                    pathOptions={{
                        fillColor: "#16a34a",
                        color: "#ffffff",
                        weight: 3,
                        fillOpacity: 1
                    }}
                >

                    <Popup>

                        <strong>
                            🟢 Your Current Location
                        </strong>

                        <br />

                        Latitude: {driverLocation.latitude}

                        <br />

                        Longitude: {driverLocation.longitude}

                    </Popup>

                </CircleMarker>

            )}


            {/* COLLECTION STOPS */}

            {stops.map((stop) => {

                const bin = stop.collectionRequest?.bin;

                if (
                    bin?.latitude === undefined ||
                    bin?.longitude === undefined
                ) {
                    return null;
                }


                const position = [
                    Number(bin.latitude),
                    Number(bin.longitude)
                ];


                return (

                    <Marker
    key={stop.id}
    position={position}
    icon={createNumberedIcon(stop.stopOrder)}
>
    <Popup>
        <strong>
            📍 Stop #{stop.stopOrder}
        </strong>

        <br />

        {bin.locationName}

        <br />

        🗑️ Bin #{bin.id}

        <br />

        📋 Request #{stop.collectionRequest?.id}

        <br />

        Status: {stop.collectionRequest?.status}
    </Popup>
</Marker>

                );

            })}

        </MapContainer>

    );

}

export default RouteMap;