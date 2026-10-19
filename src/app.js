import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import saleRoutes from './routes/saleRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.use('/sales', saleRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
