# RFID Access Control System 🚪📡

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Java](https://img.shields.io/badge/Java-25-orange?logo=openjdk)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.6-brightgreen?logo=spring-boot)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2.6-blue?logo=react)](https://react.dev/)
[![ESP32](https://img.shields.io/badge/Platform-ESP32-blue?logo=espressif)](https://www.espressif.com/en/products/socs/esp32)
[![MQTT](https://img.shields.io/badge/Protocol-MQTT-orange?logo=mqtt)](https://mqtt.org/)

> **IoT Course Final Project** - A comprehensive RFID-based access control system integrating Spring Boot backend, React frontend, and ESP32 hardware with MQTT communication.

---

## 📖 Overview

This project implements a complete **RFID Access Control System** for the UUST 302B Internet of Things course. The system manages personnel identification through RFID cards, controls physical door access via servo motors, and provides real-time monitoring through a modern web interface.

### 🎯 Key Features

- ✅ **Real-time Access Control** - Instant card verification and door unlock
- ✅ **Web-Based Management** - Register cards, view logs, monitor system status
- ✅ **ESP32 Integration** - Hardware control with MFRC522 RFID reader
- ✅ **MQTT Communication** - Reliable IoT messaging protocol
- ✅ **SQLite Database** - Lightweight data persistence
- ✅ **Responsive UI** - Modern React interface with live updates
- ✅ **Auto-Close Safety** - Automatic door closure with timeout warnings
- ✅ **Mock Data Support** - Offline development capability

---

## 🏗️ System Architecture

```
┌──────────────┐      HTTP/REST      ┌──────────────┐      MQTT       ┌─────────────┐
│   React      │ ◄════════════════► │  Spring Boot │ ◄════════════► │   ESP32     │
│  Frontend    │   (JSON over HTTP)  │   Backend    │  (Pub/Sub)     │  Hardware   │
│  (Port 5173) │                     │ (Port 8081)  │                │  (WiFi)     │
└──────────────┘                     └──────┬───────┘                └──────┬──────┘
                                           │                                │
                                    ┌──────▼───────┐                ┌──────▼──────┐
                                    │   SQLite     │                │  MFRC522    │
                                    │  Database    │                │  RFID Reader│
                                    └──────────────┘                │  + Servo    │
                                                                    │  + LEDs     │
                                                                    └─────────────┘
```

---

## 📦 Project Structure

```
rfid-control/
├── rfid-frontend/              # React SPA (Vite)
│   ├── src/
│   │   ├── pages/             # Dashboard, Register, Cards list
│   │   ├── services/          # API integration (Axios)
│   │   └── App.jsx            # Routing & layout
│   └── package.json
│
├── src/main/java/             # Spring Boot Backend
│   └── com/rfid/rfid_control/
│       ├── controller/        # REST API endpoints
│       ├── service/           # Business logic
│       ├── repository/        # JPA data access
│       ├── model/             # Entities & DTOs
│       └── config/            # CORS, MQTT config
│
├── sketch_server-Rfid/        # ESP32 Arduino Sketch
│   ├── sketch_server-Rfid.ino # Main firmware
│   └── README.md              # Hardware setup guide
│
├── pom.xml                    # Maven dependencies
└── README.md                  # This file
```

---

## 🚀 Quick Start

### Prerequisites

- ☕ **Java 25+** ([Download](https://www.oracle.com/java/technologies/downloads/))
- 🟢 **Node.js 18+** ([Download](https://nodejs.org/))
- 🛠️ **Maven 3.6+** (or use included `mvnw`)
- 📡 **MQTT Broker** (Mosquitto recommended)
- 🔧 **Arduino IDE** (for ESP32 flashing)

### 1️⃣ Backend Setup

```bash
# Navigate to project root
cd rfid-control

# Build and run Spring Boot backend
./mvnw spring-boot:run

# Backend will start at http://localhost:8081
```

### 2️⃣ Frontend Setup

```bash
# In a new terminal
cd rfid-frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Frontend will start at http://localhost:5173
```

### 3️⃣ ESP32 Setup

See detailed instructions in [`sketch_server-Rfid/README.md`](sketch_server-Rfid/README.md)

**Quick Steps:**
1. Install required libraries (MFRC522, PubSubClient, ArduinoJson, ESP32Servo)
2. Configure WiFi credentials and MQTT broker in `.ino` file
3. Wire hardware components (see pin diagram)
4. Upload sketch to ESP32 via Arduino IDE

---

## 📚 Documentation

Comprehensive documentation is available for each component:

| Component | Documentation | Description |
|-----------|--------------|-------------|
| **Backend** | [README.md](README.md) | Spring Boot API, database schema, MQTT integration |
| **Frontend** | [rfid-frontend/README.md](rfid-frontend/README.md) | React app setup, pages, API integration |
| **Hardware** | [sketch_server-Rfid/README.md](sketch_server-Rfid/README.md) | ESP32 wiring, libraries, troubleshooting |
| **Detailed Docs** | [sketch_server-Rfid/DOCUMENTATION.md](sketch_server-Rfid/DOCUMENTATION.md) | Complete hardware specification |

---

## 🔌 API Endpoints

### Base URL: `http://localhost:8081/api`

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/health` | Backend health check | ❌ |
| `POST` | `/register` | Register new RFID card | ❌ |
| `GET` | `/cards` | Get all registered cards | ❌ |
| `DELETE` | `/cards/{id}` | Deactivate card | ❌ |
| `GET` | `/logs` | Get access logs | ❌ |
| `GET` | `/esp32/status` | Get ESP32 device status | ❌ |
| `GET` | `/door/status` | Get current door state | ❌ |

### Example: Register Card

```bash
curl -X POST http://localhost:8081/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "cardId": "A1B2C3D4",
    "personName": "John Doe",
    "email": "john@example.com",
    "department": "Engineering"
  }'
```

---

## 📨 MQTT Topics

| Topic | Direction | Payload | Purpose |
|-------|-----------|---------|---------|
| `access/check` | ESP32 → Server | Plain UID | Verify card access |
| `access/response` | Server → ESP32 | "ALLOWED"/"DENIED" | Grant/deny access |
| `access/mode/set` | Server → ESP32 | JSON | Change operation mode |
| `access/scan_result` | ESP32 → Server | JSON | Registration scan result |
| `esp32/status` | ESP32 → Server | JSON | Periodic device status |

---

## 🛠️ Technology Stack

### Backend
- **Language**: Java 25
- **Framework**: Spring Boot 4.0.6
- **Database**: SQLite 3.45.1.0 with Hibernate ORM
- **Messaging**: Eclipse Paho MQTT Client 1.2.5
- **Build Tool**: Maven
- **Utilities**: Lombok, Gson, Jackson

### Frontend
- **Framework**: React 19.2.6
- **Build Tool**: Vite 8.0.12
- **Routing**: React Router DOM 7.17.0
- **HTTP Client**: Axios 1.17.0
- **Icons**: React Icons 5.6.0
- **Linting**: ESLint 10.3.0

### Hardware
- **Microcontroller**: ESP32 DevKit
- **RFID Reader**: MFRC522 (13.56 MHz)
- **Actuator**: SG90/MG996R Servo Motor
- **Indicators**: Green & Red LEDs
- **Communication**: WiFi + MQTT

---

## 📸 Screenshots

### Dashboard
*Real-time system monitoring with door status and ESP32 connectivity*

### Card Registration
*Simple form-based interface for enrolling new RFID cards*

### Registered Cards
*Comprehensive list view of all authorized personnel*

---

## 🔐 Security Considerations

> ⚠️ **Development Mode**: This project is designed for educational purposes. For production deployment, consider:

- ✅ Enable HTTPS/TLS for all communications
- ✅ Implement JWT authentication for API endpoints
- ✅ Add MQTT broker authentication
- ✅ Restrict CORS to specific domains
- ✅ Encrypt sensitive data at rest
- ✅ Implement rate limiting
- ✅ Add input validation and sanitization
- ✅ Use environment variables for secrets

---

## 🧪 Testing

### Backend Tests
```bash
./mvnw test
```

### Frontend Tests
```bash
cd rfid-frontend
npm test
```

### Hardware Testing
- Use Serial Monitor (115200 baud) for ESP32 debugging
- Test MQTT messages with Mosquitto CLI tools
- Verify RFID reader with diagnostic checks

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow existing code style and conventions
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features
- Test your changes thoroughly
- Ensure ESLint passes (frontend)
- Run Maven tests (backend)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Course**: UUST 302B THIRD YEAR - Internet of Things
- **Institution**: [Your University Name]
- **Year**: 2026
- **Project Type**: Final Course Project

---

## 🙏 Acknowledgments

- **Spring Framework** team for the excellent backend framework
- **React** community for the powerful UI library
- **Espressif** for the versatile ESP32 platform
- **Eclipse Foundation** for Paho MQTT client
- **Course instructors** and peers for guidance and support
- **Open source contributors** whose libraries made this project possible

---

## 📞 Contact & Support

- 📧 **Email**: [your.email@example.com]
- 💬 **Course Forum**: [Forum Link]
- 🐛 **Issues**: [GitHub Issues](../../issues)
- 📚 **Documentation**: See individual component READMEs

---

## 🌟 Show Your Support

If this project helped you learn about IoT systems, please give it a ⭐️ on GitHub!

---

<div align="center">

**Made with ❤️ for IoT Education**

[Report Bug](../../issues) · [Request Feature](../../issues)

</div>
