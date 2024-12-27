const express = require('express');
const cors = require('cors');
const FhirClient = require('fhir-kit-client');

const app = express();
app.use(cors());
app.use(express.json());

const fhirClient = new FhirClient({
  baseUrl: 'https://hapi.fhir.org/baseR4'
});

app.post('/api/observations', async (req, res) => {
  try {
    console.log('Creating observation:', req.body);
    const result = await fhirClient.create({
      resourceType: 'Observation',
      body: req.body
    });
    console.log('Observation created:', result);
    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const port = 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});