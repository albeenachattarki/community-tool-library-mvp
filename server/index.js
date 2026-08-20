const express = require('express');
const cors = require('cors');
const toolRoutes = require('./routes/tools');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Main tools route
app.use('/api', toolRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'community-tool-library-api' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
