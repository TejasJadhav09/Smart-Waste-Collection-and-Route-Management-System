import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./Bins.css";

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
        console.error("Unable to read user role:", error);
        return null;
    }
}

function Bins() {

    const [searchParams] = useSearchParams();

    const initialStatus =
        searchParams.get("status") || "ALL";

    const [bins, setBins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] =
        useState(initialStatus);
const [zones, setZones] = useState([]);
const [showAddForm, setShowAddForm] = useState(false);
const [creating, setCreating] = useState(false);
const [formError, setFormError] = useState("");
const [formMessage, setFormMessage] = useState("");

const [newBin, setNewBin] = useState({
    locationName: "",
    latitude: "",
    longitude: "",
    capacity: "",
    zoneId: ""
});
    const role = getUserRole();

   useEffect(() => {
    const loadBins = async (showLoading = false) => {
        try {
            const token = localStorage.getItem("token");

            if (showLoading) {
                setLoading(true);
            }

            const response = await fetch(
                "http://localhost:8080/bins",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Failed to load bins: ${response.status}`
                );
            }

            const data = await response.json();

            setBins(
                Array.isArray(data)
                    ? data
                    : []
            );

            setError("");

        } catch (error) {
            console.error(
                "Error loading bins:",
                error
            );

            setError(error.message);

        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    };

    const loadZones = async () => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch("http://localhost:8080/zones", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to load zones: ${response.status}`);
        }

        const data = await response.json();
        setZones(Array.isArray(data) ? data : []);
    } catch (error) {
        console.error("Error loading zones:", error);
        setFormError(error.message);
    }
};

    // Initial load
    loadBins(true);

    if (role === "ADMIN") {
    loadZones();
}

    // Refresh bin data every 5 seconds
    const intervalId = setInterval(() => {
        loadBins(false);
    }, 5000);

    // Stop polling when leaving the page
    return () => {
        clearInterval(intervalId);
    };

}, []);

    const filteredBins = bins.filter(bin => {

        const searchText =
            search.trim().toLowerCase();

        const matchesSearch =
            searchText === "" ||

            String(bin.id)
                .includes(searchText) ||

            (bin.locationName || "")
                .toLowerCase()
                .includes(searchText) ||

            (bin.status || "")
                .toLowerCase()
                .includes(searchText) ||

            (bin.zone?.name || "")
                .toLowerCase()
                .includes(searchText);

        const matchesStatus =
            statusFilter === "ALL" ||
            bin.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getPageTitle = () => {

        if (role === "RESIDENT") {
            return "📍 Nearby Bins";
        }

        return "🗑️ Waste Bins";
    };

    const getPageDescription = () => {

        if (role === "ADMIN") {
            return "Monitor all waste bins and their current status";
        }

        if (role === "DISPATCHER") {
            return "Monitor bin status for collection planning";
        }

        if (role === "DRIVER") {
            return "View bin status during collection";
        }

        if (role === "RESIDENT") {
            return "View nearby waste bins and their fill levels";
        }

        return "Monitor bin status and fill levels";
    };

    const openMap = (latitude, longitude) => {

        if (
            latitude === null ||
            latitude === undefined ||
            longitude === null ||
            longitude === undefined
        ) {
            alert("Location coordinates are not available.");
            return;
        }

        const mapUrl =
            `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=18/${latitude}/${longitude}`;

        window.open(
            mapUrl,
            "_blank",
            "noopener,noreferrer"
        );
    };

    if (loading) {

        return (
            <h2 className="bins-loading">
                Loading bins...
            </h2>
        );
    }

    if (error) {

        return (
            <div className="bins-page">

                <h1>
                    {getPageTitle()}
                </h1>

                <div className="bins-error">
                    ❌ {error}
                </div>

            </div>
        );
    }

    return (

        <div className="bins-page">

            {/* HEADER */}

            
<div className="bins-header">
    <div>
        <h1>{getPageTitle()}</h1>
        <p>{getPageDescription()}</p>
    </div>

    <div className="bin-header-actions">
        <div className="bin-count">
            Showing: <strong>{filteredBins.length} / {bins.length}</strong>
            
        </div>

      
    </div>
</div>

{role === "ADMIN" && showAddForm && (
    <form
        className="add-bin-form"
        onSubmit={async (event) => {
            event.preventDefault();
            setCreating(true);
            setFormError("");
            setFormMessage("");

            try {
                const token = localStorage.getItem("token");

                const response = await fetch(
                    "http://localhost:8080/bins",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            locationName: newBin.locationName.trim(),
                            latitude: Number(newBin.latitude),
                            longitude: Number(newBin.longitude),
                            capacity: Number(newBin.capacity),
                            currentFillLevel: 0,
                            status: "LOW",
                            zone: {
                                id: Number(newBin.zoneId)
                            }
                        })
                    }
                );

                const responseText = await response.text();

                if (!response.ok) {
                    throw new Error(
                        responseText || `Failed to add bin: ${response.status}`
                    );
                }

                setFormMessage("Bin added successfully.");
                setNewBin({
                    locationName: "",
                    latitude: "",
                    longitude: "",
                    capacity: "",
                    zoneId: ""
                });

                const refreshResponse = await fetch(
                    "http://localhost:8080/bins",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (refreshResponse.ok) {
                    const data = await refreshResponse.json();
                    setBins(Array.isArray(data) ? data : []);
                }

                setShowAddForm(false);
            } catch (error) {
                console.error("Add bin error:", error);
                setFormError(error.message);
            } finally {
                setCreating(false);
            }
        }}
    >
       <h2>
  <span className="plus-icon">✚</span> Add New Bin
</h2>

        <div className="add-bin-grid">
            <label>
                Location Name
                <input
                    value={newBin.locationName}
                    onChange={(event) =>
                        setNewBin({
                            ...newBin,
                            locationName: event.target.value
                        })
                    }
                    required
                />
            </label>

            <label>
                Latitude
                <input
                    type="number"
                    step="any"
                    min="-90"
                    max="90"
                    value={newBin.latitude}
                    onChange={(event) =>
                        setNewBin({
                            ...newBin,
                            latitude: event.target.value
                        })
                    }
                    required
                />
            </label>

            <label>
                Longitude
                <input
                    type="number"
                    step="any"
                    min="-180"
                    max="180"
                    value={newBin.longitude}
                    onChange={(event) =>
                        setNewBin({
                            ...newBin,
                            longitude: event.target.value
                        })
                    }
                    required
                />
            </label>

            <label>
                Capacity
                <input
                    type="number"
                    min="0.01"
                    step="any"
                    value={newBin.capacity}
                    onChange={(event) =>
                        setNewBin({
                            ...newBin,
                            capacity: event.target.value
                        })
                    }
                    required
                />
            </label>

            <label>
                Zone
                <select
                    value={newBin.zoneId}
                    onChange={(event) =>
                        setNewBin({
                            ...newBin,
                            zoneId: event.target.value
                        })
                    }
                    required
                >
                    <option value="">Select a zone</option>
                    {zones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                            {zone.name}
                        </option>
                    ))}
                </select>
            </label>
        </div>

        {formError && <p className="bins-error">{formError}</p>}
        {formMessage && <p>{formMessage}</p>}

        <button type="submit" disabled={creating}>
            {creating ? "Adding..." : "Add Bin"}
        </button>
    </form>
)}



            {/* SEARCH AND FILTER */}

            <div className="bins-filters">

                <input
                    type="text"
                    placeholder="🔍 Search bins, location, status..."
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

                    <option value="ALL">
                        All Status
                    </option>

                    <option value="CRITICAL">
                        Critical
                    </option>

                    <option value="HIGH">
                        High
                    </option>

                    <option value="NORMAL">
                        Normal
                    </option>

                    <option value="LOW">
                        Low
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


                {role === "ADMIN" && (
  <button
    type="button"
    className="add-bin-btn"
    onClick={() => {
      setFormError("");
      setFormMessage("");
      setShowAddForm(!showAddForm);
    }}
  >
    {showAddForm ? "✕ Close" : "＋ Add Bin"}
  </button>
)}

            </div>


            {/* BIN CARDS */}

            {filteredBins.length === 0 ? (

                <div className="empty-bins">

                    <h2>
                        📭 No Bins Found
                    </h2>

                    <p>
                        No bins match your current
                        search or filter.
                    </p>

                </div>

            ) : (

                <div className="bins-grid">

                    {filteredBins.map(bin => {

                        const fillPercentage =
                            bin.capacity > 0
                                ? Math.round(
                                    (
                                        bin.currentFillLevel /
                                        bin.capacity
                                    ) * 100
                                )
                                : 0;

                        return (

                            <div
                                className="bin-card"
                                key={bin.id}
                            >

                                {/* CARD HEADER */}

                                <div className="bin-card-header">

                                    <h2>
                                        Bin #{bin.id}
                                    </h2>

                                    <span
                                        className={`status-badge ${bin.status?.toLowerCase()}`}
                                    >
                                        {bin.status}
                                    </span>

                                </div>


                                {/* LOCATION */}

                                <div className="bin-location">

                                    📍 {bin.locationName}

                                </div>


                                {/* FILL LEVEL */}

                                <div className="fill-section">

                                    <div className="fill-info">

                                        <span>
                                            Fill Level
                                        </span>

                                        <strong>
                                            {fillPercentage}%
                                        </strong>

                                    </div>

                                    <div className="progress-bar">

                                        <div
                                            className={`progress-fill ${bin.status?.toLowerCase()}`}
                                            style={{
                                                width:
                                                    `${Math.min(
                                                        fillPercentage,
                                                        100
                                                    )}%`
                                            }}
                                        />

                                    </div>

                                    <p>
                                        {bin.currentFillLevel}
                                        {" / "}
                                        {bin.capacity}
                                    </p>

                                </div>


                                {/* DETAILS */}

                                <div className="bin-details">

                                    <div>

                                        <span>
                                            Zone
                                        </span>

                                        <strong>
                                            {bin.zone?.name || "N/A"}
                                        </strong>

                                    </div>

                                    <div>

                                        <span>
                                            Latitude
                                        </span>

                                        <strong>
                                            {bin.latitude}
                                        </strong>

                                    </div>

                                    <div>

                                        <span>
                                            Longitude
                                        </span>

                                        <strong>
                                            {bin.longitude}
                                        </strong>

                                    </div>

                                </div>


                                {/* MAP BUTTON */}

                                <button
                                    className="map-btn"
                                    onClick={() =>
                                        openMap(
                                            bin.latitude,
                                            bin.longitude
                                        )
                                    }
                                >
                                    🗺️ View on Map
                                </button>

                            </div>

                        );

                    })}

                </div>

            )}

        </div>
    );
}

export default Bins;