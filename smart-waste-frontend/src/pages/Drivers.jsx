import { useEffect, useState } from "react";
import "./Drivers.css";

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


function Drivers() {

    const [drivers, setDrivers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    const [search, setSearch] = useState("");

    // Add Driver form
const [showForm, setShowForm] = useState(false);
const [driverName, setDriverName] = useState("");
const [driverEmail, setDriverEmail] = useState("");
const [driverPassword, setDriverPassword] = useState("");
const [driverPhone, setDriverPhone] = useState("");
const [licenseNumber, setLicenseNumber] = useState("");
const [adding, setAdding] = useState(false);


    const role = getUserRole();


    // ==============================
    // LOAD DRIVERS
    // ==============================

    useEffect(() => {

        const loadDrivers = async () => {

            try {

                const token =
                    localStorage.getItem("token");

                const response = await fetch(
                    "http://localhost:8080/drivers",
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

                setError(error.message);

            } finally {

                setLoading(false);

            }
        };


        loadDrivers();

    }, []);

// ==============================
// ADD DRIVER
// ==============================

const addDriver = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");

    setAdding(true);

    try {
        // ==============================
        // STEP 1: CREATE DRIVER USER
        // ==============================

        const userResponse = await fetch(
            "http://localhost:8080/users",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: driverName,
                    email: driverEmail,
                    password: driverPassword,
                    phone: driverPhone,
                    role: "DRIVER"
                })
            }
        );

        if (!userResponse.ok) {
            const errorText = await userResponse.text();

            throw new Error(
                errorText ||
                `Failed to create driver user: ${userResponse.status}`
            );
        }

        const createdUser = await userResponse.json();

        // ==============================
        // STEP 2: CREATE DRIVER PROFILE
        // ==============================

        const driverResponse = await fetch(
            "http://localhost:8080/drivers",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    user: {
                        id: createdUser.id
                    },
                    licenseNumber: licenseNumber
                })
            }
        );

        if (!driverResponse.ok) {
            const errorText = await driverResponse.text();

            throw new Error(
                errorText ||
                `Failed to create driver: ${driverResponse.status}`
            );
        }

        const newDriver = await driverResponse.json();

        // Add new driver to current list
        setDrivers(prevDrivers => [
            ...prevDrivers,
            newDriver
        ]);

        // Clear form
        setDriverName("");
        setDriverEmail("");
        setDriverPassword("");
        setDriverPhone("");
        setLicenseNumber("");

        // Close form
        setShowForm(false);

        alert("Driver added successfully!");

    } catch (error) {

        console.error("Add driver error:", error);

        alert(error.message);

    } finally {

        setAdding(false);
    }
};
    // ==============================
    // SEARCH
    // ==============================

    const filteredDrivers =
        drivers.filter(driver => {

            const searchText =
                search.trim().toLowerCase();


            if (searchText === "") {
                return true;
            }


            return (

                String(driver.id)
                    .includes(searchText) ||

                String(
                    driver.licenseNumber || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||

                String(
                    driver.status || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||

                String(
                    driver.user?.name || ""
                )
                    .toLowerCase()
                    .includes(searchText) ||

                String(
                    driver.user?.email || ""
                )
                    .toLowerCase()
                    .includes(searchText)

            );

        });


    // ==============================
    // LOADING
    // ==============================

    if (loading) {

        return (

            <div className="drivers-page">

                <h2 className="drivers-loading">
                    Loading drivers...
                </h2>

            </div>

        );

    }


    // ==============================
    // ERROR
    // ==============================

    if (error) {

        return (

            <div className="drivers-page">

                <h1>👨‍✈️ Drivers</h1>

                <div className="drivers-error">
                    ❌ {error}
                </div>

            </div>

        );

    }


    // ==============================
    // PAGE TITLE
    // ==============================

    const pageTitle =
        role === "DISPATCHER"
            ? "🚛 Driver Management"
            : "👨‍✈️ Drivers";


    const pageDescription =
        role === "DISPATCHER"
            ? "Monitor driver availability and operational status"
            : "Monitor registered drivers and their current status";


    // ==============================
    // UI
    // ==============================

    return (

        <div className="drivers-page">


            {/* ================= HEADER ================= */}

            <div className="drivers-header">

                <div>

                    <h1>
                        {pageTitle}
                    </h1>

                    <p>
                        {pageDescription}
                    </p>

                </div>


                <div className="driver-count">

                    Showing:

                    <strong>
                        {filteredDrivers.length}
                    </strong>

                    / {drivers.length}

                </div>

            </div>


            {/* ================= SEARCH ================= */}

            <div className="drivers-filters">

                <input
                    type="text"
                    placeholder="🔍 Search driver, license, email, status..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />


                <button
                    className="clear-driver-filter"
                    onClick={() =>
                        setSearch("")
                    }
                >
                    Clear Search
                </button>

               {role === "ADMIN" && (
    <button
        className="add-driver-btn"
        onClick={() => setShowForm(!showForm)}
    >
        {showForm ? "✕ Close" : "＋ Add Driver"}
    </button>
)}

            </div>

{role === "ADMIN" && showForm && (
    <form
        className="driver-form"
        onSubmit={addDriver}
    >

        <h2>➕ Add New Driver</h2>

        <div className="driver-form-grid">

            <div className="form-group">
                <label>Name</label>

                <input
                    type="text"
                    placeholder="e.g. Amit Sharma"
                    value={driverName}
                    onChange={(e) =>
                        setDriverName(e.target.value)
                    }
                    required
                />
            </div>

            <div className="form-group">
                <label>Email</label>

                <input
                    type="email"
                    placeholder="e.g. amit@gmail.com"
                    value={driverEmail}
                    onChange={(e) =>
                        setDriverEmail(e.target.value)
                    }
                    required
                />
            </div>

            <div className="form-group">
                <label>Password</label>

                <input
                    type="password"
                    placeholder="Enter login password"
                    value={driverPassword}
                    onChange={(e) =>
                        setDriverPassword(e.target.value)
                    }
                    required
                />
            </div>

            <div className="form-group">
                <label>Phone</label>

                <input
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={driverPhone}
                    onChange={(e) =>
                        setDriverPhone(e.target.value)
                    }
                    required
                />
            </div>

            <div className="form-group">
                <label>License Number</label>

                <input
                    type="text"
                    placeholder="e.g. MH12AB1234"
                    value={licenseNumber}
                    onChange={(e) =>
                        setLicenseNumber(e.target.value)
                    }
                    required
                />
            </div>

        </div>

        <button
            type="submit"
            className="save-driver-btn"
            disabled={adding}
        >
            {adding ? "Adding..." : "✓ Add Driver"}
        </button>

    </form>
)}
            {/* ================= EMPTY ================= */}

            {filteredDrivers.length === 0 ? (

                <div className="empty-drivers">

                    <h2>
                        📭 No Drivers Found
                    </h2>

                    <p>
                        No drivers match your search.
                    </p>

                </div>

            ) : (


                /* ================= DRIVER GRID ================= */

                <div className="drivers-grid">

                    {filteredDrivers.map(driver => (

                        <div
                            className="driver-card"
                            key={driver.id}
                        >


                            {/* ================= CARD HEADER ================= */}

                            <div className="driver-card-header">

                                <div className="driver-avatar">
                                    👨‍✈️
                                </div>


                                <div>

                                    <h2>
                                        {driver.user?.name ||
                                            `Driver #${driver.id}`}
                                    </h2>

                                    <span>
                                        Driver ID: #{driver.id}
                                    </span>

                                </div>

                            </div>


                            {/* ================= STATUS ================= */}

                            <div className="driver-status-row">

                                <span>
                                    Status
                                </span>


                                <span
                                    className={`driver-status ${
                                        driver.status?.toLowerCase()
                                    }`}
                                >
                                    {driver.status}
                                </span>

                            </div>


                            {/* ================= DETAILS ================= */}

                            <div className="driver-details">

                                <div>

                                    <span>
                                        🪪 License Number
                                    </span>

                                    <strong>
                                        {driver.licenseNumber ||
                                            "N/A"}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        📧 Email
                                    </span>

                                    <strong>
                                        {driver.user?.email ||
                                            "N/A"}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        📱 Phone
                                    </span>

                                    <strong>
                                        {driver.user?.phone ||
                                            "N/A"}
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

export default Drivers;