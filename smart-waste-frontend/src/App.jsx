import { useState } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import Login from "./components/Login";

import Dashboard from "./pages/Dashboard";
import Bins from "./pages/Bins";
import Requests from "./pages/Requests";
import Drivers from "./pages/Drivers";
import Vehicles from "./pages/Vehicles";
import RoutesPage from "./pages/Routes";
import Notifications from "./pages/Notifications";
import Complaints from "./pages/Complaints";
import DriverRequests from "./pages/DriverRequests";
import Register from "./pages/Register";
// =========================================
// GET ROLE FROM JWT
// =========================================

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


// =========================================
// ROLE PROTECTED ROUTE
// =========================================

function RoleRoute({
    loggedIn,
    allowedRoles,
    children
}) {

    if (!loggedIn) {
        return <Navigate to="/" replace />;
    }

    const role = getUserRole();

    if (!role) {

        localStorage.removeItem("token");

        return <Navigate to="/" replace />;
    }

    if (!allowedRoles.includes(role)) {

        return <Navigate to="/dashboard" replace />;
    }

    return children;
}


// =========================================
// APP
// =========================================

function App() {

    const [loggedIn, setLoggedIn] = useState(
        localStorage.getItem("token") !== null
    );


    return (

        <BrowserRouter>

            <Routes>

                {/* =================================
                    LOGIN
                ================================= */}

                <Route
                    path="/"
                    element={
                        loggedIn ? (
                            <Navigate
                                to="/dashboard"
                                replace
                            />
                        ) : (
                            <Login
                                onLogin={() =>
                                    setLoggedIn(true)
                                }
                            />
                        )
                    }
                />


                <Route
    path="/register"
    element={<Register />}
/>


                {/* =================================
                    DASHBOARD
                ================================= */}

                <Route
                    path="/dashboard"
                    element={
                        loggedIn ? (
                            <Dashboard />
                        ) : (
                            <Navigate
                                to="/"
                                replace
                            />
                        )
                    }
                />
                <Route
    path="/driver-requests"
    element={
        <RoleRoute
            loggedIn={loggedIn}
            allowedRoles={["DRIVER"]}
        >
            <DriverRequests />
        </RoleRoute>
    }
/>


                {/* =================================
                    BINS
                    ADMIN + DISPATCHER + DRIVER
                ================================= */}

                <Route
                    path="/bins"
                    element={
                        <RoleRoute
                            loggedIn={loggedIn}
                            allowedRoles={[
                                   "ADMIN",
    "DISPATCHER",
    "DRIVER",
    "RESIDENT"
                            ]}
                        >
                            <Bins />
                        </RoleRoute>
                    }
                />


                {/* =================================
                    REQUESTS
                    ADMIN + DISPATCHER
                ================================= */}

                <Route
                    path="/requests"
                    element={
                        <RoleRoute
                            loggedIn={loggedIn}
                            allowedRoles={[
                                "ADMIN",
                                "DISPATCHER"
                            ]}
                        >
                            <Requests />
                        </RoleRoute>
                    }
                />


                {/* =================================
                    DRIVERS
                    ADMIN + DISPATCHER
                ================================= */}

                <Route
                    path="/drivers"
                    element={
                        <RoleRoute
                            loggedIn={loggedIn}
                            allowedRoles={[
                                "ADMIN",
                                "DISPATCHER"
                            ]}
                        >
                            <Drivers />
                        </RoleRoute>
                    }
                />


                {/* =================================
                    VEHICLES
                    ADMIN + DISPATCHER
                ================================= */}

                <Route
                    path="/vehicles"
                    element={
                        <RoleRoute
                            loggedIn={loggedIn}
                            allowedRoles={[
                                "ADMIN",
                                "DISPATCHER"
                            ]}
                        >
                            <Vehicles />
                        </RoleRoute>
                    }
                />


                {/* =================================
                    ROUTES
                    ADMIN + DISPATCHER + DRIVER
                ================================= */}

                <Route
                    path="/routes"
                    element={
                        <RoleRoute
                            loggedIn={loggedIn}
                            allowedRoles={[
                                "ADMIN",
                                "DISPATCHER",
                                "DRIVER"
                            ]}
                        >
                            <RoutesPage />
                        </RoleRoute>
                    }
                />


                {/* =================================
                    NOTIFICATIONS
                    ALL ROLES
                ================================= */}

                <Route
                    path="/notifications"
                    element={
                        <RoleRoute
                            loggedIn={loggedIn}
                            allowedRoles={[
                                "ADMIN",
                                "DISPATCHER",
                                "DRIVER",
                                "RESIDENT"
                            ]}
                        >
                            <Notifications />
                        </RoleRoute>
                    }
                />


                {/* =================================
                    COMPLAINTS
                    ADMIN + DISPATCHER + RESIDENT
                ================================= */}

                <Route
                    path="/complaints"
                    element={
                        <RoleRoute
                            loggedIn={loggedIn}
                            allowedRoles={[
                                "ADMIN",
                                "DISPATCHER",
                                "RESIDENT"
                            ]}
                        >
                            <Complaints />
                        </RoleRoute>
                    }
                />

            </Routes>


            

        </BrowserRouter>
    );
}

export default App;