import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import booksRoutes from './routes/books'; // Já inclui recomendações
import helpRoutes from "./routes/help";
import seedDatabase from './config/seed';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/books', booksRoutes);
app.use("/help", helpRoutes);

seedDatabase().catch(console.error);

export default app;