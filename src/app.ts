import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth';
import booksRoutes from './routes/books';
import helpRoutes from "./routes/help";
import seedDatabase from './config/seed';


const app = express();

app.use(cors());
app.use(express.json());

// arquivos estáticos dos livros (HTML + capas) extraídos do dataset
app.use('/books-content', express.static(path.resolve(__dirname, '../public/books')));

// rotas
app.use('/auth', authRoutes);
app.use('/books', booksRoutes);
app.use("/help", helpRoutes);

app.get('/', (_, res) => 
  res.json({ ok: true, message: 'Leiturar API (TS)' })
);

// seed (não bloqueante)
seedDatabase().catch(console.error);

export default app;
