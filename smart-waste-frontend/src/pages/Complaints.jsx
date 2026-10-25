import { useEffect, useState } from "react";
import API_BASE_URL from "../api";
import "./Complaints.css";

const API = API_BASE_URL;

function getUserFromToken() {
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

        return payload;
    } catch (error) {
        console.error("Unable to read JWT:", error);
        return null;
    }
}

function Complaints() {
    const [complaints, setComplaints] = useState([]);
    const [bins, setBins] = useState([]);

    const [description, setDescription] = useState("");
    const [type, setType] = useState("");
    const [selectedBin, setSelectedBin] = useState("");

    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const user = getUserFromToken();
    const role = user?.role;

    const loadComplaints = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`${API}/complaints`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Unable to load complaints");
            }

            const data = await response.json();

            setComplaints(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Complaint loading error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const loadBins = async () => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`${API}/bins`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error("Unable to load bins");
            }

            const data = await response.json();

            setBins(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Bin loading error:", error);
            setError(error.message);
        }
    };

    useEffect(() => {
        loadComplaints();
        loadBins();
    }, []);

    const createComplaint = async (event) => {
        event.preventDefault();

        if (!description || !type || !selectedBin) {
            setError("Please fill all complaint fields.");
            return;
        }

        if (!user?.sub) {
            setError("Unable to identify logged-in user.");
            return;
        }

        setCreating(true);
        setError("");
        setMessage("");

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(`${API}/complaints`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    description: description,
                    type: type,
                    residentId: Number(user.userId),
                    binId: Number(selectedBin)
                })
            });
const responseText = await response.text();

if (!response.ok) {
    if (response.status === 409) {
        throw new Error(
            "This bin already has an active collection request."
        );
    }

    throw new Error(
        responseText ||
        "Unable to create collection request"
    );
}

            setDescription("");
            setType("");
            setSelectedBin("");

            setMessage("Complaint submitted successfully.");

            await loadComplaints();
        } catch (error) {
            console.error("Create complaint error:", error);
            setError(error.message);
        } finally {
            setCreating(false);
        }
    };

    const updateStatus = async (complaintId, status) => {
        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${API}/complaints/${complaintId}/status?status=${status}`,
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
                    responseText || "Unable to update complaint"
                );
            }

            await loadComplaints();
        } catch (error) {
            console.error("Status update error:", error);
            setError(error.message);
        }
    };

    const createCollectionRequest = async (complaintId) => {
    try {
        const token = localStorage.getItem("token");

        const response = await fetch(
            `${API}/complaints/${complaintId}/create-collection-request`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {

            if (response.status === 409) {
                throw new Error(
                    " ⚠️ This bin already has an active collection request."
                );
            }

            const responseText = await response.text();

            let errorMessage = "Unable to create collection request.";

            try {
                const errorData = JSON.parse(responseText);

                if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (errorData.error) {
                    errorMessage = errorData.error;
                }
            } catch {
                if (responseText) {
                    errorMessage = responseText;
                }
            }

            throw new Error(errorMessage);
        }

        setError("");
        setMessage(
            "Collection request created successfully."
        );

        await loadComplaints();

    } catch (error) {
        console.error(
            "Collection request error:",
            error
        );

        setError(error.message);
    }
};

    const getStatusClass = (status) => {
        return status
            ? status.toLowerCase().replace("_", "-")
            : "";
    };

    const getTypeLabel = (type) => {
        if (!type) {
            return "";
        }

        return type.charAt(0) + type.slice(1).toLowerCase();
    };

    return (
        <div className="complaints-page">

            <div className="complaints-header">
                <div>
                    <h1>📋 Complaints</h1>
                    <p>
                        Report and manage waste collection complaints
                    </p>
                </div>

                <div className="complaint-count">
                    Total Complaints
                    <strong>{complaints.length}</strong>
                </div>
            </div>

            {message && (
                <div className="complaint-success">
                    {message}
                </div>
            )}

            {error && (
                <div className="complaint-error">
                    {error}
                </div>
            )}

            {/* RESIDENT: CREATE COMPLAINT */}

            {role === "RESIDENT" && (
                <div className="create-complaint-card">

                    <h2>➕ Report a Complaint</h2>

                    <form onSubmit={createComplaint}>

                        <div className="complaint-form-grid">

                            <div className="form-group">
                                <label>Bin</label>

                                <select
                                    value={selectedBin}
                                    onChange={(event) =>
                                        setSelectedBin(
                                            event.target.value
                                        )
                                    }
                                    required
                                >
                                    <option value="">
                                        Select a bin
                                    </option>

                                    {bins.map((bin) => (
                                        <option
                                            key={bin.id}
                                            value={bin.id}
                                        >
                                            {bin.locationName} -
                                            {" "}
                                            Bin #{bin.id}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Complaint Type</label>

                                <select
                                    value={type}
                                    onChange={(event) =>
                                        setType(
                                            event.target.value
                                        )
                                    }
                                    required
                                >
                                    <option value="">
                                        Select complaint type
                                    </option>

                                    <option value="OVERFLOW">
                                        Overflow
                                    </option>

                                    <option value="DAMAGED">
                                        Damaged
                                    </option>

                                    <option value="INACCESSIBLE">
                                        Inaccessible
                                    </option>

                                    <option value="OTHER">
                                        Other
                                    </option>
                                </select>
                            </div>

                        </div>

                        <div className="form-group">
                            <label>Description</label>

                            <textarea
                                value={description}
                                onChange={(event) =>
                                    setDescription(
                                        event.target.value
                                    )
                                }
                                placeholder="Describe the problem..."
                                rows="4"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="submit-complaint-btn"
                            disabled={creating}
                        >
                            {creating
                                ? "Submitting..."
                                : "Submit Complaint"}
                        </button>

                    </form>
                </div>
            )}

            {/* COMPLAINT LIST */}

            <div className="complaints-section">

                <div className="section-title">
                    <h2>Complaint History</h2>
                </div>

                {loading ? (
                    <div className="complaint-loading">
                        Loading complaints...
                    </div>
                ) : complaints.length === 0 ? (
                    <div className="empty-complaints">
                        <h2>No complaints found</h2>
                        <p>
                            There are currently no complaints
                            to display.
                        </p>
                    </div>
                ) : (
                    <div className="complaints-grid">

                        {complaints.map((complaint) => (

                            <div
                                className="complaint-card"
                                key={complaint.id}
                            >

                                <div className="complaint-card-header">

                                    <h3>
                                        Complaint #{complaint.id}
                                    </h3>

                                    <span
                                        className={`complaint-status ${getStatusClass(
                                            complaint.status
                                        )}`}
                                    >
                                        {complaint.status}
                                    </span>

                                </div>

                                <div className="complaint-details">

                                    <div>
                                        <span>Type</span>
                                        <strong>
                                            {getTypeLabel(
                                                complaint.type
                                            )}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Bin</span>
                                        <strong>
                                            Bin #
                                            {complaint.bin?.id}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Location</span>
                                        <strong>
                                            {
                                                complaint.bin
                                                    ?.locationName
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Resident</span>
                                        <strong>
                                            {
                                                complaint.resident
                                                    ?.name
                                            }
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Created</span>
                                        <strong>
                                            {complaint.createdAt
                                                ? new Date(
                                                      complaint.createdAt
                                                  ).toLocaleString()
                                                : "-"}
                                        </strong>
                                    </div>

                                </div>

                                <div className="complaint-description">
                                    <span>Description</span>
                                    <p>
                                        {complaint.description}
                                    </p>
                                </div>

                                {/* ADMIN / DISPATCHER ACTIONS */}

                                {(role === "ADMIN" ||
                                    role === "DISPATCHER") && (
                                    <div className="complaint-actions">

                                        {complaint.status ===
                                            "PENDING" && (
                                            <>
                                                <button
                                                    className="start-complaint-btn"
                                                    onClick={() =>
                                                        updateStatus(
                                                            complaint.id,
                                                            "IN_PROGRESS"
                                                        )
                                                    }
                                                >
                                                    Start Processing
                                                </button>

                                                <button
                                                    className="reject-complaint-btn"
                                                    onClick={() =>
                                                        updateStatus(
                                                            complaint.id,
                                                            "REJECTED"
                                                        )
                                                    }
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}

                                        {complaint.status ===
                                            "IN_PROGRESS" && (
                                            <button
                                                className="resolve-complaint-btn"
                                                onClick={() =>
                                                    updateStatus(
                                                        complaint.id,
                                                        "RESOLVED"
                                                    )
                                                }
                                            >
                                                ✓ Resolve
                                            </button>
                                        )}


{role === "DISPATCHER" &&
    complaint.type === "OVERFLOW" &&
    complaint.status !== "REJECTED" &&
    complaint.status !== "RESOLVED" && (
        <button
            className="collection-request-btn"
            onClick={() =>
                createCollectionRequest(complaint.id)
            }
        >
            🚛 Create Collection Request
        </button>
    )}



                                    </div>
                                )}

                            </div>
                        ))}

                    </div>
                )}

            </div>

        </div>
    );
}

export default Complaints;