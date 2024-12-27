const express = require('express');
const cors = require('cors');
const FhirClient = require('fhir-kit-client');
const session = require('express-session');

const app = express();
app.use(cors());
app.use(express.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

const fhirClient = new FhirClient({
  baseUrl: 'https://r4.smarthealthit.org',
  customHeaders: {
    'Accept': 'application/fhir+json',
    'Content-Type': 'application/fhir+json'
  }
});

// Add SMART auth configuration
const smartConfig = {
  clientId: 'your-client-id',
  redirectUri: 'your-redirect-uri',
  scope: 'launch/patient patient/*.read'
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
