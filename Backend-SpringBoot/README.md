# RFID Access Control System - Backend 🚪☕

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Java](https://img.shields.io/badge/Java-25-orange?logo=openjdk)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.6-brightgreen?logo=spring-boot)](https://spring.io/projects/spring-boot)
[![MQTT](https://img.shields.io/badge/Protocol-MQTT-orange?logo=mqtt)](https://mqtt.org/)

> **IoT Course Final Project** - Spring Boot backend service for RFID-based access control system with MQTT communication and SQLite persistence.

---

## 📖 Overview

This is the **backend component** of a comprehensive RFID Access Control System developed for the UUST 302B Internet of Things course. The Spring Boot application provides RESTful APIs for managing personnel identification through RFID cards, handles MQTT communication with ESP32 hardware devices, and maintains data persistence using SQLite.

### 🎯 Key Features

- ✅ **RESTful API** - Comprehensive endpoints for card management and access logs
- ✅ **MQTT Integration** - Real-time communication with IoT devices via Eclipse Paho
- ✅ **SQLite Database** - Lightweight embedded database with JPA/Hibernate ORM
- ✅ **Card Management** - Register, activate, deactivate RFID cards
- ✅ **Access Logging** - Track all access attempts with timestamps
- ✅ **Device Status Monitoring** - Query ESP32 device health and connectivity
- ✅ **CORS Configuration** - Cross-origin support for web clients
- ✅ **DTO Pattern** - Clean separation between entities and API contracts

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│              Spring Boot Backend                     │
│                  (Port 8081)                         │
│                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────────┐  │
│  │Controller│───►│ Service  │───►│ Repository   │  │
│  │  Layer   │    │  Layer   │    │   Layer      │  │
│  └──────────┘    └──────────┘    └──────┬───────┘  │
│                                         │           │
│                                  ┌──────▼───────┐  │
│                                  │   SQLite     │  │
│                                  │  Database    │  │
│                                  └──────────────┘  │
│                                                    │
│  ┌──────────────────────────────────────────┐     │
│  │       MQTT Client (Eclipse Paho)         │     │
│  └──────────────┬───────────────────────────┘     │
└─────────────────┼─────────────────────────────────┘
                  │ MQTT Pub/Sub
                  ▼
          ┌──────────────┐
          │   ESP32      │
          │  Hardware    │
          └──────────────┘
```

---

## 📦 Project Structure

```
Backend-SpringBoot/
├── src/main/java/com/rfid/rfid_control/
│   ├── RfidControlApplication.java    # Main application entry point
│   ├── config/
│   │   ├── CorsConfig.java            # CORS configuration for cross-origin requests
│   │   └── MqttConfig.java            # MQTT broker connection settings
│   ├── controller/
│   │   └── AccessController.java      # REST API endpoints
│   ├── service/
│   │   ├── AccessService.java         # Business logic for card/access management
│   │   └── MqttService.java           # MQTT message publishing/subscribing
│   ├── repository/
│   │   ├── CardRepository.java        # JPA repository for Card entity
│   │   └── AccessLogRepository.java   # JPA repository for AccessLog entity
│   ├── model/
│   │   ├── Card.java                  # Card entity (JPA)
│   │   ├── AccessLog.java             # Access log entity (JPA)
│   │   └── dto/
│   │       ├── RegisterRequest.java   # DTO for registration requests
│   │       └── RegisterResponse.java  # DTO for registration responses
│   └── resources/
│       ├── application.yaml           # Application configuration
│       ├── static/index.html          # Static HTML fallback
│       └── templates/index.html       # Thymeleaf template (optional)
├── pom.xml                            # Maven dependencies
└── README.md                          # This file
```

---

## 🚀 Quick Start

### Prerequisites

- ☕ **Java 25+** ([Download](https://www.oracle.com/java/technologies/downloads/))
- 🛠️ **Maven 3.6+** (or use included `mvnw` wrapper)
- 📡 **MQTT Broker** (Mosquitto recommended)
- 💻 **IDE** (IntelliJ IDEA, Eclipse, or VS Code with Java extensions)

### Installation & Setup

#### Step 1: Clone Repository

```bash
git clone <repository-url>
cd Smart-Access-Control-System/Backend-SpringBoot
```

#### Step 2: Configure MQTT Broker

Edit [`src/main/resources/application.yaml`](src/main/resources/application.yaml):

```yaml
mqtt:
  broker-url: tcp://localhost:1883  # Change to your MQTT broker address
  client-id: rfid-backend
  topics:
    check: access/check
    response: access/response
    mode-set: access/mode/set
    scan-result: access/scan_result
    status: esp32/status
```

> 💡 **Tip**: Install Mosquitto locally for development:
> ```bash
> # Ubuntu/Debian
> sudo apt-get install mosquitto mosquitto-clients
> sudo systemctl start mosquitto
> 
> # macOS
> brew install mosquitto
> brew services start mosquitto
> 
> # Windows
> # Download installer from https://mosquitto.org/download/
> ```

#### Step 3: Build and Run

```bash
# Using Maven wrapper (recommended)
./mvnw clean package
./mvnw spring-boot:run

# Or using system Maven
mvn clean package
mvn spring-boot:run

# Backend will start at http://localhost:8081
```

#### Step 4: Verify Installation

```bash
# Health check endpoint
curl http://localhost:8081/api/health

# Expected response: {"status":"UP","timestamp":"2026-06-18T..."}
```

---

## 📚 API Documentation

### Base URL: `http://localhost:8081/api`

All endpoints return JSON responses. No authentication is required in development mode.

#### 🔍 Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "status": "UP",
  "timestamp": "2026-06-18T10:30:00"
}
```

---

#### 📝 Register New Card

```http
POST /api/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "cardId": "A1B2C3D4",
  "personName": "John Doe",
  "email": "john@example.com",
  "department": "Engineering"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Card registered successfully",
  "cardId": "A1B2C3D4",
  "personName": "John Doe"
}
```

**Error Response (409 Conflict):**
```json
{
  "success": false,
  "message": "Card ID already exists"
}
```

---

#### 📋 Get All Registered Cards

```http
GET /api/cards
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "cardId": "A1B2C3D4",
    "personName": "John Doe",
    "email": "john@example.com",
    "department": "Engineering",
    "isActive": true,
    "registeredAt": "2026-06-18T10:30:00"
  },
  {
    "id": 2,
    "cardId": "E5F6G7H8",
    "personName": "Jane Smith",
    "email": "jane@example.com",
    "department": "Marketing",
    "isActive": true,
    "registeredAt": "2026-06-17T14:20:00"
  }
]
```

---

#### ❌ Deactivate Card

```http
DELETE /api/cards/{id}
```

**Parameters:**
- `id` (path parameter): Card database ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Card deactivated successfully"
}
```

---

#### 📊 Get Access Logs

```http
GET /api/logs
```

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "cardId": "A1B2C3D4",
    "personName": "John Doe",
    "accessTime": "2026-06-18T10:45:00",
    "granted": true,
    "doorStatus": "OPEN"
  },
  {
    "id": 2,
    "cardId": "INVALID123",
    "personName": "Unknown",
    "accessTime": "2026-06-18T10:46:00",
    "granted": false,
    "doorStatus": "CLOSED"
  }
]
```

---

#### 📡 Get ESP32 Device Status

```http
GET /api/esp32/status
```

**Response (200 OK):**
```json
{
  "deviceId": "esp32-001",
  "connected": true,
  "lastSeen": "2026-06-18T10:50:00",
  "firmwareVersion": "1.0.0",
  "wifiSignalStrength": -45,
  "mode": "NORMAL"
}
```

---

#### 🚪 Get Door Status

```http
GET /api/door/status
```

**Response (200 OK):**
```json
{
  "doorState": "CLOSED",
  "lastActivity": "2026-06-18T10:45:00",
  "autoCloseTimeout": 5
}
```

---

## 📨 MQTT Integration

### Configuration

The backend connects to an MQTT broker and subscribes/publishes to specific topics for real-time communication with ESP32 devices.

**Configuration File:** [`src/main/resources/application.yaml`](src/main/resources/application.yaml)

```yaml
mqtt:
  broker-url: tcp://localhost:1883
  client-id: rfid-backend
  qos: 0
  topics:
    check: access/check
    response: access/response
    mode-set: access/mode/set
    scan-result: access/scan_result
    status: esp32/status
```

### MQTT Topics

| Topic | Direction | Payload Format | Description |
|-------|-----------|----------------|-------------|
| `access/check` | Subscribe (from ESP32) | Plain text UID | Card verification request |
| `access/response` | Publish (to ESP32) | `"ALLOWED"` or `"DENIED"` | Access decision |
| `access/mode/set` | Publish (to ESP32) | JSON object | Change device operation mode |
| `access/scan_result` | Subscribe (from ESP32) | JSON object | Registration scan result |
| `esp32/status` | Subscribe (from ESP32) | JSON object | Periodic device heartbeat |

### Message Flow Example

**1. Card Verification Request:**
```
ESP32 publishes → access/check: "A1B2C3D4"
Backend receives → Queries database → Checks if card is active
Backend publishes → access/response: "ALLOWED"
ESP32 receives → Unlocks door
```

**2. Device Status Update:**
```
ESP32 publishes → esp32/status: {"deviceId":"esp32-001","connected":true,"signal":-45}
Backend receives → Updates internal device status cache
Client queries → GET /api/esp32/status → Returns cached status
```

---

## 🗄️ Database Schema

### Entity: Card

Represents a registered RFID card associated with a person.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Long | PK, Auto-increment | Database identifier |
| `cardId` | String | Unique, Not Null | RFID card UID |
| `personName` | String | Not Null | Cardholder's name |
| `email` | String | Nullable | Contact email |
| `department` | String | Nullable | Organizational unit |
| `isActive` | Boolean | Default: true | Activation status |
| `registeredAt` | LocalDateTime | Auto-generated | Registration timestamp |

### Entity: AccessLog

Records each access attempt for auditing purposes.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | Long | PK, Auto-increment | Log entry identifier |
| `cardId` | String | Not Null | Scanned card UID |
| `personName` | String | Nullable | Resolved person name |
| `accessTime` | LocalDateTime | Auto-generated | Attempt timestamp |
| `granted` | Boolean | Not Null | Access decision |
| `doorStatus` | String | Not Null | Resulting door state |

---

## 🛠️ Technology Stack

### Core Technologies

- **Language**: Java 25
- **Framework**: Spring Boot 4.0.6
- **Build Tool**: Apache Maven
- **Database**: SQLite 3.45.1.0

### Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| Spring Boot Starter Web | 4.0.6 | REST API framework |
| Spring Data JPA | 4.0.6 | ORM and repository pattern |
| Hibernate ORM | 6.x | JPA implementation |
| SQLite JDBC Driver | 3.45.1.0 | Embedded database connectivity |
| Eclipse Paho MQTT Client | 1.2.5 | MQTT protocol implementation |
| Lombok | Latest | Boilerplate code reduction |
| Gson | Latest | JSON serialization/deserialization |
| Jackson | Latest | JSON processing |
| Spring Boot Starter Thymeleaf | 4.0.6 | Template engine (optional) |

### Development Tools

- **Testing**: JUnit 5, Spring Boot Test
- **Code Quality**: Spring Boot DevTools (hot reload)
- **Logging**: SLF4J with Logback

---

## 🔧 Configuration

### Application Properties

Located in [`src/main/resources/application.yaml`](src/main/resources/application.yaml):

```yaml
server:
  port: 8081

spring:
  datasource:
    url: jdbc:sqlite:rfid_access.db
    driver-class-name: org.sqlite.JDBC
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.community.dialect.SQLiteDialect

mqtt:
  broker-url: tcp://localhost:1883
  client-id: rfid-backend
  qos: 0
  topics:
    check: access/check
    response: access/response
    mode-set: access/mode/set
    scan-result: access/scan_result
    status: esp32/status
```

### Environment Variables

For production deployment, use environment variables:

```bash
export MQTT_BROKER_URL=tcp://mqtt.example.com:1883
export DATABASE_PATH=/var/data/rfid_access.db
export SERVER_PORT=8081
```

---

## 🧪 Testing

### Run All Tests

```bash
./mvnw test
```

### Run Specific Test Class

```bash
./mvnw test -Dtest=AccessControllerTest
```

### Test Coverage Report

```bash
./mvnw jacoco:report
# Open target/site/jacoco/index.html in browser
```

### Manual API Testing

Using cURL:

```bash
# Register a card
curl -X POST http://localhost:8081/api/register \
  -H "Content-Type: application/json" \
  -d '{"cardId":"TEST123","personName":"Test User","email":"test@example.com","department":"QA"}'

# Get all cards
curl http://localhost:8081/api/cards

# Get access logs
curl http://localhost:8081/api/logs?limit=10

# Check health
curl http://localhost:8081/api/health
```

Using Postman/Insomnia:
- Import collection from `postman_collection.json` (if available)
- Set base URL to `http://localhost:8081/api`
- Use JSON body format for POST requests

---

## 📊 Monitoring & Logging

### Application Logs

Logs are output to console by default. Configure file logging in `application.yaml`:

```yaml
logging:
  file:
    name: logs/rfid-backend.log
  level:
    com.rfid.rfid_control: DEBUG
    org.springframework.web: INFO
    org.eclipse.paho: WARN
```

### Key Log Events

- **MQTT Connection**: Broker connection status
- **Card Registration**: New card creation events
- **Access Decisions**: ALLOWED/DENIED decisions with card IDs
- **Database Operations**: SQL query execution (when `show-sql: true`)
- **Errors**: Exception stack traces and error details

### Health Monitoring

Monitor backend health via `/api/health` endpoint. For production, consider integrating with:
- Spring Boot Actuator
- Prometheus + Grafana
- ELK Stack (Elasticsearch, Logstash, Kibana)

---

## 🔐 Security Considerations

> ⚠️ **Development Mode Warning**: This backend is designed for educational purposes. Production deployment requires additional security measures:

### Current State
- ❌ No authentication/authorization
- ❌ No HTTPS/TLS encryption
- ❌ No input validation beyond basic constraints
- ❌ No rate limiting
- ❌ Hardcoded MQTT credentials (if any)

### Recommended Improvements

1. **Authentication & Authorization**
   - Implement JWT token-based authentication
   - Add role-based access control (RBAC)
   - Secure admin endpoints

2. **Transport Security**
   - Enable HTTPS with SSL certificates
   - Use WSS for WebSocket connections
   - Encrypt MQTT traffic with TLS

3. **Data Protection**
   - Encrypt sensitive data at rest (AES-256)
   - Hash passwords if user accounts are added
   - Sanitize all inputs to prevent injection attacks

4. **API Security**
   - Add API key authentication
   - Implement rate limiting (e.g., 100 requests/minute)
   - Enable CORS only for trusted domains
   - Add request size limits

5. **MQTT Security**
   - Enable broker authentication (username/password)
   - Use client certificates for mutual TLS
   - Restrict topic permissions per client

6. **Operational Security**
   - Use environment variables for secrets
   - Rotate API keys and credentials regularly
   - Implement audit logging
   - Set up intrusion detection

---

## 🐛 Troubleshooting

### Common Issues

#### 1. MQTT Connection Failed

**Error:** `Unable to connect to MQTT broker`

**Solutions:**
- Verify MQTT broker is running: `sudo systemctl status mosquitto`
- Check broker URL in `application.yaml`
- Ensure firewall allows port 1883
- Test connection: `mosquitto_sub -t test/topic -h localhost`

#### 2. Database Lock Issues

**Error:** `database is locked`

**Solutions:**
- Close other applications accessing the database
- Check file permissions on `.db` file
- Use connection pooling for high concurrency
- Consider migrating to PostgreSQL/MySQL for production

#### 3. Port Already in Use

**Error:** `Port 8081 is already in use`

**Solutions:**
- Kill existing process: `lsof -ti:8081 | xargs kill`
- Change port in `application.yaml`: `server.port: 8082`

#### 4. Card Not Found in Database

**Issue:** Valid card returns "DENIED"

**Solutions:**
- Verify card is registered: `GET /api/cards`
- Check `isActive` field is `true`
- Confirm card ID matches exactly (case-sensitive)
- Review access logs: `GET /api/logs`

#### 5. CORS Errors in Browser

**Error:** `Access to fetch has been blocked by CORS policy`

**Solutions:**
- Verify frontend origin is allowed in [`CorsConfig.java`](src/main/java/com/rfid/rfid_control/config/CorsConfig.java)
- Check browser console for detailed error
- Temporarily disable CORS for debugging (not recommended for production)

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Implement** changes following coding standards
4. **Write** unit tests for new functionality
5. **Run** tests: `./mvnw test`
6. **Commit** with meaningful messages (`git commit -m 'Add amazing feature'`)
7. **Push** to branch (`git push origin feature/amazing-feature`)
8. **Open** a Pull Request

### Coding Standards

- Follow [Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)
- Use descriptive variable and method names
- Add Javadoc comments for public methods
- Keep methods small and focused (single responsibility)
- Use Lombok annotations to reduce boilerplate
- Write unit tests for service layer logic
- Validate all input parameters

### Commit Message Convention

```
type(scope): description

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Example:**
```
feat(api): add pagination support for access logs

- Added limit and offset query parameters
- Updated AccessController to handle pagination
- Added unit tests for paginated queries

Closes #42
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Course**: UUST 302B THIRD YEAR - Internet of Things
- **Institution**: [Your University Name]
- **Year**: 2026
- **Component**: Backend Service (Spring Boot)

---

## 🙏 Acknowledgments

- **Spring Framework** team for the excellent backend framework
- **Eclipse Foundation** for Paho MQTT client library
- **SQLite** community for lightweight database solution
- **Hibernate** team for robust ORM implementation
- **Course instructors** and peers for guidance and support
- **Open source contributors** whose libraries made this project possible

---

## 📞 Support & Resources

- 📧 **Email**: [your.email@example.com]
- 💬 **Course Forum**: [Forum Link]
- 🐛 **Issues**: [GitHub Issues](../../issues)
- 📚 **Full Project Docs**: [Main README](../README.md)
- 📖 **Spring Boot Docs**: [spring.io](https://spring.io/projects/spring-boot)
- 📘 **MQTT Guide**: [mqtt.org](https://mqtt.org/getting-started/)

---

## 🌟 Show Your Support

If this backend helped you learn about Spring Boot and IoT integration, please give it a ⭐️ on GitHub!

---

<div align="center">

**Built with ☕ Spring Boot for IoT Education**

[Report Bug](../../issues) · [Request Feature](../../issues)

</div>
