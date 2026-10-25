import { useEffect, useState } from "react";
import "./Dashboard.css";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../api";
function getUserRole() {
    const token = localStorage.getItem("token");

    if (!token) return null;

    try {
        const payload = JSON.parse(
            atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
        );

        return payload.role || null;
    } catch (error) {
        console.error("Unable to read user role:", error);
        return null;
    }
}

function Dashboard() {

    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);
    const [myActiveRequests, setMyActiveRequests] = useState(0);

    const role = getUserRole();

useEffect(() => {
    const token = localStorage.getItem("token");

    const loadDashboard = async () => {
        try {
            const response = await fetch(
                `${API_BASE_URL}/dashboard/summary`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Failed to load dashboard");
            }

            const data = await response.json();
            setDashboard(data);

            // Load only the logged-in driver's requests
            if (role === "DRIVER") {
                const payload = JSON.parse(
                    atob(
                        token.split(".")[1]
                            .replace(/-/g, "+")
                            .replace(/_/g, "/")
                    )
                );

                const driverId = payload.driverId;

                if (!driverId) {
                    throw new Error("Driver ID not found in login token");
                }

                const requestsResponse = await fetch(
                    `${API_BASE_URL}/collection-requests/driver/${driverId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!requestsResponse.ok) {
                    throw new Error("Failed to load driver requests");
                }

                const requests = await requestsResponse.json();

                setMyActiveRequests(
                    Array.isArray(requests) ? requests.length : 0
                );
            }
        } catch (error) {
            console.error("Dashboard error:", error);
        }
    };

    loadDashboard();
}, [role]);



    if (!dashboard) {
        return (
            <div className="dashboard-layout">
                <Sidebar />

                <main className="dashboard-content">
                    <div className="dashboard">
                        <h2>Loading dashboard...</h2>
                    </div>
                </main>
            </div>
        );
    }


    return (
        <div className="dashboard-layout">

            <Sidebar />

            <main className="dashboard-content">

                <div className="dashboard">

                    {/* HEADER */}

                    <h1>
                        ♻️ {role} Dashboard
                    </h1>


                    {/* ADMIN DASHBOARD */}

                    {role === "ADMIN" && (

                        <>

                            <div className="stats-grid">

                                <div
                                    className="stat-card clickable"
                                    onClick={() => navigate("/bins")}
                                >
                                    <h3>🗑️ Total Bins</h3>
                                    <p>{dashboard.totalBins}</p>
                                </div>


                                <div
                                    className="stat-card clickable"
                                    onClick={() => navigate("/bins?status=CRITICAL")}
                                >
                                    <h3>🔴 Critical Bins</h3>
                                    <p>{dashboard.criticalBins}</p>
                                </div>


                                <div
                                    className="stat-card clickable"
                                    onClick={() => navigate("/bins?status=HIGH")}
                                >
                                    <h3>🟠 High Bins</h3>
                                    <p>{dashboard.highBins}</p>
                                </div>


                                <div
    className="stat-card clickable"
    onClick={() => navigate("/requests?status=PENDING")}
>
    <h3>📋 Pending Requests</h3>
    <p>{dashboard.pendingRequests}</p>
</div>


                                <div
    className="stat-card clickable"
    onClick={() => navigate("/requests?status=ACTIVE")}
>
    <h3>🚛 Active Requests</h3>
    <p>{dashboard.activeRequests}</p>
</div>


                               <div
    className="stat-card clickable"
    onClick={() => navigate("/requests?status=COMPLETED")}
>
    <h3>✅ Completed Requests</h3>
    <p>{dashboard.completedRequests}</p>
</div>


                               <div
    className="stat-card clickable"
    onClick={() => navigate("/drivers?status=AVAILABLE")}
>
    <h3>👨‍✈️ Available Drivers</h3>
    <p>{dashboard.availableDrivers}</p>
</div>
<div
    className="stat-card clickable"
    onClick={() => navigate("/drivers?status=ON_DUTY")}
>
    <h3>🚗 On-Duty Drivers</h3>
    <p>{dashboard.onDutyDrivers}</p>
</div>


                              <div
    className="stat-card clickable"
    onClick={() => navigate("/vehicles?status=AVAILABLE")}
>
    <h3>🚚 Available Vehicles</h3>
    <p>{dashboard.availableVehicles}</p>
</div>


                               <div
    className="stat-card clickable"
    onClick={() => navigate("/vehicles?status=IN_USE")}
>
    <h3>🚛 Vehicles In Use</h3>
    <p>{dashboard.inUseVehicles}</p>
</div>
                            </div>

                        </>
                    )}


                    {/* DISPATCHER DASHBOARD */}

                    {role === "DISPATCHER" && (

                        <div className="stats-grid">

                            <div
                                className="stat-card clickable"
                                onClick={() => navigate("/requests?status=PENDING")}
                            >
                                <h3>📋 Pending Requests</h3>
                                <p>{dashboard.pendingRequests}</p>
                            </div>


                            <div
                                className="stat-card clickable"
                                onClick={() => navigate("/requests?status=ASSIGNED")}
                            >
                                <h3>🚛 Active Requests</h3>
                                <p>{dashboard.activeRequests}</p>
                            </div>


             <div
    className="stat-card clickable"
    onClick={() => navigate("/bins?status=CRITICAL")}
>
    <h3>🔴 Critical Bins</h3>
    <p>{dashboard.criticalBins}</p>
</div>

                                      <div
    className="stat-card clickable"
    onClick={() => navigate("/bins?status=HIGH")}
>
                                <h3>🟠 High Bins</h3>
                                <p>{dashboard.highBins}</p>
                            </div>


                                      <div
    className="stat-card clickable"
    onClick={() => navigate("/drivers?status=AVAILABLE")}
>
                                <h3>👨‍✈️ Available Drivers</h3>
                                <p>{dashboard.availableDrivers}</p>
                            </div>


                                      <div
    className="stat-card clickable"
    onClick={() => navigate("/drivers?status=ON_DUTY")}
>
                                <h3>🚗 On-Duty Drivers</h3>
                                <p>{dashboard.onDutyDrivers}</p>
                            </div>


                                      <div
    className="stat-card clickable"
    onClick={() => navigate("/vehicles?status=AVAILABLE")}
>
                                <h3>🚚 Available Vehicles</h3>
                                <p>{dashboard.availableVehicles}</p>
                            </div>


                                      <div
    className="stat-card clickable"
    onClick={() => navigate("/vehicles?status=IN_USE")}
>
                                <h3>🚛 Vehicles In Use</h3>
                                <p>{dashboard.inUseVehicles}</p>
                            </div>

                        </div>
                    )}


                    {/* DRIVER DASHBOARD */}

                    {role === "DRIVER" && (

                        <div className="stats-grid">

                            <div
                                className="stat-card clickable"
                                onClick={() => navigate("/routes")}
                            >
                                <h3>🗺️ My Routes</h3>
                                <p>View</p>
                            </div>


                            <div
                                className="stat-card clickable"
                                onClick={() => navigate("/bins")}
                            >
                                <h3>🗑️ Bin Monitoring</h3>
                                <p>{dashboard.totalBins}</p>
                            </div>


                            <div
    className="stat-card clickable"
    onClick={() => navigate("/driver-requests")}
>
    <h3>🚛 Active Requests</h3>
    <p>{myActiveRequests}</p>
</div>


                           <div
    className="stat-card clickable"
    onClick={() => navigate("/bins?status=CRITICAL")}
>
                                <h3>🔴 Critical Bins</h3>
                                <p>{dashboard.criticalBins}</p>
                            </div>

                        </div>
                    )}


                    {/* RESIDENT DASHBOARD */}

                    {role === "RESIDENT" && (

                        <div className="stats-grid">

                            <div
                                className="stat-card clickable"
                                onClick={() => navigate("/bins")}
                            >
                                <h3>🗑️ Nearby Bins</h3>
                                <p>{dashboard.totalBins}</p>
                            </div>


                            <div
                                className="stat-card clickable"
                                onClick={() => navigate("/complaints")}
                            >
                                <h3>📝 My Complaints</h3>
                                <p>View</p>
                            </div>


                            <div
                                className="stat-card clickable"
                                onClick={() => navigate("/notifications")}
                            >
                                <h3>🔔 Notifications</h3>
                                <p>View</p>
                            </div>

                        </div>
                    )}

                </div>

            </main>

        </div>
    );
}

export default Dashboard;