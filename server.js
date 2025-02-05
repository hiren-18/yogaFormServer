const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const { createUserTable } = require('./src/models/User');
const env = require('./src/config/dotenv');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

const PORT = env.PORT || 5000;

app.listen(PORT, async () => {
  await createUserTable();
  console.log(`Server running on port ${PORT}`);
});
