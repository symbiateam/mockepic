const express = require('express');
const cors = require('cors');
const FhirClient = require('fhir-kit-client');
const session = require('express-session');

const app = express();

// Replace window.location.origin with your deployed URL
const BASE_URL = process.env.BASE_URL || 'https://mockepic.onrender.com';

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

const fhirClient = new FhirClient({
  baseUrl: 'https://launch.smarthealthit.org/v/r4/sim/eyJrIjoiMSIsImIiOiJmMDQ2MjkzNi1lYjRiLTRkYTEtYjQ1YS1mYmQ5NmViZjhjY2IiLCJlIjoic21hcnQtUHJhY3RpdGlvbmVyLTcxNjE0NTAyIn0/fhir',
  customHeaders: {
    'Accept': 'application/fhir+json',
    'Content-Type': 'application/fhir+json'
  }
});

const smartConfig = {
  clientId: 'whatever',
  redirectUri: `${BASE_URL}/oauth-callback`,
  scope: 'launch/patient patient/*.read patient/*.write'
};

app.get('/auth', (req, res) => {
  // Initialize SMART auth
  res.redirect(fhirClient.authorize(smartConfig));
});

app.post('/fhir/Observation', async (req, res) => {
  try {
    if (!req.session.accessToken) {
      throw new Error('Not authenticated');
    }
    
    const result = await fhirClient.create({
      resourceType: 'Observation',
      body: req.body,
      headers: {
        'Authorization': `Bearer ${req.session.accessToken}`
      }
    });
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log('Server running on port 3001'));