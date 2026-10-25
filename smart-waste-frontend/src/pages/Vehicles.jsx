import { useEffect, useState } from "react";
import "./vehicles.css";
import API_BASE_URL from "../api";
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
        console.error("Unable to read JWT role:", error);
        return null;
    }
}

function Vehicles() {

    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const role = getUserRole();

    // Add Vehicle form
    const [showForm, setShowForm] = useState(false);

    const [vehicleNumber, setVehicleNumber] = useState("");
    const [vehicleType, setVehicleType] = useState("");
    const [capacity, setCapacity] = useState("");
    const [status, setStatus] = useState("AVAILABLE");

    const [adding, setAdding] = useState(false);


    // =========================================
    // LOAD VEHICLES
    // =========================================

    const loadVehicles = async () => {

        const token = localStorage.getItem("token");

        try {

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

            const data = await response.json();

            setVehicles(
                Array.isArray(data) ? data : []
            );

            setLoading(false);

        } catch (error) {

            console.error(
                "Error loading vehicles:",
                error
            );

            setError(error.message);
            setLoading(false);
        }
    };


    useEffect(() => {
        loadVehicles();
    }, []);


    // =========================================
    // ADD VEHICLE
    // =========================================

    const addVehicle = async (event) => {

        event.preventDefault();

        const token = localStorage.getItem("token");

        setAdding(true);

        try {

            const response = await fetch(
                `${API_BASE_URL}/vehicles`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        vehicleNumber: vehicleNumber,
                        vehicleType: vehicleType,
                        capacity: Number(capacity),
                        status: status
                    })
                }
            );


            if (!response.ok) {

                const errorText =
                    await response.text();

                throw new Error(
                    errorText ||
                    `Failed to add vehicle: ${response.status}`
                );
            }


            const newVehicle =
                await response.json();


            setVehicles(prevVehicles => [
                ...prevVehicles,
                newVehicle
            ]);


            // Clear form

            setVehicleNumber("");
            setVehicleType("");
            setCapacity("");
            setStatus("AVAILABLE");

            setShowForm(false);

        } catch (error) {

            console.error(
                "Add vehicle error:",
                error
            );

            alert(error.message);

        } finally {

            setAdding(false);
        }
    };


    // =========================================
    // SEARCH
    // =========================================

    const filteredVehicles = vehicles.filter(vehicle => {

        const searchText =
            search.trim().toLowerCase();

        if (searchText === "") {
            return true;
        }

        return (

            String(vehicle.id)
                .includes(searchText) ||

            String(vehicle.vehicleNumber || "")
                .toLowerCase()
                .includes(searchText) ||

            String(vehicle.vehicleType || "")
                .toLowerCase()
                .includes(searchText) ||

            String(vehicle.status || "")
                .toLowerCase()
                .includes(searchText)
        );
    });


    // =========================================
    // LOADING
    // =========================================

    if (loading) {

        return (
            <div className="vehicles-page">

                <h2 className="vehicles-loading">
                    Loading vehicles...
                </h2>

            </div>
        );
    }


    // =========================================
    // ERROR
    // =========================================

    if (error) {

        return (
            <div className="vehicles-page">

                <h1>🚚 Vehicles</h1>

                <div className="vehicles-error">
                    ❌ {error}
                </div>

            </div>
        );
    }


    // =========================================
    // UI
    // =========================================

    return (

        <div className="vehicles-page">

            {/* =================================
                HEADER
            ================================= */}

            <div className="vehicles-header">

                <div>

                    <h1>
                        🚚 Vehicles
                    </h1>

                    <p>
                        Manage waste collection vehicles
                    </p>

                </div>


                <div className="vehicle-count">

                    Showing:

                    <strong>
                        {filteredVehicles.length}
                    </strong>

                    / {vehicles.length}

                </div>

            </div>


            {/* =================================
                ACTION BAR
            ================================= */}

            <div className="vehicles-toolbar">

                <input
                    type="text"
                    placeholder="🔍 Search vehicle, number, type, status..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />


                <button
                    className="clear-vehicle-filter"
                    onClick={() =>
                        setSearch("")
                    }
                >
                    Clear Search
                </button>


               {role === "ADMIN" && (
    <button
        className="add-vehicle-btn"
        onClick={() => setShowForm(!showForm)}
    >
        {showForm
            ? "✕ Close"
            : "＋ Add Vehicle"}
    </button>
)}

            </div>


            {/* =================================
                ADD VEHICLE FORM
            ================================= */}

            {showForm && (

                <form
                    className="vehicle-form"
                    onSubmit={addVehicle}
                >

                    <h2>
                        ➕ Add New Vehicle
                    </h2>


                    <div className="vehicle-form-grid">

                        <div className="form-group">

                            <label>
                                Vehicle Number
                            </label>

                            <input
                                type="text"
                                placeholder="e.g. MH12AB1234"
                                value={vehicleNumber}
                                onChange={(e) =>
                                    setVehicleNumber(
                                        e.target.value
                                    )
                                }
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Vehicle Type
                            </label>

                            <input
                                type="text"
                                placeholder="e.g. Garbage Truck"
                                value={vehicleType}
                                onChange={(e) =>
                                    setVehicleType(
                                        e.target.value
                                    )
                                }
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Capacity
                            </label>

                            <input
                                type="number"
                                placeholder="e.g. 1000"
                                min="0"
                                step="0.01"
                                value={capacity}
                                onChange={(e) =>
                                    setCapacity(
                                        e.target.value
                                    )
                                }
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Status
                            </label>

                            <select
                                value={status}
                                onChange={(e) =>
                                    setStatus(
                                        e.target.value
                                    )
                                }
                            >

                                <option value="AVAILABLE">
                                    Available
                                </option>

                                <option value="IN_USE">
                                    In Use
                                </option>

                                <option value="MAINTENANCE">
                                    Maintenance
                                </option>

                            </select>

                        </div>

                    </div>


                    <button
                        type="submit"
                        className="save-vehicle-btn"
                        disabled={adding}
                    >

                        {adding
                            ? "Adding..."
                            : "✓ Add Vehicle"}

                    </button>

                </form>

            )}


            {/* =================================
                EMPTY STATE
            ================================= */}

            {filteredVehicles.length === 0 ? (

                <div className="empty-vehicles">

                    <h2>
                        🚚 No Vehicles Found
                    </h2>

                    <p>
                        No vehicles match your search.
                    </p>

                </div>

            ) : (

                /* =================================
                   VEHICLE GRID
                ================================= */

                <div className="vehicles-grid">

                    {filteredVehicles.map(vehicle => (

                        <div
                            className="vehicle-card"
                            key={vehicle.id}
                        >

                            {/* CARD HEADER */}

                            <div className="vehicle-card-header">

                                <div className="vehicle-icon">
                                    🚚
                                </div>

                                <div>

                                    <h2>
                                        {vehicle.vehicleNumber}
                                    </h2>

                                    <span>
                                        Vehicle ID: #{vehicle.id}
                                    </span>

                                </div>

                            </div>


                            {/* STATUS */}

                            <div className="vehicle-status-row">

                                <span>
                                    Status
                                </span>

                                <span
                                    className={`vehicle-status ${
                                        vehicle.status?.toLowerCase()
                                    }`}
                                >
                                    {vehicle.status}
                                </span>

                            </div>


                            {/* DETAILS */}

                            <div className="vehicle-details">

                                <div>

                                    <span>
                                        🚛 Type
                                    </span>

                                    <strong>
                                        {vehicle.vehicleType}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        📦 Capacity
                                    </span>

                                    <strong>
                                        {vehicle.capacity}
                                    </strong>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default Vehicles;