import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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

function Sidebar() {

    const role = getUserRole();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
    if (role !== "DISPATCHER") return;

    const token = localStorage.getItem("token");
    if (!token) return;

    let userId;

    try {
        const payload = JSON.parse(
            atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
        );

        userId = payload.userId;
    } catch (error) {
        console.error("Unable to read user ID:", error);
        return;
    }

    if (!userId) return;

    const fetchUnreadCount = async () => {
        try {
            const response = await fetch(
                `http://localhost:8080/notifications/user/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) return;

            const notifications = await response.json();

            setUnreadCount(
                notifications.filter(notification => !notification.read).length
            );
        } catch (error) {
            console.error("Unable to fetch notifications:", error);
        }
    };

    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 5000);

    return () => clearInterval(interval);
}, [role]);

    const handleLogout = () => {

        // Remove JWT
        localStorage.removeItem("token");

        // Return to login page
        navigate("/");
        
        // Refresh application state
        window.location.reload();
    };

    return (
         <>
        <style>{`
            .notification-nav {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
            }

            .notification-badge {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 20px;
                height: 20px;
                padding: 0 5px;
                border-radius: 50%;
                background-color: #e53935;
                color: white;
                font-size: 12px;
                font-weight: bold;
                line-height: 1;
                box-sizing: border-box;
                flex-shrink: 0;
            }
        `}</style>
        <aside className="sidebar">

            <h2>♻️ Smart Waste</h2>

            <nav>

                {/* COMMON */}

                <NavLink to="/dashboard">
                    📊 Dashboard
                </NavLink>


                {/* ADMIN */}

                {role === "ADMIN" && (
                    <>
                        <NavLink to="/bins">
                            🗑️ Bins
                        </NavLink>

                        <NavLink to="/requests">
                            📋 Requests
                        </NavLink>

                        <NavLink to="/drivers">
                            🚛 Drivers
                        </NavLink>

                        <NavLink to="/vehicles">
                            🚚 Vehicles
                        </NavLink>

                        <NavLink to="/routes">
                            🗺️ Routes
                        </NavLink>

                        <NavLink to="/complaints">
                            📝 Complaints
                        </NavLink>

                        <NavLink to="/notifications">
                            🔔 Notifications
                        </NavLink>
                    </>
                )}


                {/* DISPATCHER */}

                {role === "DISPATCHER" && (
                    <>
                        <NavLink to="/requests">
                            📋 Collection Requests
                        </NavLink>

                        <NavLink to="/bins">
                            🗑️ Bins
                        </NavLink>

                        <NavLink to="/drivers">
                            🚛 Drivers
                        </NavLink>

                        <NavLink to="/vehicles">
                            🚚 Vehicles
                        </NavLink>

                        <NavLink to="/routes">
                            🗺️ Routes
                        </NavLink>

                        <NavLink to="/complaints">
                            📝 Complaints
                        </NavLink>

                        <NavLink to="/notifications" className="notification-nav">
    <span>🔔 Notifications</span>

    {unreadCount > 0 && (
        <span className="notification-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
        </span>
    )}
</NavLink>
                    </>
                )}


                {/* DRIVER */}

                {role === "DRIVER" && (
                    <>
                        <NavLink to="/bins">
                            🗑️ Bins
                        </NavLink>

                       <NavLink to="/driver-requests">
    📋 My Collection Requests
</NavLink>

<NavLink to="/routes">
    🗺️ My Routes
</NavLink>

                        <NavLink to="/notifications">
                            🔔 Notifications
                        </NavLink>
                    </>
                )}


                {/* RESIDENT */}

                {role === "RESIDENT" && (
                    <>
                        <NavLink to="/bins">
                            🗑️ Nearby Bins
                        </NavLink>

                        <NavLink to="/complaints">
                            📝 My Complaints
                        </NavLink>

                        <NavLink to="/notifications">
                            🔔 Notifications
                        </NavLink>
                    </>
                )}

            </nav>


            {/* LOGOUT */}

            <button
                className="logout-btn"
                onClick={handleLogout}
            >
                🚪 Logout
            </button>

        </aside>
         </>
    );
}

export default Sidebar;