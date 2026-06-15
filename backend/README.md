# RFID Access Control Backend

## Installation

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```
   For development with auto-restart:
   ```
   npm run dev
   ```

## API Endpoints

### Health Check
- **GET** `/api/health`
- Returns backend status

### People Management
- **GET** `/api/people`
- Returns all registered people

- **POST** `/api/people`
- Add a new person

- **GET** `/api/people/:id`
- Get person by ID

### ESP32 Status (Future)
- **GET** `/api/esp32/status`
- ESP32 hardware connection status

## Default Port
- Backend runs on port 8081: `http://localhost:8081`