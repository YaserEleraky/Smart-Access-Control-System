# 📁 Project Structure Overview

This document provides a comprehensive overview of the RFID Access Control System project structure, explaining each folder and its purpose.

---

## 🌳 Complete Directory Tree

```
rfid-control/                                    # 🎯 Root Project Directory
│
├── 📄 README.md                                 # 📘 Main project documentation (YOU ARE HERE)
├── 📄 LICENSE                                   # ⚖️ MIT License file
├── 📄 .gitignore                                # 🔒 Git ignore rules
│
├── 📁 Media/                                    # 🖼️ Media Assets
│   └── 📄 1781729470.png                        # 🖼️ System architecture diagram/photo
```

PROJECT_STRUCTURE.md
```markdown
<<<<<<< SEARCH
### 🎯 Root Level (`rfid-control/`)

| File/Folder | Purpose | Key Contents |
|-------------|---------|--------------|
| **README.md** | Main project documentation | Setup guide, architecture, API docs |
| **LICENSE** | Legal license | MIT License terms |
| **.gitignore** | Version control | Excludes build artifacts, dependencies |
| **Media/** | Media assets | Images, diagrams, and visual resources |
| **Backend-SpringBoot/** | Backend application | Spring Boot server code |
### 🎯 Root Level (`rfid-control/`)

| File/Folder | Purpose | Key Contents |
|-------------|---------|--------------|
| **README.md** | Main project documentation | Setup guide, architecture, API docs |
| **LICENSE** | Legal license | MIT License terms |
| **.gitignore** | Version control | Excludes build artifacts, dependencies |
| **Backend-SpringBoot/** | Backend application | Spring Boot server code |
| **Media/** | Media assets | Images, diagrams, and visual content |
│
├── 📁 Backend-SpringBoot/                       # ☕ Spring Boot Backend Application
│   │
│   ├── 📁 src/
│   │   └── 📁 main/
│   │       ├── 📁 java/
│   │       │   └── 📁 com/rfid/rfid_control/
│   │       │       ├── 📁 config/               # ⚙️ Configuration Classes
│   │       │       │   ├── CorsConfig.java      # CORS policy for cross-origin requests
│   │       │       │   └── MqttConfig.java      # MQTT broker connection configuration
│   │       │       │
│   │       │       ├── 📁 controller/           # 🎮 REST API Endpoints
│   │       │       │   └── AccessController.java # Main API controller (register, cards, logs)
│   │       │       │
│   │       │       ├── 📁 model/                # 📊 Data Models & Entities
│   │       │       │   ├── 📁 dto/              # Data Transfer Objects
│   │       │       │   │   ├── RegisterRequest.java  # Registration request payload
│   │       │       │   │   └── RegisterResponse.java # Registration response payload
│   │       │       │   ├── AccessLog.java       # Access event log entity
│   │       │       │   └── Card.java            # RFID card entity
│   │       │       │
│   │       │       ├── 📁 repository/           # 💾 Database Access Layer (JPA)
│   │       │       │   ├── AccessLogRepository.java # Access log CRUD operations
│   │       │       │   └── CardRepository.java  # Card CRUD operations
│   │       │       │
│   │       │       ├── 📁 service/              # 💼 Business Logic Layer
│   │       │       │   ├── AccessService.java   # Access control logic & validation
│   │       │       │   └── MqttService.java     # MQTT messaging service
│   │       │       │
│   │       │       └── RfidControlApplication.java # 🚀 Spring Boot application entry point
│   │       │
│   │       └── 📁 resources/
│   │           ├── 📁 static/
│   │           │   └── index.html               # Static HTML fallback page
│   │           ├── 📁 templates/
│   │           │   └── index.html               # Thymeleaf template (optional)
│   │           └── application.yaml             # ⚙️ Application configuration (ports, DB, MQTT)
│   │
│   ├── 📄 pom.xml                               # 📦 Maven dependencies & build configuration
│   ├── 📄 mvnw.cmd                              # 🔧 Maven wrapper script (Windows)
│   ├── 📄 mvnw                                  # 🔧 Maven wrapper script (Unix/Linux/Mac)
│   ├── 📁 .mvn/                                 # Maven wrapper configuration
│   └── 📄 README.md                             # 📘 Backend-specific documentation
│
├── 📁 rfid-frontend/                            # ⚛️ React Frontend Application (Vite)
│   │
│   ├── 📁 src/
│   │   ├── 📁 pages/                            # 📄 Page Components (Routes)
│   │   │   ├── Dashboard.jsx                    # 🏠 Main dashboard with real-time monitoring
│   │   │   ├── RegisterPerson.jsx               # 📝 Card registration form
│   │   │   └── RegisteredPeople.jsx             # 👥 List of all registered cards/people
│   │   │
│   │   ├── 📁 services/                         # 🔌 API Integration Layer
│   │   │   └── api.js                           # Axios HTTP client configuration
│   │   │
│   │   ├── 📁 data/                             # 🗃️ Mock Data for Development
│   │   │   └── mockData.js                      # Sample data when backend is offline
│   │   │
│   │   ├── 📁 assets/                           # 🖼️ Static Assets
│   │   │   └── react.svg                        # React logo
│   │   │
│   │   ├── App.jsx                              # 🎨 Main app component with routing
│   │   ├── main.jsx                             # 🚀 React application entry point
│   │   └── index.css                            # 🎨 Global CSS styles & theme
│   │
│   ├── 📁 public/                               # 📂 Public Static Files
│   │   └── vite.svg                             # Vite logo
│   │
│   ├── 📄 index.html                            # 📄 HTML template
│   ├── 📄 package.json                          # 📦 Node.js dependencies & scripts
│   ├── 📄 package-lock.json                     # 🔒 Exact dependency versions
│   ├── 📄 vite.config.js                        # ⚙️ Vite build tool configuration
│   ├── 📄 eslint.config.js                      # 🔍 ESLint code quality configuration
│   └── 📄 README.md                             # 📘 Frontend-specific documentation
│
├── 📁 sketch_server-Rfid/                       # 🔧 ESP32 Arduino Firmware
│   │
│   ├── 📄 sketch_server-Rfid.ino                # 💻 Main Arduino sketch/firmware code
│   ├── 📄 README.md                             # 📘 Hardware setup & wiring guide
│   └── 📄 DOCUMENTATION.md                      # 📚 Detailed technical documentation
│
└── 📁 target/                                   # 🏗️ Build Output (Generated by Maven)
    ├── classes/                                 # Compiled Java classes
    ├── generated-sources/                       # Generated source files
    └── rfid-control-0.0.1-SNAPSHOT.jar         # Packaged JAR file
```

---

## 📋 Folder Descriptions

### 🎯 Root Level (`rfid-control/`)

| File/Folder | Purpose | Key Contents |
|-------------|---------|--------------|
| **README.md** | Main project documentation | Setup guide, architecture, API docs |
| **LICENSE** | Legal license | MIT License terms |
| **.gitignore** | Version control | Excludes build artifacts, dependencies |
| **Media/** | Media assets | Images, diagrams, and visual resources |
| **Backend-SpringBoot/** | Backend application | Spring Boot server code |
| **rfid-frontend/** | Frontend application | React web interface |
| **sketch_server-Rfid/** | Hardware firmware | ESP32 Arduino code |
| **target/** | Build output | Compiled JAR (auto-generated) |

---

### 🖼️ Media/

This folder contains **visual assets and media files** used in the project documentation.

#### 🔑 Important Files

| File | Purpose |
|------|---------|
| **1781729470.png** | System architecture diagram showing complete RFID access control system |

**Usage:**
- Referenced in main README.md for visual overview
- Can be used in presentations and reports
- Suitable for documentation and demonstrations

| File/Folder | Purpose | Key Contents |
|-------------|---------|--------------|
| **README.md** | Main project documentation | Setup guide, architecture, API docs |
| **LICENSE** | Legal license | MIT License terms |
| **1781729470.png** | Visual asset | System architecture diagram |
| **.gitignore** | Version control | Excludes build artifacts, dependencies |
| **Backend-SpringBoot/** | Backend application | Spring Boot server code |
| **rfid-frontend/** | Frontend application | React web interface |
| **sketch_server-Rfid/** | Hardware firmware | ESP32 Arduino code |
| **target/** | Build output | Compiled JAR (auto-generated) |

---

### ☕ Backend-SpringBoot

This folder contains the **Spring Boot backend application** that serves as the central hub for the system.

#### 📂 Key Subdirectories

| Directory | Purpose | Description |
|-----------|---------|-------------|
| **config/** | Configuration | Spring Boot configuration beans |
| **controller/** | API Layer | REST endpoints for HTTP requests |
| **model/** | Data Layer | Entity classes and DTOs |
| **repository/** | Database Layer | JPA repositories for data persistence |
| **service/** | Business Logic | Core application logic |
| **resources/** | Resources | Configuration files and static assets |

#### 🔑 Important Files

| File | Purpose |
|------|---------|
| `RfidControlApplication.java` | Main class with `@SpringBootApplication` annotation |
| `AccessController.java` | Handles all API requests (register, cards, logs) |
| `AccessService.java` | Implements access control business logic |
| `MqttService.java` | Manages MQTT communication with ESP32 |
| `Card.java` | JPA entity representing RFID cards in database |
| `AccessLog.java` | JPA entity for access event logging |
| `application.yaml` | Configuration for ports, database, MQTT broker |
| `pom.xml` | Maven dependencies (Spring Boot, SQLite, MQTT, etc.) |

#### 🔄 Request Flow

```
HTTP Request → AccessController → AccessService → CardRepository → SQLite Database
                                      ↓
                                 MqttService → MQTT Broker → ESP32
```

---

### ⚛️ rfid-frontend

This folder contains the **React frontend application** built with Vite.

#### 📂 Key Subdirectories

| Directory | Purpose | Description |
|-----------|---------|-------------|
| **pages/** | Route Components | Full-page components mapped to URLs |
| **services/** | API Client | Axios configuration for backend communication |
| **data/** | Mock Data | Fallback data for offline development |
| **assets/** | Static Assets | Images, icons, and other media |

#### 🔑 Important Files

| File | Purpose |
|------|---------|
| `App.jsx` | Main app component with React Router setup |
| `main.jsx` | Entry point that renders App into DOM |
| `Dashboard.jsx` | Real-time monitoring dashboard page |
| `RegisterPerson.jsx` | Form for registering new RFID cards |
| `RegisteredPeople.jsx` | Table/list of all registered personnel |
| `api.js` | Configured Axios instance with error handling |
| `mockData.js` | Sample data for development without backend |
| `index.css` | Global styles, color variables, responsive design |
| `package.json` | Dependencies (React, Vite, Axios, etc.) |
| `vite.config.js` | Vite build configuration |

#### 🎨 Page Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Dashboard | System overview with live status |
| `/register` | RegisterPerson | Card registration interface |
| `/cards` | RegisteredPeople | Browse registered cards |

---

### 🔧 sketch_server-Rfid

This folder contains the **ESP32 Arduino firmware** for hardware control.

#### 🔑 Important Files

| File | Purpose |
|------|---------|
| `sketch_server-Rfid.ino` | Main firmware code (C++ for Arduino) |
| `README.md` | Hardware wiring guide and setup instructions |
| `DOCUMENTATION.md` | Comprehensive technical specifications |

#### 🛠️ Hardware Components Controlled

- **MFRC522 RFID Reader**: Reads 13.56 MHz RFID cards via SPI
- **Servo Motor**: Controls physical door lock mechanism
- **Green LED**: Indicates access granted
- **Red LED**: Indicates access denied or timeout
- **WiFi Module**: Connects to network for MQTT communication

#### 📡 Communication Protocol

- **MQTT Topics**: Publishes/subscribes to MQTT broker
- **JSON Messages**: Uses ArduinoJson library for structured data
- **State Machine**: Manages different operation modes (ACCESS, REGISTERING)

---

## 🔗 Inter-Folder Relationships

### Data Flow Between Components

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERACTION                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│          rfid-frontend/ (React Web Interface)               │
│  - Sends HTTP requests to backend                           │
│  - Displays real-time updates                               │
│  - Provides user interface for management                   │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST (JSON)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│       Backend-SpringBoot/ (Spring Boot Server)              │
│  - Processes API requests                                   │
│  - Manages SQLite database                                  │
│  - Communicates with ESP32 via MQTT                         │
└────────────────────┬────────────────────────────────────────┘
                     │ MQTT Protocol
                     ▼
┌─────────────────────────────────────────────────────────────┐
│       sketch_server-Rfid/ (ESP32 Firmware)                  │
│  - Reads RFID cards                                         │
│  - Controls servo motor (door lock)                         │
│  - Manages LED indicators                                   │
│  - Reports status back to server                            │
└─────────────────────────────────────────────────────────────┘
```

### Dependency Chain

1. **Frontend depends on Backend**
   - Makes HTTP requests to `http://localhost:8081/api`
   - Expects JSON responses
   - Requires CORS enabled

2. **Backend depends on Database**
   - Uses SQLite for persistent storage
   - JPA/Hibernate for ORM
   - Automatic schema creation

3. **Backend depends on MQTT Broker**
   - Publishes commands to ESP32
   - Subscribes to ESP32 status updates
   - Requires Mosquitto or similar broker

4. **ESP32 depends on Backend**
   - Receives access decisions via MQTT
   - Sends card scan results to backend
   - Requires WiFi connectivity

---

## 📊 Technology Stack by Folder

### Backend-SpringBoot

| Technology | Usage |
|------------|-------|
| Java 25 | Programming language |
| Spring Boot 4.0.6 | Web framework |
| Spring Data JPA | Database ORM |
| SQLite | Embedded database |
| Eclipse Paho MQTT | MQTT client library |
| Maven | Build tool |
| Lombok | Code generation |

### rfid-frontend

| Technology | Usage |
|------------|-------|
| React 19.2.6 | UI framework |
| Vite 8.0.12 | Build tool |
| React Router DOM | Client-side routing |
| Axios | HTTP client |
| React Icons | Icon library |
| npm | Package manager |

### sketch_server-Rfid

| Technology | Usage |
|------------|-------|
| C++ (Arduino) | Programming language |
| ESP32 DevKit | Microcontroller |
| MFRC522 Library | RFID reader control |
| PubSubClient | MQTT client |
| ArduinoJson | JSON parsing |
| ESP32Servo | Servo motor control |

---

## 🚀 Development Workflow

### Typical Development Session

1. **Start MQTT Broker**
   ```bash
   mosquitto -v
   ```

2. **Start Backend**
   ```bash
   cd Backend-SpringBoot
   ./mvnw spring-boot:run
   ```

3. **Start Frontend**
   ```bash
   cd rfid-frontend
   npm run dev
   ```

4. **Upload ESP32 Firmware**
   - Open `sketch_server-Rfid.ino` in Arduino IDE
   - Configure WiFi and MQTT settings
   - Upload to ESP32 board

5. **Access Application**
   - Open browser to `http://localhost:5173`
   - Test card registration and access control

---

## 📝 Best Practices for Each Folder

### Backend-SpringBoot

✅ Follow MVC pattern  
✅ Use DTOs for API contracts  
✅ Implement proper error handling  
✅ Write unit tests for services  
✅ Document API endpoints  

### rfid-frontend

✅ Use functional components with hooks  
✅ Implement proper state management  
✅ Handle loading and error states  
✅ Optimize re-renders with React.memo  
✅ Follow ESLint rules  

### sketch_server-Rfid

✅ Use non-blocking code (avoid `delay()`)  
✅ Implement proper error handling  
✅ Add serial debug messages  
✅ Use constants for pin numbers  
✅ Comment complex logic  

---

## 🔍 Quick Reference: Where to Find What

| Task | Location |
|------|----------|
| Change API endpoint | `Backend-SpringBoot/src/main/java/com/rfid/rfid_control/controller/AccessController.java` |
| Modify database schema | `Backend-SpringBoot/src/main/java/com/rfid/rfid_control/model/Card.java` |
| Update MQTT settings | `Backend-SpringBoot/src/main/resources/application.yaml` |
| Add new page | `rfid-frontend/src/pages/NewPage.jsx` + update `App.jsx` |
| Change API URL | `rfid-frontend/src/services/api.js` |
| Modify ESP32 pins | `sketch_server-Rfid/sketch_server-Rfid.ino` |
| Update WiFi credentials | `sketch_server-Rfid/sketch_server-Rfid.ino` |
| Change colors/styles | `rfid-frontend/src/index.css` |

---

## 📖 Additional Resources

For detailed information about each component, refer to:

- **Backend**: [Backend-SpringBoot/README.md](Backend-SpringBoot/README.md)
- **Frontend**: [rfid-frontend/README.md](rfid-frontend/README.md)
- **Hardware**: [sketch_server-Rfid/README.md](sketch_server-Rfid/README.md)
- **Technical Specs**: [sketch_server-Rfid/DOCUMENTATION.md](sketch_server-Rfid/DOCUMENTATION.md)

---

<div align="center">

**Project Structure Documentation**  
*Last Updated: June 18, 2026*

</div>
