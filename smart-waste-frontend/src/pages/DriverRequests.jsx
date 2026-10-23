import { useEffect, useState } from "react";
import "./DriverRequests.css";

function getDriverId() {
    const token = localStorage.getItem("token");

    if (!token) return null;

    try {
        const payload = JSON.parse(
            atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
        );

        return payload.driverId || null;

    } catch (error) {
        console.error("Unable to read driver ID:", error);
        return null;
    }
}

function DriverRequests() {

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processingRequest, setProcessingRequest] = useState(null);

    const driverId = getDriverId();


    const loadRequests = async () => {

        const token = localStorage.getItem("token");

        try {

            const response = await fetch(
                `http://localhost:8080/collection-requests/driver/${driverId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Failed to load requests: ${response.status}`
                );
            }

            const data = await response.json();

            setRequests(
                Array.isArray(data) ? data : []
            );

            setLoading(false);

        } catch (error) {

            console.error(
                "Driver requests error:",
                error
            );

            setError(error.message);
            setLoading(false);
        }
    };


    useEffect(() => {

        if (!driverId) {

            setError("Driver ID not found in login session.");
            setLoading(false);

            return;
        }

        loadRequests();

    }, [driverId]);


    const updateDriverLocation = () => {
    const token = localStorage.getItem("token");

    if (!navigator.geolocation) {
        alert("Geolocation is not supported by this browser.");
        return;
    }

    const payload = JSON.parse(
        atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );

    const driverId = payload.driverId;

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            try {
                const response = await fetch(
                    `http://localhost:8080/driver-locations/${driverId}?latitude=${latitude}&longitude=${longitude}`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!response.ok) {
                    const error = await response.text();
                    throw new Error(error);
                }

                alert(
                    `Location updated!\nLatitude: ${latitude}\nLongitude: ${longitude}`
                );

            } catch (error) {
                console.error("Location update error:", error);
                alert(error.message);
            }
        },
        (error) => {
            console.error("GPS error:", error);
            alert("Unable to get your location.");
        }
    );
};



    const startRequest = async (requestId) => {

        const token = localStorage.getItem("token");

        setProcessingRequest(requestId);

        try {

            const response = await fetch(
                `http://localhost:8080/collection-requests/${requestId}/start`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {

                const errorText =
                    await response.text();

                throw new Error(
                    errorText ||
                    `Failed to start request: ${response.status}`
                );
            }

            await response.json();

            await loadRequests();

        } catch (error) {

            console.error(
                "Start request error:",
                error
            );

            alert(error.message);

        } finally {

            setProcessingRequest(null);
        }
    };


    const completeRequest = async (requestId) => {

        const token = localStorage.getItem("token");

        setProcessingRequest(requestId);

        try {

            const response = await fetch(
                `http://localhost:8080/collection-requests/${requestId}/complete`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {

                const errorText =
                    await response.text();

                throw new Error(
                    errorText ||
                    `Failed to complete request: ${response.status}`
                );
            }

            await response.json();

            await loadRequests();

        } catch (error) {

            console.error(
                "Complete request error:",
                error
            );

            alert(error.message);

        } finally {

            setProcessingRequest(null);
        }
    };


    if (loading) {

        return (
            <div className="driver-requests-page">
                <h2>Loading your collection requests...</h2>
            </div>
        );
    }


    if (error) {

        return (
            <div className="driver-requests-page">

                <h1>🚛 My Collection Requests</h1>

                <div className="driver-error">
                    ❌ {error}
                </div>

            </div>
        );
    }


    return (
        <div className="driver-requests-page">

           
<div className="driver-requests-header">

    <div>
        <h1>📋 My Collection Requests</h1>
        <p>Manage your assigned collection requests</p>
    </div>

    <div className="driver-header-actions">

        <button
            className="driver-location-btn"
            onClick={updateDriverLocation}
        >
            📍 Update My Location
        </button>

        <div className="driver-request-count">
            <span>Active Requests</span>
            <strong>{requests.length}</strong>
        </div>

    </div>

</div>

            {requests.length === 0 ? (

                <div className="empty-driver-requests">

                    <h2>📭 No Active Requests</h2>

                    <p>
                        You currently have no assigned
                        collection requests.
                    </p>

                </div>

            ) : (

                <div className="driver-requests-grid">

                    {requests.map(request => (

                        <div
                            className="driver-request-card"
                            key={request.id}
                        >

                            <div className="driver-request-header">

                                <h2>
                                    Request #{request.id}
                                </h2>

                                <span
                                    className={`driver-status ${
                                        request.status?.toLowerCase()
                                    }`}
                                >
                                    {request.status}
                                </span>

                            </div>


                            <div className="driver-request-details">

                                <div>
                                    <span>🗑️ Bin</span>

                                    <strong>
                                        #{request.bin?.id || "N/A"}
                                    </strong>
                                </div>


                                <div>
                                    <span>📍 Location</span>

                                    <strong>
                                        {request.bin?.locationName ||
                                            "N/A"}
                                    </strong>
                                </div>


                                <div>
                                    <span>⚠️ Priority</span>

                                    <strong>
                                        {request.priority || "N/A"}
                                    </strong>
                                </div>


                                <div>
                                    <span>📅 Created</span>

                                    <strong>
                                        {request.createdAt
                                            ? new Date(
                                                request.createdAt
                                            ).toLocaleString()
                                            : "N/A"}
                                    </strong>
                                </div>

                            </div>


                            <div className="driver-request-actions">

                                {request.status === "ASSIGNED" && (

                                    <button
                                        className="driver-start-btn"
                                        onClick={() =>
                                            startRequest(
                                                request.id
                                            )
                                        }
                                        disabled={
                                            processingRequest ===
                                            request.id
                                        }
                                    >

                                        {processingRequest ===
                                        request.id
                                            ? "Starting..."
                                            : "▶ Start Collection"}

                                    </button>

                                )}


                                {request.status === "IN_PROGRESS" && (

                                    <button
                                        className="driver-complete-btn"
                                        onClick={() =>
                                            completeRequest(
                                                request.id
                                            )
                                        }
                                        disabled={
                                            processingRequest ===
                                            request.id
                                        }
                                    >

                                        {processingRequest ===
                                        request.id
                                            ? "Completing..."
                                            : "✓ Complete Collection"}

                                    </button>

                                )}

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default DriverRequests;