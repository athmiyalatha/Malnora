const express = require('express');
const cors = require('cors');

const app = express();

const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Malnora Backend is running 🚀'
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Malnora API is working!'
  });
});

app.listen(PORT, () => {
  console.log(`Malnora backend running on port ${PORT}`);
});