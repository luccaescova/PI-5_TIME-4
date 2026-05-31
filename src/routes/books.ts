import { Router } from 'express';
import {
  listBooksController,
  getBookQuestionsController,
  addQuestionController,
  addBookController,
  corrigirRespostasController,
  listTagsController,
  recommendBooksController,
} from '../controllers/booksController';

const router = Router();

// listar livros
router.get('/', listBooksController);

// listar tags únicas (para o seletor de recomendações)
router.get('/tags', listTagsController);

// recomendar livros a partir de tags
router.post('/recommend', recommendBooksController);

// criar livro (opcional/admin)
router.post('/', addBookController);

// listar questões de um livro
router.get('/:bookId/questions', getBookQuestionsController);

// adicionar questão a um livro
router.post('/:bookId/questions', addQuestionController);

// correção das respostas
router.post('/corrigir', corrigirRespostasController);

export default router;