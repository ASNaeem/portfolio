const dotenv = require('dotenv');
// Load environment variables
dotenv.config({ override: true });

const app = require('./src/app');

const PORT = process.env.PORT || 3300;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
