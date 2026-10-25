import { useEffect, useState } from "react";

import RouteMap from "../components/RouteMap";

import "./Routes.css";



import API_BASE_URL from "../api";



const API = API_BASE_URL;











function getUserRole() {







    const token = localStorage.getItem("token");







    if (!token) {



        return null;



    }







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







        console.error(



            "Unable to read JWT role:",



            error



        );







        return null;



    }



}











function getDriverId() {
    const token = localStorage.getItem("token");

    if (!token) {
        return null;
    }

    try {
        const payload = JSON.parse(
            atob(
                token
                    .split(".")[1]
                    .replace(/-/g, "+")
                    .replace(/_/g, "/")
            )
        );

        return payload.driverId || null;
    } catch (error) {
        console.error("Unable to read JWT driver ID:", error);
        return null;
    }
}


function Routes() {







    const [routes, setRoutes] = useState([]);







    const [drivers, setDrivers] = useState([]);







    const [vehicles, setVehicles] = useState([]);



    const [routeStops, setRouteStops] = useState({});
    
const [addingStopRouteId, setAddingStopRouteId] = useState(null);
const [availableRequests, setAvailableRequests] = useState([]);
const [selectedRequestId, setSelectedRequestId] = useState("");
const [addingStop, setAddingStop] = useState(false);
const [addStopMessage, setAddStopMessage] = useState("");








    const [loading, setLoading] = useState(true);







    const [error, setError] = useState("");







    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ACTIVE");







    const [showPlanner, setShowPlanner] = useState(false);







    const [selectedDriver, setSelectedDriver] = useState("");







    const [selectedVehicle, setSelectedVehicle] = useState("");







    const [planning, setPlanning] = useState(false);
    const [trackingRouteId, setTrackingRouteId] = useState(null);







    const [plannerMessage, setPlannerMessage] = useState("");











    const role = getUserRole();
    const driverId = getDriverId();











    // =========================================



    // LOAD ROUTES



    // =========================================







    const loadRoutes = async () => {







        try {







            const token =



                localStorage.getItem("token");







            const response = await fetch(



                `${API}/routes`,



                {



                    headers: {



                        Authorization:



                            `Bearer ${token}`



                    }



                }



            );











            if (!response.ok) {







                throw new Error(



                    `Failed to load routes: ${response.status}`



                );







            }











            const data =



                await response.json();











            setRoutes(



                Array.isArray(data)



                    ? data



                    : []



            );











        } catch (error) {







            console.error(



                "Error loading routes:",



                error



            );







            setError(error.message);







        }







    };











    // =========================================

    // LOAD ROUTE STOPS

    // =========================================



    const loadRouteStops = async (routeId) => {

        try {

            const token = localStorage.getItem("token");



            const response = await fetch(

                `${API}/routes/${routeId}/stops`,

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );



            if (!response.ok) {

                throw new Error("Failed to load route stops");

            }



            const data = await response.json();



            setRouteStops(prev => ({

                ...prev,

                [routeId]: Array.isArray(data) ? data : []

            }));

        } catch (error) {

            console.error(

                `Error loading stops for route ${routeId}:`,

                error

            );

        }

    };


const loadAvailableRequests = async () => {
    try {
        setAddStopMessage("");

        const token = localStorage.getItem("token");

        const response = await fetch(`${API}/collection-requests`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(
                `Failed to load collection requests: ${response.status}`
            );
        }

        const data = await response.json();
        const requests = Array.isArray(data) ? data : [];

        // Load the latest stops from every route.
        const stopsByRoute = await Promise.all(
            routes.map(async (route) => {
                const stopsResponse = await fetch(
                    `${API}/routes/${route.id}/stops`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!stopsResponse.ok) {
                    throw new Error(
                        `Failed to load stops for Route #${route.id}`
                    );
                }

                const stops = await stopsResponse.json();
                return Array.isArray(stops) ? stops : [];
            })
        );

        const assignedRequestIds = new Set(
            stopsByRoute
                .flat()
                .map(stop => stop.collectionRequest?.id)
                .filter(id => id != null)
                .map(String)
        );

        const available = requests.filter(request =>
            request.status === "ASSIGNED" &&
            !assignedRequestIds.has(String(request.id))
        );

        setAvailableRequests(available);

        if (available.length === 0) {
            setAddStopMessage(
                "No unassigned collection requests with ASSIGNED status were found."
            );
        }
    } catch (error) {
        console.error("Error loading available requests:", error);
        setAddStopMessage(error.message);
    }
};




const handleAddStop = async (routeId) => {
    if (!selectedRequestId) {
        setAddStopMessage("Please select a collection request.");
        return;
    }

    setAddingStop(true);
    setAddStopMessage("");

    try {
        const token = localStorage.getItem("token");

        const response = await fetch(
            `${API}/routes/${routeId}/stops?requestId=${selectedRequestId}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const responseText = await response.text();

        if (!response.ok) {
            let message = responseText || "Failed to add route stop.";

            try {
                const errorData = JSON.parse(responseText);
                message = errorData.error || errorData.message || message;
            } catch {
                // Keep the original response text.
            }

            throw new Error(message);
        }

        setAddStopMessage("Stop added successfully!");
        setSelectedRequestId("");

        await loadRouteStops(routeId);
        await loadRoutes();

        // Refresh requests and the updated route stops.
        await loadAvailableRequests();
    } catch (error) {
        console.error("Error adding route stop:", error);
        setAddStopMessage(error.message);
    } finally {
        setAddingStop(false);
    }
};


    // =========================================



    // LOAD DRIVERS



    // =========================================







    const loadDrivers = async () => {







        try {







            const token =



                localStorage.getItem("token");











            const response = await fetch(



                `${API}/drivers`,



                {



                    headers: {



                        Authorization:



                            `Bearer ${token}`



                    }



                }



            );











            if (!response.ok) {







                throw new Error(



                    `Failed to load drivers: ${response.status}`



                );







            }











            const data =



                await response.json();











            setDrivers(



                Array.isArray(data)



                    ? data



                    : []



            );











        } catch (error) {







            console.error(



                "Error loading drivers:",



                error



            );







        }







    };











    // =========================================



    // LOAD VEHICLES



    // =========================================







    const loadVehicles = async () => {







        try {







            const token =



                localStorage.getItem("token");











            const response = await fetch(



                `${API}/vehicles`,



                {



                    headers: {



                        Authorization:



                            `Bearer ${token}`



                    }



                }



            );











            if (!response.ok) {







                throw new Error(



                    `Failed to load vehicles: ${response.status}`



                );







            }











            const data =



                await response.json();











            setVehicles(



                Array.isArray(data)



                    ? data



                    : []



            );











        } catch (error) {







            console.error(



                "Error loading vehicles:",



                error



            );







        }







    };











    // =========================================



    // INITIAL LOAD



    // =========================================







    useEffect(() => {







        const loadData = async () => {







            setLoading(true);







            await Promise.all([



                loadRoutes(),



                loadDrivers(),



                loadVehicles()



            ]);







            setLoading(false);







        };











        loadData();







    }, []);







    // Load stops whenever the route list changes

    useEffect(() => {

        routes.forEach(route => {

            loadRouteStops(route.id);

        });

    }, [routes]);







    // =========================================



    // AUTOMATIC ROUTE PLANNING



    // =========================================







    const planRouteAutomatically = async (event) => {







        event.preventDefault();











      if (!selectedDriver || !selectedVehicle) {
    setPlannerMessage("Please select both a driver and a vehicle.");
    return;
}











        setPlanning(true);







        setPlannerMessage("");











        try {







            const token =



                localStorage.getItem("token");











            const response = await fetch(



                `${API}/routes/auto-plan?driverId=${selectedDriver}&vehicleId=${selectedVehicle}`,



                {



                    method: "POST",







                    headers: {



                        Authorization:



                            `Bearer ${token}`



                    }



                }



            );











            const responseText =



                await response.text();











        
if (!response.ok) {
    let errorMessage = `Route planning failed (${response.status}).`;

    try {
        const errorData = JSON.parse(responseText);

        if (errorData.error) {
            errorMessage = errorData.error;
        } else if (errorData.message) {
            errorMessage = errorData.message;
        }
    } catch {
        if (responseText && !responseText.startsWith("<")) {
            errorMessage = responseText;
        }
    }

    if (
        errorMessage.includes(
            "No unrouted collection requests available"
        )
    ) {
        errorMessage =
           "No new requests to plan right now. Please check back when new requests are available! 😊"
    }

    throw new Error(errorMessage);
}












            const createdRoute =



                JSON.parse(responseText);











            console.log(



                "Automatically planned route:",



                createdRoute



            );











            setPlannerMessage(



                `Route #${createdRoute.id} planned successfully!`



            );











            setSelectedDriver("");







            setSelectedVehicle("");











            await loadRoutes();











            setTimeout(() => {







                setShowPlanner(false);







                setPlannerMessage("");







            }, 1500);











        } catch (error) {







            console.error(



                "Automatic route planning error:",



                error



            );











            setPlannerMessage(



                error.message



            );











        } finally {







            setPlanning(false);







        }







    };











    // =========================================



    // DRIVER ROUTE STATUS

    const updateRouteStatus = async (routeId, status) => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API}/routes/${routeId}/status?status=${status}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const responseText = await response.text();

            if (!response.ok) {
                throw new Error(
                    responseText ||
                    `Unable to update route status: ${response.status}`
                );
            }

            await loadRoutes();

if (status === "IN_PROGRESS" && role === "DRIVER") {
    startLocationTracking(routeId);
}


if (status === "COMPLETED" && role === "DRIVER") {

    if (window.driverWatchId !== undefined) {

        navigator.geolocation.clearWatch(
            window.driverWatchId
        );

        window.driverWatchId = undefined;
    }

    setTrackingRouteId(null);
}
        } catch (error) {
            console.error("Route status update error:", error);
            setError(error.message);
        }
    };


    const startLocationTracking = (routeId) => {
    const token = localStorage.getItem("token");

    if (!navigator.geolocation) {
        setError("Geolocation is not supported by this browser.");
        return;
    }

    const payload = JSON.parse(
        atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );

    const driverId = payload.driverId;

    if (!driverId) {
        setError("Driver ID not found in JWT.");
        return;
    }

    const watchId = navigator.geolocation.watchPosition(
        async (position) => {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            try {

                const response = await fetch(
                 `${API}/driver-locations/${driverId}` +
`?latitude=${latitude}&longitude=${longitude}`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText);
                }

                console.log(
                    "Driver location updated:",
                    latitude,
                    longitude
                );

            } catch (error) {

                console.error(
                    "Live location update error:",
                    error
                );

            }
        },

        (error) => {
            console.error(
                "GPS tracking error:",
                error
            );
        },

        {
            enableHighAccuracy: true,
            maximumAge: 5000,
            timeout: 10000
        }
    );

    setTrackingRouteId(routeId);

    // Store watch ID so we can stop tracking later
    window.driverWatchId = watchId;
};


    // SEARCH



    // =========================================







   
const visibleRoutes =
    role === "DRIVER" && driverId
        ? routes.filter(
              route => String(route.driver?.id) === String(driverId)
          )
        : routes;

const filteredRoutes = visibleRoutes.filter(route => {
    const searchText = search.trim().toLowerCase();
    const status = String(route.status || "").toUpperCase();

    // Status filter
    if (statusFilter === "ACTIVE") {
        if (status === "COMPLETED" || status === "CANCELLED") {
            return false;
        }
    } else if (statusFilter !== "ALL" && status !== statusFilter) {
        return false;
    }

    // Search filter
    if (searchText === "") {
        return true;
    }

    return (
        String(route.id).includes(searchText) ||
        status.toLowerCase().includes(searchText) ||
        String(route.driver?.user?.name || "")
            .toLowerCase().includes(searchText) ||
        String(route.driver?.user?.email || "")
            .toLowerCase().includes(searchText) ||
        String(route.vehicle?.vehicleNumber || "")
            .toLowerCase().includes(searchText)
    );
});












    // =========================================



    // LOADING



    // =========================================







    if (loading) {







        return (







            <div className="routes-page">







                <h2 className="routes-loading">



                    Loading routes...



                </h2>







            </div>







        );







    }











    // =========================================



    // ERROR



    // =========================================







    if (error) {







        return (







            <div className="routes-page">







                <h1>🗺️ Routes</h1>







                <div className="routes-error">



                    ❌ {error}



                </div>







            </div>







        );







    }











    // =========================================



    // PAGE TITLE



    // =========================================







    const pageTitle =



        role === "DRIVER"



            ? "🗺️ My Routes"



            : "🗺️ Route Management";











    const pageDescription =



        role === "DRIVER"



            ? "View your assigned collection routes"



            : "Monitor and automatically plan collection routes";











    return (







        <div className="routes-page">











            {/* =================================



                HEADER



            ================================= */}







            <div className="routes-header">







                <div>







                    <h1>



                        {pageTitle}



                    </h1>







                    <p>



                        {pageDescription}



                    </p>







                </div>











                <div className="route-count">







                    Showing:







                    <strong>



                        {filteredRoutes.length}



                    </strong>







                    / {visibleRoutes.length}







                </div>







            </div>











            {/* =================================



                DISPATCHER ACTION



            ================================= */}







            {



            role === "DISPATCHER" ? (







                <div className="route-planner-section">







                    <div>







                        <h2>



                            🤖 Automatic Route Planning



                        </h2>







                        <p>



                            Let the system select the best



                            collection requests using



                            priority and real road distance.



                        </p>







                    </div>











                    <button



                        className="plan-route-btn"



                        onClick={() => {







                            setPlannerMessage("");







                            setShowPlanner(true);







                        }}



                    >



                        🤖 Plan Route Automatically



                    </button>







                </div>







            ) : null}











            {/* =================================



                PLANNER FORM



            ================================= */}







            {showPlanner && (







                <div className="planner-card">







                    <div className="planner-card-header">







                        <div>







                            <h2>



                                🤖 Automatic Route Planning



                            </h2>







                            <p>



                                Select the driver and vehicle.



                                The backend will automatically



                                determine the best route.



                            </p>







                        </div>











                        <button



                            className="planner-close-btn"



                            onClick={() => {







                                setShowPlanner(false);







                                setPlannerMessage("");







                            }}



                        >



                            ✕



                        </button>







                    </div>











                    <form



                        className="planner-form"



                        onSubmit={planRouteAutomatically}



                    >











                        {/* DRIVER */}







                        <div className="planner-field">







                            <label>



                                👨‍✈️ Driver



                            </label>











                            <select



                                value={selectedDriver}



                                onChange={(e) =>



                                    setSelectedDriver(



                                        e.target.value



                                    )



                                }



                                required



                            >







                                <option value="">



                                    Select Driver



                                </option>











                                {drivers



                                    .filter(



                                        driver =>



                                            driver.status ===



                                            "ON_DUTY"



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







                        </div>











                        {/* VEHICLE */}







                        <div className="planner-field">







                            <label>



                                🚚 Vehicle



                            </label>











                            <select



                                value={selectedVehicle}



                                onChange={(e) =>



                                    setSelectedVehicle(



                                        e.target.value



                                    )



                                }



                                required



                            >







                                <option value="">



                                    Select Vehicle



                                </option>











                                {vehicles



                                    .filter(



                                        vehicle =>



                                            vehicle.status ===



                                            "IN_USE"



                                    )



                                    .map(vehicle => (







                                        <option



                                            key={vehicle.id}



                                            value={vehicle.id}



                                        >







                                            {vehicle.vehicleNumber}



                                            {" — "}



                                            {vehicle.vehicleType}







                                        </option>







                                    ))}







                            </select>







                        </div>











                        {/* MESSAGE */}







                       
{plannerMessage != null && (
    <div
        className={
            String(plannerMessage).includes("successfully")
                ? "planner-success"
                : "planner-error"
        }
    >
        {String(plannerMessage)}
    </div>
)}




                        {/* ACTIONS */}







                        <div className="planner-actions">







                            <button



                                type="button"



                                className="planner-cancel-btn"



                                onClick={() => {







                                    setShowPlanner(false);







                                    setPlannerMessage("");







                                }}



                            >



                                Cancel



                            </button>











                            <button



                                type="submit"



                                className="planner-submit-btn"



                                disabled={planning}



                            >







                                {planning



                                    ? "🤖 Planning..."



                                    : "🤖 Plan Route"}







                            </button>







                        </div>







                    </form>







                </div>







            )}











            {/* =================================



                SEARCH



            ================================= */}







            <div className="routes-filters">







                <input



                    type="text"



                    placeholder="🔍 Search route, driver, vehicle, status..."



                    value={search}



                    onChange={(e) =>



                        setSearch(e.target.value)



                    }



                />






    <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        aria-label="Filter routes by status"
    >
        <option value="ACTIVE">Active Routes</option>
        <option value="ALL">All Statuses</option>
        <option value="PLANNED">Planned</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="COMPLETED">Completed</option>
        <option value="CANCELLED">Cancelled</option>
    </select>




                <button



                    className="clear-route-filter"



                    onClick={() =>



                        setSearch("")



                    }



                >



                    Clear Search



                </button>







            </div>











            {/* =================================



                EMPTY



            ================================= */}







            {filteredRoutes.length === 0 ? (







                <div className="empty-routes">







                    <h2>



                        🗺️ No Routes Found



                    </h2>







                    <p>



                        No routes match your search.



                    </p>







                </div>







            ) : (











                /* =================================



                   ROUTE GRID



                ================================= */







                <div className="routes-grid">







                    {filteredRoutes.map(route => (







                        <div



                            className="route-card"



                            key={route.id}



                        >











                            {/* HEADER */}







                            <div className="route-card-header">







                                <div className="route-icon">



                                    🗺️



                                </div>











                                <div>







                                    <h2>



                                        Route #{route.id}



                                    </h2>







                                    <span>



                                        Created:{" "}



                                        {route.createdAt



                                            ? new Date(



                                                route.createdAt



                                            ).toLocaleString()



                                            : "N/A"}



                                    </span>







                                </div>







                            </div>











                            {/* STATUS */}







                            <div className="route-status-row">







                                <span>



                                    Status



                                </span>











                                <span



                                    className={`route-status ${



                                        route.status?.toLowerCase()



                                    }`}



                                >



                                    {route.status}



                                </span>







                            </div>











                            {/* DRIVER */}







                            <div className="route-section">







                                <h3>



                                    👨‍✈️ Driver



                                </h3>











                                <div className="route-details">







                                    <div>







                                        <span>



                                            Name



                                        </span>







                                        <strong>



                                            {route.driver?.user?.name ||



                                                "N/A"}



                                        </strong>







                                    </div>











                                    <div>







                                        <span>



                                            License



                                        </span>







                                        <strong>



                                            {route.driver?.licenseNumber ||



                                                "N/A"}



                                        </strong>







                                    </div>







                                </div>







                            </div>











                            {/* VEHICLE */}







                            <div className="route-section">







                                <h3>



                                    🚚 Vehicle



                                </h3>











                                <div className="route-details">







                                    <div>







                                        <span>



                                            Vehicle Number



                                        </span>







                                        <strong>



                                            {route.vehicle?.vehicleNumber ||



                                                "N/A"}



                                        </strong>







                                    </div>











                                    <div>







                                        <span>



                                            Type



                                        </span>







                                        <strong>



                                            {route.vehicle?.vehicleType ||



                                                "N/A"}



                                        </strong>







                                    </div>







                                </div>







                            </div>















                            {/* ROUTE STOPS */}

                            {/* ROUTE STOPS */}
<div className="route-stops-section">

    <h3>📍 Route Stops</h3>

    {routeStops[route.id]?.length > 0 ? (

        <div className="route-stops-list">

            {routeStops[route.id].map(stop => (

                <div
                    className="route-stop-card"
                    key={stop.id}
                >

                    <div className="route-stop-number">
                        {stop.stopOrder}
                    </div>

                    <div className="route-stop-info">

                        <strong>
                            {stop.collectionRequest?.bin?.locationName ||
                                `Bin #${stop.collectionRequest?.bin?.id}`}
                        </strong>

                        <span>
                            🗑️ Bin #{stop.collectionRequest?.bin?.id}
                        </span>

                        <span>
                            📋 Request #{stop.collectionRequest?.id}
                        </span>

                        <span>
                            Status: {stop.collectionRequest?.status}
                        </span>

                    </div>

                </div>

            ))}

        </div>

    ) : (

        <p className="no-route-stops">
            No collection stops assigned to this route.
        </p>

    )}

</div>
{/* 
{/* ADD STOP — ADMIN / DISPATCHER */}
{/* {role === "DISPATCHER" &&
    route.status !== "COMPLETED" &&
    route.status !== "CANCELLED" && (
        <div className="add-stop-section">
            <button
                type="button"
                className="add-stop-btn"
                onClick={async () => {
                    setAddingStopRouteId(route.id);
                    setSelectedRequestId("");
                    setAddStopMessage("");
                    await loadAvailableRequests();
                }}
            >
                + Add Stop
            </button>

            {addingStopRouteId === route.id && (
                <div className="add-stop-form">
                    <label>
                        Select Collection Request
                    </label>

                    <select
                        value={selectedRequestId}
                        onChange={(e) =>
                            setSelectedRequestId(e.target.value)
                        }
                    >
                        <option value="">
                            Select a request
                        </option>

                        {availableRequests.map(request => (
                            <option
                                key={request.id}
                                value={request.id}
                            >
                                Request #{request.id} —{" "}
                                {request.bin?.locationName ||
                                    `Bin #${request.bin?.id}`}{" "}
                                ({request.status})
                            </option>
                        ))}
                    </select>

                    {availableRequests.length === 0 && (
                        <p>
                            No eligible collection requests available.
                        </p>
                    )}

                    {addStopMessage && (
                        <p role="status">
                            {addStopMessage}
                        </p>
                    )}

                    <button
                        type="button"
                        disabled={addingStop || !selectedRequestId}
                        onClick={() => handleAddStop(route.id)}
                    >
                        {addingStop ? "Adding..." : "Confirm Add Stop"}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setAddingStopRouteId(null);
                            setSelectedRequestId("");
                            setAddStopMessage("");
                        }}
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    )}  */}


{/* DRIVER ROUTE MAP */}
{role === "DRIVER" && routeStops[route.id]?.length > 0 && (

    <div className="route-map-section">

        <h3>🗺️ Route Map</h3>

      <RouteMap
    stops={routeStops[route.id]}
    driverId={driverId}
/>

    </div>

)}


{/* DRIVER ROUTE ACTIONS */}
{role === "DRIVER" && (

    <div className="driver-route-actions">

        {route.status === "PLANNED" && (

            <button
                className="start-route-btn"
                onClick={() =>
                    updateRouteStatus(route.id, "IN_PROGRESS")
                }
            >
                ▶ Start Route
            </button>

        )}

        {route.status === "IN_PROGRESS" && (

            <button
                className="complete-route-btn"
                onClick={() =>
                    updateRouteStatus(route.id, "COMPLETED")
                }
            >
                ✓ Complete Route
            </button>

        )}

    </div>

)}
                        </div>







                    ))}







                </div>







            )}







        </div>







    );







}







export default Routes;