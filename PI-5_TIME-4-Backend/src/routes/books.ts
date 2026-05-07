import { Router } from 'express';
import {
  listBooksController,
  getBookQuestionsController,
  addQuestionController,
  addBookController,
  corrigirRespostasController,
  recommendBooksController,
} from '../controllers/booksController';

const router = Router();

// listar livros
router.get('/', listBooksController);

// criar livro (opcional/admin)
router.post('/', addBookController);

// corrigir respostas
router.post('/corrigir', corrigirRespostasController);

// recomendação de livros por tags (delega ao serviço Python)
router.post('/recommend', recommendBooksController);

// listar questões de um livro
router.get('/:bookId/questions', getBookQuestionsController);

// adicionar questão a um livro
router.post('/:bookId/questions', addQuestionController);

export default router;