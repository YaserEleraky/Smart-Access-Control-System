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
  const [accessStatus, setAccessStatus] = useState({
    hasRecentActivity: false,
    result: "",
    userName: "",
    uid: "",
    timestamp: null,
    message: "No card scans yet"
  });
  const [doorStatus, setDoorStatus] = useState({
    doorState: "UNKNOWN",
    hasData: false,
    message: "Waiting for ESP32 status...",
    doorOpenFor: 0,
    doorClosesIn: 10,
    deviceId: "ESP32-RFID-01",
    lastUpdate: 0
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
          // Fetch registered cards data from real backend
          const cardsResponse = await api.get("/cards");
          if (cardsResponse.data && cardsResponse.data.cards && Array.isArray(cardsResponse.data.cards)) {
            setTotalPeople(cardsResponse.data.total || cardsResponse.data.cards.length);
          }
        } catch (error) {
          console.error("Error fetching cards data:", error);
        }
        
        try {
          // Fetch ESP32 status data
          const esp32Response = await api.get("/esp32/status");
          if (esp32Response.data) {
            setEsp32Data({
              status: esp32Response.data.status || "disconnected",
              userName: "",
              message: esp32Response.data.message || "Check MQTT connection"
            });
          }
        } catch (error) {
          console.error("Error fetching ESP32 data:", error);
          setEsp32Data({
            status: "error",
            userName: "",
            message: "Failed to get ESP32 status"
          });
        }

        try {
          // Fetch door status data
          const doorResponse = await api.get("/door/status");
          if (doorResponse.data) {
            setDoorStatus({
              doorState: doorResponse.data.doorState || "UNKNOWN",
              hasData: doorResponse.data.hasData || false,
              message: doorResponse.data.message || "Waiting for ESP32 status...",
              doorOpenFor: doorResponse.data.doorOpenFor || 0,
              doorClosesIn: doorResponse.data.doorClosesIn || 10,
              deviceId: doorResponse.data.deviceId || "ESP32-RFID-01",
              lastUpdate: doorResponse.data.lastUpdate || 0
            });
          }
        } catch (error) {
          console.error("Error fetching door status:", error);
          setDoorStatus({
            doorState: "ERROR",
            hasData: false,
            message: "Failed to get door status"
          });
        }

        try {
          // Fetch latest access status
          const accessResponse = await api.get("/access/latest");
          if (accessResponse.data) {
            setAccessStatus({
              hasRecentActivity: accessResponse.data.hasRecentActivity || false,
              result: accessResponse.data.result || "",
              userName: accessResponse.data.userName || "",
              uid: accessResponse.data.uid || "",
              timestamp: accessResponse.data.timestamp || null,
              message: accessResponse.data.message || "No card scans yet"
            });
          }
        } catch (error) {
          console.error("Error fetching access status:", error);
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
    
    // Refresh data every 30 seconds for general data
    const generalInterval = setInterval(fetchData, 30000);
    
    // Refresh access status more frequently (every 2 seconds) for real-time updates
    const accessStatusInterval = setInterval(async () => {
      if (backendStatus === "online") {
        try {
          const accessResponse = await api.get("/access/latest");
          if (accessResponse.data) {
            setAccessStatus({
              hasRecentActivity: accessResponse.data.hasRecentActivity || false,
              result: accessResponse.data.result || "",
              userName: accessResponse.data.userName || "",
              uid: accessResponse.data.uid || "",
              timestamp: accessResponse.data.timestamp || null,
              message: accessResponse.data.message || "No card scans yet"
            });
          }
        } catch (error) {
          console.error("Error fetching access status:", error);
        }
      }
    }, 2000);

    // Refresh door status frequently (every 3 seconds) for real-time updates
    const doorStatusInterval = setInterval(async () => {
      if (backendStatus === "online") {
        try {
          const doorResponse = await api.get("/door/status");
          if (doorResponse.data) {
            setDoorStatus({
              doorState: doorResponse.data.doorState || "UNKNOWN",
              hasData: doorResponse.data.hasData || false,
              message: doorResponse.data.message || "Waiting for ESP32 status...",
              doorOpenFor: doorResponse.data.doorOpenFor || 0,
              doorClosesIn: doorResponse.data.doorClosesIn || 10,
              deviceId: doorResponse.data.deviceId || "ESP32-RFID-01",
              lastUpdate: doorResponse.data.lastUpdate || 0
            });
          }
        } catch (error) {
          console.error("Error fetching door status:", error);
        }
      }
    }, 3000);
    
    return () => {
      clearInterval(generalInterval);
      clearInterval(accessStatusInterval);
      clearInterval(doorStatusInterval);
    };
  }, [backendStatus]);

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
            <span className="status-text">Backend Offline</span>
          </p>
          <div className="status-details">
            <div className="status-detail">✗ Cannot check ESP32 status</div>
            <div className="status-detail">✗ Start Spring Boot server</div>
            <div className="status-detail">✗ Check port 8081</div>
          </div>
        </>
      );
    }

    // Enhanced ESP32 status tracking
    const getESP32StatusDetails = () => {
      const esp32Status = esp32Data.status || "unknown";
      
      switch(esp32Status) {
        case "connected":
          return {
            icon: "🟢",
            text: "ESP32 Connected",
            color: "success",
            details: [
              "✓ MQTT connection active",
              "✓ RFID reader initialized",
              "✓ Waiting for card scan",
              "✓ Door monitoring active"
            ],
            instructions: "Present RFID card to reader"
          };
        case "disconnected":
          return {
            icon: "🔴", 
            text: "ESP32 Disconnected",
            color: "error",
            details: [
              "✗ MQTT connection lost",
              "✗ Check ESP32 power",
              "✗ Verify network settings",
              "✗ Check MQTT broker"
            ],
            instructions: "Connect ESP32 to 10.81.117.180:1883"
          };
        case "scanning":
          return {
            icon: "🔄",
            text: "Scanning Active",
            color: "info",
            details: [
              "✓ Card detection active",
              "✓ Reader scanning continuously",
              "✓ Present card to reader",
              "✓ System ready"
            ],
            instructions: "Card detected - processing..."
          };
        case "error":
          return {
            icon: "⚠️",
            text: "ESP32 Error",
            color: "error",
            details: [
              "✗ RFID reader issue",
              "✗ Check wiring connections",
              "✗ Verify servo connections",
              "✗ Check ESP32 logs"
            ],
            instructions: "Check hardware connections"
          };
        default:
          return {
            icon: "🟡",
            text: "Checking Status...",
            color: "warning",
            details: [
              "Connecting to ESP32...",
              "Checking MQTT connection...",
              "Initializing RFID reader...",
              "Starting door monitoring..."
            ],
            instructions: "System initializing..."
          };
      }
    };

    const status = getESP32StatusDetails();
    
    return (
      <>
        <p className="status-display">
          <span className="status-icon">{status.icon}</span>
          <span className="status-text">{status.text}</span>
        </p>
        
        <div className="status-details">
          {status.details.map((detail, index) => (
            <div key={index} className="status-detail">
              {detail}
            </div>
          ))}
        </div>
        
        <p className="access-message">{esp32Data.message || status.instructions}</p>
        
        {esp32Data.mqttBroker && (
          <small className="mock-indicator">
            MQTT Broker: {esp32Data.mqttBroker}
          </small>
        )}
      </>
    );
  };

  const getDoorDisplay = () => {
    if (backendStatus === "offline") {
      return (
        <>
          <p className="status-display">
            <span className="status-icon">🔴</span>
            <span className="status-text">System Offline</span>
          </p>
          <div className="status-details">
            <div className="status-detail">✗ Backend server offline</div>
            <div className="status-detail">✗ Cannot check door status</div>
            <div className="status-detail">✗ Start Spring Boot server</div>
            <div className="status-detail">✗ Check port 8081</div>
          </div>
        </>
      );
    }

    // Enhanced door status tracking
    const getDoorStatusDetails = () => {
      const state = doorStatus.doorState || "UNKNOWN";
      
      switch(state) {
        case "LOCKED":
          return {
            icon: "🔒",
            text: "Door Locked",
            color: "info",
            details: [
              "✓ Door is securely locked",
              "✓ Servo in closed position (90°)",
              "✓ Red indicator light ON",
              "✓ Ready for card scan"
            ],
            action: "DOOR_LOCKED",
            countdown: null
          };
        case "OPEN":
          const openFor = doorStatus.doorOpenFor || 0;
          const closesIn = doorStatus.doorClosesIn || 10;
          return {
            icon: "🔓",
            text: "Door Open",
            color: "success",
            details: [
              `✓ Door is currently open (${openFor}s)`, 
              `✓ Auto-close in ${closesIn}s`,
              "✓ Green indicator light ON",
              "✓ Access granted - Entry permitted"
            ],
            action: "DOOR_OPEN",
            countdown: closesIn
          };
        case "TIMEOUT":
          return {
            icon: "⚠️",
            text: "Door Open - Warning",
            color: "warning",
            details: [
              "⚠️ Door open for 10+ seconds",
              "⚠️ Red indicator flashing",
              "⚠️ Door will force close in 5s",
              "⚠️ Check for obstructions"
            ],
            action: "TIMEOUT",
            countdown: null
          };
        case "ERROR":
          return {
            icon: "❌",
            text: "Door Status Error",
            color: "error",
            details: [
              "✗ Failed to get door status",
              "✗ Check ESP32 connection",
              "✗ Verify MQTT broker",
              "✗ Check hardware connections"
            ],
            action: "ERROR",
            countdown: null
          };
        default:
          return {
            icon: "🟡",
            text: "Door Status Unknown",
            color: "warning",
            details: [
              "Waiting for ESP32 status updates...",
              "No door status data received",
              "Ensure ESP32 is powered on",
              "Check MQTT connection"
            ],
            action: "UNKNOWN",
            countdown: null
          };
      }
    };

    const status = getDoorStatusDetails();
    const lastUpdate = doorStatus.lastUpdate ? new Date(doorStatus.lastUpdate).toLocaleTimeString([], 
      {hour: '2-digit', minute:'2-digit', second:'2-digit'}) : "Never";
    
    return (
      <>
        <p className="status-display">
          <span className="status-icon">{status.icon}</span>
          <span className="status-text">{status.text}</span>
        </p>
        
        <div className="status-details">
          {status.details.map((detail, index) => (
            <div key={index} className="status-detail">
              {detail}
            </div>
          ))}
        </div>
        
        {status.countdown && status.countdown > 0 && (
          <div className="countdown-display">
            <small>⏱️ Closing in: {status.countdown}s</small>
          </div>
        )}
        
        <div className="timestamp-container">
          <small className="timestamp">
            Last update: {lastUpdate}
          </small>
        </div>
        
        {status.action === "DOOR_LOCKED" && (
          <div className="door-instruction">
            <small>🔑 Scan RFID card to open door</small>
          </div>
        )}
        
        {status.action === "DOOR_OPEN" && (
          <div className="door-instruction">
            <small>🚪 Door will auto-close soon</small>
          </div>
        )}
      </>
    );
  };

  const getAccessDisplay = () => {
    if (backendStatus === "offline") {
      return (
        <>
          <p className="status-display">
            <span className="status-icon">🔴</span>
            <span className="status-text">System Offline</span>
          </p>
          <div className="status-details">
            <div className="status-detail">✗ Backend server offline</div>
            <div className="status-detail">✗ Cannot check access logs</div>
            <div className="status-detail">✗ Start Spring Boot server</div>
            <div className="status-detail">✗ Check port 8081</div>
          </div>
        </>
      );
    }

    // Enhanced access status tracking
    const getAccessStatusDetails = () => {
      if (!accessStatus.hasRecentActivity) {
        return {
          icon: "🟡",
          text: "Ready for Scan",
          color: "warning",
          details: [
            "✓ System ready for scanning",
            "✓ RFID scanner active",
            "✗ No recent card scans",
            "✓ Door monitoring active"
          ],
          action: "WAITING_FOR_SCAN",
          timestamp: accessStatus.timestamp
        };
      }

      const isAllowed = accessStatus.result === "ALLOWED";
      
      if (isAllowed) {
        return {
          icon: "✅",
          text: "Access Granted",
          color: "success",
          details: [
            `✓ Access granted for ${accessStatus.userName || "user"}`,
            `✓ Card UID: ${accessStatus.uid || "unknown"}`,
            "✓ Door is now open",
            "✓ Entry permitted - 10 second access"
          ],
          action: "DOOR_OPEN",
          timestamp: accessStatus.timestamp
        };
      } else {
        return {
          icon: "❌",
          text: "Access Denied",
          color: "error",
          details: [
            `✗ Access denied for ${accessStatus.userName || "unknown user"}`,
            `✗ Card UID: ${accessStatus.uid || "unknown"}`,
            "✗ Door remains locked",
            "✗ Entry not permitted"
          ],
          action: "DOOR_LOCKED",
          timestamp: accessStatus.timestamp
        };
      }
    };

    const status = getAccessStatusDetails();
    
    return (
      <>
        <p className="status-display">
          <span className="status-icon">{status.icon}</span>
          <span className="status-text">{status.text}</span>
        </p>
        
        <div className="status-details">
          {status.details.map((detail, index) => (
            <div key={index} className="status-detail">
              {detail}
            </div>
          ))}
        </div>
        
        {status.timestamp && (
          <div className="timestamp-container">
            <small className="timestamp">
              Last scan: {new Date(status.timestamp).toLocaleTimeString([], 
                {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
            </small>
          </div>
        )}
        
        {status.action === "WAITING_FOR_SCAN" && (
          <div className="scan-instruction">
            <small>📱 Place RFID card near the reader</small>
          </div>
        )}
        
        {status.action === "DOOR_OPEN" && (
          <div className="scan-instruction">
            <small>🚪 Door will auto-close in 10 seconds</small>
          </div>
        )}
      </>
    );
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

        <div className="card">
          <h3>Access Control Status</h3>
          {getAccessDisplay()}
        </div>

        <div className="card">
          <h3>Door Status</h3>
          {getDoorDisplay()}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;