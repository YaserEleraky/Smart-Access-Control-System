import { useState, useEffect } from "react";
import api from "../services/api";
import { registeredPeople as mockData } from "../data/mockData";

function Dashboard() {
  const [totalPeople, setTotalPeople] = useState(0);
  const [backendStatus, setBackendStatus] = useState("checking");
  const [loading, setLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(false);
  const [esp32Data, setEsp32Data] = useState({
    status: "waiting",
    userName: "",
    message: "Waiting for card scan..."
  });

  useEffect(() => {
    const fetchData = async () => {
      let backendOnline = false;
      
      try {
        // Check backend status with short timeout
        const statusResponse = await api.get("/health");
        if (statusResponse.status === 200) {
          setBackendStatus("online");
          backendOnline = true;
          setUseMockData(false);
        }
      } catch (error) {
        setBackendStatus("offline");
        console.log("Backend is offline, using mock data");
        setUseMockData(true);
      }

      if (backendOnline) {
        try {
          // Fetch registered people data from real backend
          const peopleResponse = await api.get("/people");
          if (peopleResponse.data && Array.isArray(peopleResponse.data)) {
            setTotalPeople(peopleResponse.data.length);
          }
        } catch (error) {
          console.error("Error fetching people data:", error);
        }
        
        try {
          // Fetch ESP32 status data
          const esp32Response = await api.get("/esp32/status");
          if (esp32Response.data) {
            setEsp32Data({
              status: esp32Response.data.status || "waiting",
              userName: esp32Response.data.userName || "",
              message: esp32Response.data.message || "Waiting for card scan..."
            });
          }
        } catch (error) {
          console.error("Error fetching ESP32 data:", error);
        }
      } else {
        // Use mock data when backend is offline
        setTotalPeople(mockData.length);
        // Reset ESP32 to waiting state when backend is offline
        setEsp32Data({
          status: "waiting",
          userName: "",
          message: "Waiting for card scan..."
        });
      }
      
      setLoading(false);
    };

    fetchData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "🟢";
      case "offline":
        return "🔴";
      default:
        return "🟡";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "online":
        return "Online";
      case "offline":
        return "Offline";
      default:
        return "Checking...";
    }
  };

  const handleRetryConnection = () => {
    window.location.reload();
  };



  // Determine what to show based on backend status
  const getDisplayCount = () => {
    if (loading) return "Loading...";
    if (backendStatus === "offline") return "N/A";
    return totalPeople;
  };

  const getDisplayInfo = () => {
    if (loading) return <p>Loading...</p>;
    if (backendStatus === "offline") {
      return (
        <>
          <p className="count na">N/A</p>
          <small className="mock-indicator">No Connection</small>
        </>
      );
    }
    return (
      <>
        <p className="count">{totalPeople}</p>
        {useMockData && (
          <small className="mock-indicator">(Mock Data)</small>
        )}
      </>
    );
  };

  const getESP32Display = () => {
    if (backendStatus === "offline") {
      return (
        <>
          <p className="status-display">
            <span className="status-icon">🔴</span>
            <span className="status-text">Offline</span>
          </p>
          <p className="access-message">Backend connection required</p>
        </>
      );
    }

    switch (esp32Data.status) {
      case "access_allowed":
        return (
          <>
            <p className="status-display">
              <span className="status-icon">✅</span>
              <span className="status-text">Access Allowed</span>
            </p>
            {esp32Data.userName && (
              <p className="access-name">Name: {esp32Data.userName}</p>
            )}
            <p className="access-message">{esp32Data.message}</p>
          </>
        );
      case "access_denied":
        return (
          <>
            <p className="status-display">
              <span className="status-icon">❌</span>
              <span className="status-text">Access Denied</span>
            </p>
            {esp32Data.userName && (
              <p className="access-name">Name: {esp32Data.userName}</p>
            )}
            <p className="access-message">{esp32Data.message}</p>
          </>
        );
      default: // waiting
        return (
          <>
            <p className="status-display">
              <span className="status-icon">🟡</span>
              <span className="status-text">Waiting</span>
            </p>
            <p className="access-message">{esp32Data.message}</p>
          </>
        );
    }
  };

  return (
    <div className="page">
      <h1>RFID Dashboard</h1>
      
      {backendStatus === "offline" && (
        <div className="info-banner">
          <p>⚠️ Backend server is offline - Using limited functionality</p>
          <small>Start the backend server to use all features</small>
        </div>
      )}

      <div className="cards">
        <div className="card">
          <h3>Total Registered People</h3>
          {getDisplayInfo()}
        </div>

        <div className="card">
          <h3>Backend Status</h3>
          <p className="status-display">
            <span className="status-icon">{getStatusColor(backendStatus)}</span>
            <span className="status-text">{getStatusText(backendStatus)}</span>
          </p>
          {backendStatus === "offline" && (
            <button 
              className="retry-btn" 
              onClick={handleRetryConnection}
            >
              Retry Connection
            </button>
          )}
        </div>

        <div className="card">
          <h3>ESP32 Status</h3>
          {getESP32Display()}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;