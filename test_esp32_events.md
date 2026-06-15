# Testing ESP32 Access Events

## Setup
1. Start backend server:
   ```bash
   cd backend
   npm install
   npm start
   ```

2. Start frontend server:
   ```bash
   cd rfid-frontend
   npm run dev
   ```

3. Open dashboard: `http://localhost:5173`

## Testing Scenarios

### Scenario 1: Backend Online
1. Dashboard will show:
   - Total Registered People: 5 (from backend)
   - Backend Status: 🟢 Online
   - ESP32 Status: 🟡 Waiting (Waiting for card scan...)

### Scenario 2: Simulate Access Allowed
Use the following curl command or Postman to simulate an access allowed event:

```bash
# Access Allowed for John Doe
curl -X POST http://localhost:8081/api/esp32/access \
  -H "Content-Type: application/json" \
  -d '{
    "status": "access_allowed",
    "userName": "John Doe",
    "uid": "AB1234"
  }'
```

Dashboard will show:
- ESP32 Status: ✅ Access Allowed
- Name: John Doe
- Message: Access granted for John Doe

### Scenario 3: Simulate Access Denied
```bash
# Access Denied for Unknown Card
curl -X POST http://localhost:8081/api/esp32/access \
  -H "Content-Type: application/json" \
  -d '{
    "status": "access_denied",
    "userName": "Unknown User",
    "uid": "XX9999"
  }'
```

Dashboard will show:
- ESP32 Status: ❌ Access Denied
- Name: Unknown User
- Message: Access denied for Unknown User

### Scenario 4: Reset to Waiting State
```bash
# Reset ESP32 to waiting state
curl -X POST http://localhost:8081/api/esp32/reset
```

Dashboard will show:
- ESP32 Status: 🟡 Waiting
- Message: Waiting for card scan...

### Scenario 5: Backend Offline
1. Stop backend server
2. Refresh dashboard

Dashboard will show:
- Total Registered People: N/A (No Connection)
- Backend Status: 🔴 Offline
- ESP32 Status: 🔴 Offline (Backend connection required)

## Dashboard Features Summary

### Total Registered People Card
- Shows actual count from backend when connected
- Shows "N/A" with "No Connection" indicator when backend is offline
- Shows "Loading..." while fetching data

### Backend Status Card
- 🟢 Online when backend is responding
- 🔴 Offline when backend is not reachable
- Includes "Retry Connection" button
- Auto-refreshes every 30 seconds

### ESP32 Status Card
When backend is online:
- ✅ Access Allowed (with user name)
- ❌ Access Denied (with user name)
- 🟡 Waiting (Waiting for card scan...)

When backend is offline:
- 🔴 Offline (Backend connection required)

## Real-time Updates
The dashboard automatically refreshes ESP32 status every 30 seconds along with other data. You can also trigger access events in real-time and see them appear on the dashboard.