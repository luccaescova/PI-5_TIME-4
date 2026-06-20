import { Router } from 'express';
import {
  listBooksController,
  getBookQuestionsController,
  addQuestionController,
  addBookController
} from '../controllers/booksController';

const router = Router();

// listar livros
router.get('/', listBooksController);

// criar livro (opcional/admin)
router.post('/', addBookController);

// listar questões de um livro
router.get('/:bookId/questions', getBookQuestionsController);

// adicionar questão a um livro
router.post('/:bookId/questions', addQuestionController);

export default router;
