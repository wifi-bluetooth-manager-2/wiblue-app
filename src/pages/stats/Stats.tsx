import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import NavbarModel from "../../components/NavbarModel/NavbarModel";
import useUserContext from "../../contexts/userContextProvider";
import { invoke } from "@tauri-apps/api/core";
import ApiLinks from "../../constants/apilinks";
import styles from "./styles.module.scss";

interface TauriNetworkStats {
  bytes_down: number;
  bytes_up: number;
  speed_down: number;
  speed_up: number;
  total_down: number;
  total_up: number;
}

interface AggregatedNetworkStat {
  ssid: string;
  total_bytes_up: number;
  total_bytes_down: number;
}

export default function Stats() {
  const { User } = useUserContext();
  const [tauriStats, setTauriStats] = useState<TauriNetworkStats | null>(null);
  const [aggregatedStats, setAggregatedStats] = useState<
    AggregatedNetworkStat[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState({
    addStats: false,
    getStats: false,
    lastCall: "",
  });

  // Enhanced error handling with detailed logging
  const handleError = (err: unknown, context: string) => {
    const message =
      err instanceof Error ? err.message : "An unknown error occurred";
    console.error(`[${new Date().toISOString()}] Error in ${context}:`, err);
    setError(`${context}: ${message}`);
    setApiStatus((prev) => ({ ...prev, lastCall: `Error: ${context}` }));
    return message;
  };

  // Verify token before making API calls
  const verifyToken = async () => {
    if (!User?.token) {
      throw new Error("Authentication token is missing");
    }
    return true;
  };

  const handleTauriNetworkStats = async (event: {
    payload: TauriNetworkStats;
  }) => {
    try {
      const stats = event.payload;
      console.log("Received network stats from Tauri:", stats);
      setTauriStats(stats);

      await verifyToken();

      // First send to backend with detailed logging
      console.log("Attempting to add network stats to backend...");
      const addResult = await addNetworkStat(
        User?.interface || "default-interface",
        stats.bytes_down,
        stats.bytes_up,
      );
      console.log("Add network stats result:", addResult);

      // Then refresh aggregated stats
      console.log("Refreshing aggregated stats...");
      await fetchAggregatedNetworkStats();

      setApiStatus((prev) => ({
        ...prev,
        addStats: true,
        lastCall: `Success: Added stats at ${new Date().toLocaleTimeString()}`,
      }));
    } catch (err) {
      handleError(err, "processing Tauri stats");
    }
  };

  useEffect(() => {
    let unlisten: () => void;

    const startListening = async () => {
      try {
        if (!User?.interface) {
          throw new Error("Network interface not specified");
        }

        console.log("Starting Tauri event listener...");
        unlisten = await listen<TauriNetworkStats>(
          "network_stats",
          handleTauriNetworkStats,
        );

        console.log("Starting network monitoring...");
        await invoke("monitor_network_stats", {
          interface: User.interface,
        });
      } catch (err) {
        handleError(err, "setting up Tauri listener");
      }
    };

    startListening();

    return () => {
      if (unlisten) unlisten();
    };
  }, [User?.interface, User?.token]);

  const addNetworkStat = async (
    ssid: string,
    rx_bytes: number,
    tx_bytes: number,
  ) => {
    try {
      await verifyToken();

      console.log("Preparing addNetworkStat request...");
      const requestBody = {
        user_id: User?.userId,
        ssid: ssid,
        rx_bytes: rx_bytes,
        tx_bytes: tx_bytes,
      };

      console.log("Request payload:", requestBody);

      const response = await fetch(ApiLinks.add_network_stats, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${User?.token}`,
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Backend error response:", errorData);
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Backend response data:", responseData);
      return responseData;
    } catch (err) {
      throw handleError(err, "adding network stat");
    }
  };

  const fetchAggregatedNetworkStats = async () => {
    setLoading(true);
    setError(null);

    try {
      await verifyToken();

      console.log("Fetching aggregated stats...");
      const response = await fetch(
        `${ApiLinks.get_network_stats}/${User?.userId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Token ${User?.token}`,
          },
        },
      );

      console.log("Aggregated stats response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Aggregated stats error:", errorData);
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("Aggregated stats data:", data);

      setAggregatedStats(Array.isArray(data) ? data : []);
      setApiStatus((prev) => ({
        ...prev,
        getStats: true,
        lastCall: `Success: Fetched stats at ${new Date().toLocaleTimeString()}`,
      }));
    } catch (err) {
      handleError(err, "fetching aggregated stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (User?.userId && User?.token) {
      console.log("Initial fetch of aggregated stats...");
      fetchAggregatedNetworkStats();
    }
  }, [User?.userId, User?.token]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      setLoading(true);
      console.log("Testing backend connection...");
      const response = await fetch(ApiLinks.get_network_stats, {
        method: "OPTIONS",
      });
      console.log("OPTIONS response:", response);
      setApiStatus((prev) => ({
        ...prev,
        lastCall: `Backend reachable at ${new Date().toLocaleTimeString()}`,
      }));
    } catch (err) {
      handleError(err, "testing backend connection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavbarModel />
      <div className={styles.statsContainer}>
        <h1 className={styles.header}>Network Statistics</h1>

        {error && (
          <div className={`${styles.alert} ${styles.error}`}>
            {error}
            <div className={styles.buttonGroup}>
              <button
                onClick={() => fetchAggregatedNetworkStats()}
                className={styles.retryButton}
              >
                Retry
              </button>
              <button
                onClick={() => testBackendConnection()}
                className={styles.testButton}
              >
                Test Connection
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className={`${styles.alert} ${styles.loading}`}>
            Loading network data...
          </div>
        )}

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Real-time Network Stats</h2>

          {tauriStats ? (
            <div className={styles.realtimeStats}>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>Download</div>
                  <div className={styles.statValue}>
                    {formatBytes(tauriStats.bytes_down)}
                  </div>
                  <div className={styles.statSubtext}>
                    Speed: {formatBytes(tauriStats.speed_down)}/s
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statLabel}>Upload</div>
                  <div className={styles.statValue}>
                    {formatBytes(tauriStats.bytes_up)}
                  </div>
                  <div className={styles.statSubtext}>
                    Speed: {formatBytes(tauriStats.speed_up)}/s
                  </div>
                </div>
              </div>

              <div className={styles.totalsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>Total Downloaded</div>
                  <div className={styles.statValue}>
                    {formatBytes(tauriStats.total_down)}
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statLabel}>Total Uploaded</div>
                  <div className={styles.statValue}>
                    {formatBytes(tauriStats.total_up)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.noData}>
              <p>No real-time network data available</p>
              <p className={styles.interfaceInfo}>
                Monitoring interface: {User?.interface || "Not specified"}
              </p>
            </div>
          )}
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Aggregated Network Usage</h2>

          {aggregatedStats.length > 0 ? (
            <table className={styles.aggregatedTable}>
              <thead>
                <tr>
                  <th>Network (SSID)</th>
                  <th>Total Uploaded</th>
                  <th>Total Downloaded</th>
                </tr>
              </thead>
              <tbody>
                {aggregatedStats.map((stat, index) => (
                  <tr key={index}>
                    <td>{stat.ssid || "Unknown"}</td>
                    <td>{formatBytes(stat.total_bytes_up)}</td>
                    <td>{formatBytes(stat.total_bytes_down)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.noData}>
              <p>No aggregated network statistics available</p>
              {!loading && (
                <button
                  onClick={() => fetchAggregatedNetworkStats()}
                  className={styles.retryButton}
                >
                  Refresh Data
                </button>
              )}
            </div>
          )}
        </div>

        <div className={styles.apiStatus}>
          <p>Backend Status:</p>
          <ul>
            <li>Add Stats: {apiStatus.addStats ? "✅" : "❌"}</li>
            <li>Get Stats: {apiStatus.getStats ? "✅" : "❌"}</li>
            <li>Last Action: {apiStatus.lastCall || "None"}</li>
          </ul>
          <button
            onClick={() => testBackendConnection()}
            className={styles.testButton}
          >
            Test Backend Connection
          </button>
        </div>
      </div>
    </>
  );
}
