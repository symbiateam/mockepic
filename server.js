const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let vitals = [];
let chemistry = {};

app.post('/api/vitals', (req, res) => {
  const vital = req.body;
  vitals.push(vital);
  res.json(vital);
});

app.get('/api/vitals', (req, res) => {
  res.json(vitals);
});

app.post('/api/chemistry', (req, res) => {
  chemistry = { ...chemistry, ...req.body };
  res.json(chemistry);
});

app.get('/api/chemistry', (req, res) => {
  res.json(chemistry);
});

app.listen(3001, () => console.log('Server running on port 3001'));