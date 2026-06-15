const express = require('express');
const cors = require('cors');
const app = express();

// CORS Configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  maxAge: 86400 // 24 hours
};

// Security headers middleware
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

// Middleware
app.use(cors(corsOptions));
app.use(securityHeaders);
app.use(express.json());

// Rate limiting (basic example)
const requestCounts = new Map();
app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100; // 100 requests per minute

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }

  const timestamps = requestCounts.get(ip);
  const recentTimestamps = timestamps.filter(timestamp => now - timestamp < windowMs);
  
  if (recentTimestamps.length >= maxRequests) {
    return res.status(429).json({ 
      message: 'Too many requests, please try again later.' 
    });
  }

  recentTimestamps.push(now);
  requestCounts.set(ip, recentTimestamps);
  next();
});

// Mock database
const registeredPeople = [
  {
    id: 1,
    userName: "John Doe",
    age: 22,
    uid: "AB1234"
  },
  {
    id: 2,
    userName: "Alice Smith",
    age: 20,
    uid: "XY5678"
  },
  {
    id: 3,
    userName: "Robert Brown",
    age: 25,
    uid: "CD9876"
  },
  {
    id: 4,
    userName: "Emma Wilson",
    age: 28,
    uid: "EF4321"
  },
  {
    id: 5,
    userName: "Michael Johnson",
    age: 30,
    uid: "GH8765"
  }
];

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    message: 'Backend server is running',
    timestamp: new Date().toISOString()
  });
});

// Get all registered people
app.get('/api/people', (req, res) => {
  res.status(200).json(registeredPeople);
});

// Add new person (for future use)
app.post('/api/people', (req, res) => {
  const newPerson = {
    id: registeredPeople.length + 1,
    ...req.body
  };
  registeredPeople.push(newPerson);
  res.status(201).json(newPerson);
});

// Get person by ID
app.get('/api/people/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const person = registeredPeople.find(p => p.id === id);
  
  if (person) {
    res.status(200).json(person);
  } else {
    res.status(404).json({ message: 'Person not found' });
  }
});

// ESP32 simulation data
let esp32AccessData = {
  status: "waiting", // waiting, access_allowed, access_denied
  userName: "",
  uid: "",
  timestamp: null,
  message: "Waiting for card scan..."
};

// ESP32 status endpoint
app.get('/api/esp32/status', (req, res) => {
  res.status(200).json(esp32AccessData);
});

// ESP32 access event simulation endpoint
app.post('/api/esp32/access', (req, res) => {
  const { status, userName, uid } = req.body;
  
  if (!status || (status !== 'access_allowed' && status !== 'access_denied')) {
    return res.status(400).json({ 
      message: 'Invalid status. Must be access_allowed or access_denied' 
    });
  }

  // Update ESP32 access data
  esp32AccessData = {
    status,
    userName: userName || "",
    uid: uid || "",
    timestamp: new Date().toISOString(),
    message: status === 'access_allowed' 
      ? `Access granted for ${userName || 'Unknown User'}`
      : `Access denied for ${userName || 'Unknown User'}`
  };

  console.log(`ESP32 Access Event: ${esp32AccessData.message}`);
  res.status(200).json(esp32AccessData);
});

// Reset ESP32 to waiting state
app.post('/api/esp32/reset', (req, res) => {
  esp32AccessData = {
    status: "waiting",
    userName: "",
    uid: "",
    timestamp: new Date().toISOString(),
    message: "Waiting for card scan..."
  };
  
  res.status(200).json(esp32AccessData);
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`People endpoint: http://localhost:${PORT}/api/people`);
});