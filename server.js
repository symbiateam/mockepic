const express = require('express');
const cors = require('cors');
const FhirClient = require('fhir-kit-client');

const app = express();
app.use(cors());
app.use(express.json());

const fhirClient = new FhirClient({
  baseUrl: 'https://r4.smarthealthit.org'
});

app.post('/api/observations', async (req, res) => {
  try {
    const result = await fhirClient.create({
      resourceType: 'Observation',
      body: req.body
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log('Server running on port 3001'));