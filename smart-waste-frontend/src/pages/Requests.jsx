import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./Requests.css";
import CreateRequest from "../components/CreateRequest";
import API_BASE_URL from "../api";

function getUserRole() {
    const token = localStorage.getItem("token");

    if (!token) return null;

    try {
        const payload = JSON.parse(
            atob(
                token
                    .split(".")[1]
                    .replace(/-/g, "+")
                    .replace(/_/g, "/")
            )
        );

        return payload.role || null;
    } catch (error) {
        console.error("Unable to read JWT role:", error);
        return null;
    }
}

function Requests() {

    const [searchParams] = useSearchParams();

    const initialStatus = searchParams.get("status") || "ACTIVE";

    const [requests, setRequests] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [routes, setRoutes] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState(initialStatus);

    const [selectedDrivers, setSelectedDrivers] = useState({});
    const [selectedVehicles, setSelectedVehicles] = useState({});

    const [assigningRequest, setAssigningRequest] = useState(null);

const role = getUserRole();
    // =========================================
    // LOAD REQUESTS
    // =========================================

    const loadRequests = async () => {

        const token = localStorage.getItem("token");

        const response = await fetch(
            `${API_BASE_URL}/collection-requests`,
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

        return response.json();
    };


    // =========================================
    // LOAD DRIVERS
    // =========================================

    const loadDrivers = async () => {

        const token = localStorage.getItem("token");

        const response = await fetch(
            `${API_BASE_URL}/drivers`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                `Failed to load drivers: ${response.status}`
            );
        }

        return response.json();
    };


    // =========================================
    // LOAD VEHICLES
    // =========================================

    const loadVehicles = async () => {

        const token = localStorage.getItem("token");

        const response = await fetch(
            `${API_BASE_URL}/vehicles`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(
                `Failed to load vehicles: ${response.status}`
            );
        }

        return response.json();
    };


    const loadRoutes = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/routes`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to load routes: ${response.status}`);
    }

    return response.json();
};

    // =========================================
    // LOAD ALL DATA
    // =========================================

    useEffect(() => {

        const loadData = async () => {

            try {

                const [
    requestData,
    driverData,
    vehicleData,
    routeData
] = await Promise.all([
    loadRequests(),
    loadDrivers(),
    loadVehicles(),
    loadRoutes()
]);

                setRequests(
                    Array.isArray(requestData)
                        ? requestData
                        : []
                );

                setDrivers(
                    Array.isArray(driverData)
                        ? driverData
                        : []
                );

                setVehicles(
                    Array.isArray(vehicleData)
                        ? vehicleData
                        : []
                );

                setRoutes(
    Array.isArray(routeData) ? routeData : []
);

                setLoading(false);

            } catch (error) {

                console.error(
                    "Error loading request data:",
                    error
                );

                setError(error.message);
                setLoading(false);
            }
        };

        loadData();

    }, []);


    // =========================================
    // ASSIGN REQUEST
    // =========================================

    const assignRequest = async (requestId) => {

        const driverId =
            selectedDrivers[requestId];

        const vehicleId =
            selectedVehicles[requestId];


        if (!driverId) {

            alert("Please select a driver.");
            return;
        }


        if (!vehicleId) {

            alert("Please select a vehicle.");
            return;
        }


        const token = localStorage.getItem("token");

        setAssigningRequest(requestId);


        try {

            const response = await fetch(
                `${API_BASE_URL}/assignments/${requestId}?driverId=${driverId}&vehicleId=${vehicleId}`,
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
                    `Failed to assign request: ${response.status}`
                );
            }


            const updatedRequest =
                await response.json();


            setRequests(prevRequests =>
                prevRequests.map(request =>
                    request.id === requestId
                        ? updatedRequest
                        : request
                )
            );


            // Remove selected values
            // after successful assignment

            setSelectedDrivers(prev => {

                const updated = { ...prev };
                delete updated[requestId];

                return updated;
            });


            setSelectedVehicles(prev => {

                const updated = { ...prev };
                delete updated[requestId];

                return updated;
            });


        } catch (error) {

            console.error(
                "Assignment error:",
                error
            );

            alert(error.message);

        } finally {

            setAssigningRequest(null);
        }
    };


    // =========================================
    // START COLLECTION
    // =========================================

    const startRequest = async (requestId) => {

        const token = localStorage.getItem("token");

        try {

            const response = await fetch(
                `${API_BASE_URL}/collection-requests/${requestId}/start`,
                {
                    method: "PUT",

                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


            if (!response.ok) {

                throw new Error(
                    `Failed to start request: ${response.status}`
                );
            }


            const updatedRequest =
                await response.json();


            setRequests(prevRequests =>
                prevRequests.map(request =>
                    request.id === requestId
                        ? updatedRequest
                        : request
                )
            );


        } catch (error) {

            console.error(
                "Start request error:",
                error
            );

            alert(error.message);
        }
    };


    // =========================================
    // COMPLETE COLLECTION
    // =========================================

    const completeRequest = async (requestId) => {

        const token = localStorage.getItem("token");

        try {

            const response = await fetch(
                `${API_BASE_URL}/collection-requests/${requestId}/complete`,
                {
                    method: "PUT",

                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );


            if (!response.ok) {

                throw new Error(
                    `Failed to complete request: ${response.status}`
                );
            }


            const updatedRequest =
                await response.json();


            setRequests(prevRequests =>
                prevRequests.map(request =>
                    request.id === requestId
                        ? updatedRequest
                        : request
                )
            );


        } catch (error) {

            console.error(
                "Complete request error:",
                error
            );

            alert(error.message);
        }
    };


    // =========================================
    // FILTER REQUESTS
    // =========================================

    const filteredRequests = requests.filter(request => {

        const searchText =
            search.trim().toLowerCase();


        const matchesSearch =
            searchText === "" ||

            String(request.id)
                .includes(searchText) ||

            String(request.bin?.id || "")
                .includes(searchText) ||

            (request.bin?.locationName || "")
                .toLowerCase()
                .includes(searchText) ||

            (request.status || "")
                .toLowerCase()
                .includes(searchText) ||

            (request.priority || "")
                .toLowerCase()
                .includes(searchText);
const matchesStatus =
    statusFilter === "ALL" ||
    (statusFilter === "ACTIVE" &&
        ["PENDING", "ASSIGNED", "IN_PROGRESS"].includes(request.status)) ||
    request.status === statusFilter;

        return matchesSearch && matchesStatus;
    });


    // =========================================
    // LOADING
    // =========================================

    if (loading) {

        return (
            <div className="requests-page">

                <h2 className="requests-loading">
                    Loading collection requests...
                </h2>

            </div>
        );
    }


    // =========================================
    // ERROR
    // =========================================

    if (error) {

        return (
            <div className="requests-page">

                <h1>
                    📋 Collection Requests
                </h1>

                <div className="requests-error">
                    ❌ {error}
                </div>

            </div>
        );
    }


    // =========================================
    // UI
    // =========================================

    return (

        <div className="requests-page">

            {/* =================================
                HEADER
            ================================= */}

            <div className="requests-header">

                <div>

                    <h1>
                        📋 Collection Requests
                    </h1>

                    <p>
                        Monitor, assign and manage waste collection requests
                    </p>

                </div>


                <div className="request-count">

                    Showing:

                    <strong>
                        {filteredRequests.length}
                    </strong>

                    / {requests.length}

                </div>

            </div>
{role === "DISPATCHER" && (
    <CreateRequest
        onCreated={() => window.location.reload()}
    />
)}


            {/* =================================
                FILTERS
            ================================= */}

            <div className="requests-filters">

                <input
                    type="text"
                    placeholder="🔍 Search requests, bin, location..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />


                <select
                    value={statusFilter}
                    onChange={(e) =>
                        setStatusFilter(e.target.value)
                    }
                >

                <option value="ACTIVE">
    Active Requests
</option>

                    <option value="ALL">
                        All Status
                    </option>

                    <option value="PENDING">
                        Pending
                    </option>

                    <option value="ASSIGNED">
                        Assigned
                    </option>

                    <option value="IN_PROGRESS">
                        In Progress
                    </option>

                    <option value="COMPLETED">
                        Completed
                    </option>

                    <option value="CANCELLED">
                        Cancelled
                    </option>

                </select>


                <button
                    className="clear-filter-btn"
                    onClick={() => {

                        setSearch("");
                        setStatusFilter("ALL");

                    }}
                >
                    Clear Filters
                </button>

            </div>


            {/* =================================
                REQUEST LIST
            ================================= */}

            {filteredRequests.length === 0 ? (

                <div className="empty-requests">

                    <h2>
                        📭 No Requests Found
                    </h2>

                    <p>
                        No collection requests match
                        your search or filter.
                    </p>

                </div>

            ) : (

                <div className="requests-grid">

                    {filteredRequests.map(request => (

                        <div
                            className="request-card"
                            key={request.id}
                        >

                            {/* =====================
                                HEADER
                            ===================== */}

                            <div className="request-card-header">

                                <h2>
                                    Request #{request.id}
                                </h2>

                                <span
                                    className={`request-status ${
                                        request.status?.toLowerCase()
                                    }`}
                                >
                                    {request.status}
                                </span>

                            </div>


                            {/* =====================
                                DETAILS
                            ===================== */}

                            <div className="request-details">

                                <div>

                                    <span>
                                        🗑️ Bin
                                    </span>

                                    <strong>
                                        #{request.bin?.id || "N/A"}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        📍 Location
                                    </span>

                                    <strong>
                                        {request.bin?.locationName ||
                                            "N/A"}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        ⚠️ Priority
                                    </span>

                                    <strong>
                                        {request.priority || "N/A"}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        📅 Created
                                    </span>

                                    <strong>
                                        {request.createdAt
                                            ? new Date(
                                                request.createdAt
                                            ).toLocaleString()
                                            : "N/A"
                                        }
                                    </strong>

                                </div>


                                {/* Assigned Driver */}

                                {request.driver && (

                                    <div>

                                        <span>
                                            👨‍✈️ Driver
                                        </span>

                                        <strong>
                                            {request.driver.user?.name ||
                                                `Driver #${request.driver.id}`}
                                        </strong>

                                    </div>

                                )}


                                {/* Assigned Vehicle */}

                                {request.vehicle && (

                                    <div>

                                        <span>
                                            🚚 Vehicle
                                        </span>

                                        <strong>
                                            {request.vehicle.vehicleNumber ||
                                                `Vehicle #${request.vehicle.id}`}
                                        </strong>

                                    </div>

                                )}

                            </div>


                            {/* =====================
                                ASSIGNMENT
                            ===================== */}

                           {role === "DISPATCHER" && request.status === "PENDING" && (
    <div className="assignment-section">

                                    <h3>
                                        🔗 Assign Collection
                                    </h3>


                                    <div className="assignment-fields">

                                        {/* Driver */}

                                        <select
                                            value={
                                                selectedDrivers[
                                                    request.id
                                                ] || ""
                                            }
                                            onChange={(e) =>
                                                setSelectedDrivers(
                                                    prev => ({
                                                        ...prev,
                                                        [request.id]:
                                                            e.target.value
                                                    })
                                                )
                                            }
                                        >

                                            <option value="">
                                                Select Driver
                                            </option>

                                          {drivers
    .filter(driver =>
        driver.status === "AVAILABLE" ||
        routes.some(route =>
            String(route.driver?.id) === String(driver.id) &&
            route.status === "PLANNED"
        )
    )
    .map(driver => (

                                                    <option
                                                        key={driver.id}
                                                        value={driver.id}
                                                    >
                                                        {driver.user?.name ||
                                                            `Driver #${driver.id}`}
                                                    </option>

                                                ))}

                                        </select>


                                        {/* Vehicle */}

                                        <select
                                            value={
                                                selectedVehicles[
                                                    request.id
                                                ] || ""
                                            }
                                            onChange={(e) =>
                                                setSelectedVehicles(
                                                    prev => ({
                                                        ...prev,
                                                        [request.id]:
                                                            e.target.value
                                                    })
                                                )
                                            }
                                        >

                                            <option value="">
                                                Select Vehicle
                                            </option>

                                          {vehicles
    .filter(vehicle => {
        const driverId = selectedDrivers[request.id];

        if (!driverId) {
            return vehicle.status === "AVAILABLE";
        }

        const plannedRoute = routes.find(route =>
            String(route.driver?.id) === String(driverId) &&
            route.status === "PLANNED"
        );

        if (plannedRoute) {
            return String(vehicle.id) ===
                String(plannedRoute.vehicle?.id);
        }

        return vehicle.status === "AVAILABLE";
    })
    .map(vehicle => (

                                                    <option
                                                        key={vehicle.id}
                                                        value={vehicle.id}
                                                    >
                                                        {vehicle.vehicleNumber}
                                                    </option>

                                                ))}

                                        </select>

                                    </div>


                                    <button
                                        className="assign-btn"
                                        onClick={() =>
                                            assignRequest(
                                                request.id
                                            )
                                        }
                                        disabled={
                                            assigningRequest ===
                                            request.id
                                        }
                                    >

                                        {assigningRequest ===
                                        request.id
                                            ? "Assigning..."
                                            : "🔗 Assign Request"}

                                    </button>

                                </div>

                            )}


                            {/* =====================
                                ACTIONS
                            ===================== */}

                            <div className="request-actions">

                 {role === "DRIVER" && request.status === "ASSIGNED" && (

                                    <button
                                        className="start-btn"
                                        onClick={() =>
                                            startRequest(
                                                request.id
                                            )
                                        }
                                    >
                                        ▶ Start Collection
                                    </button>

                                )}


            {role === "DRIVER" && request.status === "IN_PROGRESS" && (

                                    <button
                                        className="complete-btn"
                                        onClick={() =>
                                            completeRequest(
                                                request.id
                                            )
                                        }
                                    >
                                        ✓ Complete Collection
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

export default Requests;