const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let observations = [];

app.post('/api/observations', (req, res) => {
  const observation = req.body;
  observations.push(observation);
  console.log('Stored observation:', observation);
  res.json({ message: 'Observation stored', observation });
});

app.get('/api/observations', (req, res) => {
  console.log('Sending observations:', observations);
  res.json(observations);
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
  console.log('Current observations:', observations);
});