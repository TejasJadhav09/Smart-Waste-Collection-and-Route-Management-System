import { useEffect, useState } from "react";
import "./Notifications.css";
import API_BASE_URL from "../api";
const API = API_BASE_URL;


function getUserFromToken() {
    const token = localStorage.getItem("token");

    if (!token) {
        return null;
    }

    try {
        return JSON.parse(
            atob(
                token
                    .split(".")[1]
                    .replace(/-/g, "+")
                    .replace(/_/g, "/")
            )
        );
    } catch (error) {
        console.error("Unable to read JWT:", error);
        return null;
    }
}

function Notifications() {

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const user = getUserFromToken();
    const canViewNotifications =
    user?.role === "ADMIN" ||
    user?.role === "DISPATCHER";

    const loadNotifications = async () => {
if (!canViewNotifications) {
    setError("You don't have permission to view notifications.");
    setNotifications([]);
    setLoading(false);
    return;
}
        if (!user?.userId) {
            setError("User ID not found in login token.");
            setLoading(false);
            return;
        }

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API}/notifications/user/${user.userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const responseText = await response.text();

            if (!response.ok) {
                throw new Error(
                    responseText ||
                    "Unable to load notifications"
                );
            }

            const data = JSON.parse(responseText);

            setNotifications(
                Array.isArray(data) ? data : []
            );

        } catch (error) {

            console.error(
                "Notification loading error:",
                error
            );

            setError(error.message);

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const markAsRead = async (notificationId) => {

        try {

            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API}/notifications/${notificationId}/read`,
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
                    "Unable to mark notification as read"
                );
            }

            await loadNotifications();

        } catch (error) {

            console.error(
                "Mark notification error:",
                error
            );

            setError(error.message);
        }
    };

    const getNotificationIcon = (type) => {

        switch (type) {

            case "CRITICAL_BIN":
                return "🚨";

            default:
                return "🔔";
        }
    };

    const getNotificationTitle = (type) => {

        switch (type) {

            case "CRITICAL_BIN":
                return "Critical Bin Alert";

            default:
                return "Notification";
        }
    };

    const getNotificationClass = (type) => {

        switch (type) {

            case "CRITICAL_BIN":
                return "critical";

            default:
                return "default";
        }
    };

    const unreadCount = notifications.filter(
        (notification) => !notification.read
    ).length;

    return (
        <div className="notifications-page">

            <div className="notifications-header">

                <div>
                    <h1>🔔 Notifications</h1>

                    <p>
                        Stay updated with important
                        waste-management alerts
                    </p>
                </div>

                <div className="notification-count">

                    <span>Unread</span>

                    <strong>
                        {unreadCount}
                    </strong>

                </div>

            </div>

            {error && (
                <div className="notification-error">
                    {error}
                </div>
            )}

            {loading ? (

                <div className="notifications-loading">
                    Loading notifications...
                </div>

            ) : notifications.length === 0 ? (

                <div className="empty-notifications">

                    <div className="empty-notification-icon">
                        🔔
                    </div>

                    <h2>No notifications</h2>

                    <p>
                        You don't have any notifications
                        at the moment.
                    </p>

                </div>

            ) : (

                <div className="notifications-list">

                    {notifications.map((notification) => (

                        <div
                            key={notification.id}
                            className={`notification-card ${
                                notification.read
                                    ? "read"
                                    : "unread"
                            }`}
                        >

                            <div
                                className={`notification-icon ${getNotificationClass(
                                    notification.type
                                )}`}
                            >
                                {getNotificationIcon(
                                    notification.type
                                )}
                            </div>

                            <div className="notification-content">

                                <div className="notification-top">

                                    <h3>
                                        {getNotificationTitle(
                                            notification.type
                                        )}
                                    </h3>

                                    {!notification.read && (
                                        <span className="unread-badge">
                                            NEW
                                        </span>
                                    )}

                                </div>

                                <p className="notification-message">
                                    {notification.message}
                                </p>

                                <div className="notification-bottom">

                                    <span className="notification-time">
                                        {notification.createdAt
                                            ? new Date(
                                                  notification.createdAt
                                              ).toLocaleString()
                                            : "-"}
                                    </span>

                                    {!notification.read && (
                                        <button
                                            className="mark-read-btn"
                                            onClick={() =>
                                                markAsRead(
                                                    notification.id
                                                )
                                            }
                                        >
                                            ✓ Mark as Read
                                        </button>
                                    )}

                                </div>

                            </div>

                        </div>

                    ))}

                </div>
            )}

        </div>
    );
}

export default Notifications;