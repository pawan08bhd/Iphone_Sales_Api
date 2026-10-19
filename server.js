import 'dotenv/config';
import app from './src/app.js';
import { connectDatabase } from './src/config/db.js';

const port = Number(process.env.PORT) || 8800;

const startServer = async () => {
  try {
    await connectDatabase();
    app.listen(port, () => console.log(`Server listening on port ${port}`));
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
