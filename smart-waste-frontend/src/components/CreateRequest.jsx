
import { useEffect, useState } from "react";
import API_BASE_URL from "../api";

const API = API_BASE_URL;

export default function CreateRequest({ onCreated }) {
  const [bins, setBins] = useState([]);
  const [selectedBin, setSelectedBin] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadBins() {
      try {
        const response = await fetch(`${API}/bins`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        if (!response.ok) {
          throw new Error("Unable to load bins");
        }

        setBins(await response.json());
      } catch (error) {
        setMessage(error.message);
      }
    }

    loadBins();
  }, []);

  async function createRequest(event) {
    event.preventDefault();

    if (!selectedBin) return;

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API}/collection-requests/${selectedBin}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error(
            "This bin already has an active collection request."
          );
        }

        throw new Error("Unable to create collection request");
      }

      setMessage("Collection request created successfully!");
      setSelectedBin("");

      if (onCreated) {
        await onCreated();
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="create-request">
      <h2>Create Collection Request</h2>

      <form onSubmit={createRequest}>
        <select
          value={selectedBin}
          onChange={(event) =>
            setSelectedBin(event.target.value)
          }
          required
        >
          <option value="">Select a bin</option>

          {bins.map((bin) => (
            <option key={bin.id} value={bin.id}>
              {bin.locationName} — Bin #{bin.id}
            </option>
          ))}
        </select>

        <button disabled={loading || !selectedBin}>
          {loading ? "Creating..." : "Create Request"}
        </button>
      </form>

      {message && <p role="status">{message}</p>}
    </section>
  );
}
