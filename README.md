# Smart Access Control System

A full-stack RFID access control system with real-time dashboard monitoring.

## Project Structure

```
Smart access control system/
├── rfid-frontend/     # React frontend application
└── backend/          # Node.js/Express backend API
```

## Setup Instructions

### 1. Frontend Setup
```bash
cd rfid-frontend
npm install
npm run dev
```

Frontend will run on: `http://localhost:5173`

### 2. Backend Setup
```bash
cd backend
npm install
npm start
```

Backend will run on: `http://localhost:8081`

## Features Implemented

### Dashboard
- **Total Registered People**: Shows count from backend API or "N/A" when offline
- **Backend Status**: Real-time monitoring of backend connectivity (Online/Offline)
- **ESP32 Status**: Shows access allowed/denied/waiting status with user names

### Backend API Endpoints
- `GET /api/health` - Health check endpoint
- `GET /api/people` - Get all registered people
- `POST /api/people` - Add new person
- `GET /api/people/:id` - Get person by ID
- `GET /api/esp32/status` - Get ESP32 access status
- `POST /api/esp32/access` - Simulate ESP32 access event
- `POST /api/esp32/reset` - Reset ESP32 to waiting state

## Data Flow

1. **Frontend Dashboard** → Checks backend health status
2. **If backend online** → Fetches real data from `/api/people`
3. **If backend offline** → Falls back to mock data with visual indicator
4. **Auto-refresh** → Updates every 30 seconds

## Testing the Dashboard

### Scenario 1: Backend Online
1. Start both frontend and backend servers
2. Visit `http://localhost:5173`
3. Dashboard shows:
   - Total people count from backend
   - 🟢 Backend Status: Online
   - 🟡 ESP32 Status: Waiting (Waiting for card scan...)

### Scenario 2: Backend Offline
1. Start only frontend server (backend not running)
2. Visit `http://localhost:5173`
3. Dashboard shows:
   - Total people count: N/A (No Connection)
   - 🔴 Backend Status: Offline
   - 🔴 ESP32 Status: Offline (Backend connection required)
   - Warning banner indicating limited functionality
   - "Retry Connection" button

### Scenario 3: ESP32 Access Events
1. With backend running, simulate ESP32 events:
   - ✅ Access Allowed: User name appears
   - ❌ Access Denied: User name appears
   - 🟡 Waiting: Waiting for card scan...
2. Dashboard updates in real-time every 30 seconds

## Future Enhancements

1. **ESP32 Integration**: Connect to actual RFID hardware
2. **Real-time Updates**: WebSocket connections for instant updates
3. **Authentication**: User login and API security
4. **Database**: Replace mock data with MongoDB/PostgreSQL
5. **Logging**: Access logs and audit trails

## Troubleshooting

### Backend Connection Issues
- Ensure backend is running on port 8081
- Check if any other service is using port 8081
- Verify CORS is enabled in backend

### Frontend Issues
- Clear browser cache if changes aren't visible
- Check browser console for errors
- Verify all dependencies are installed