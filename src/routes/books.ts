import { Router } from 'express';
import {
  listBooksController,
  getBookQuestionsController,
  corrigirRespostasController,
  addBookController
} from '../controllers/booksController';
import { getRecommendationsController } from '../controllers/recommendationController';

const router = Router();

// Sistema de Quizzes e Gestão
router.get('/', listBooksController);
router.post('/', addBookController);
router.get('/:bookId/questions', getBookQuestionsController);
router.post('/corrigir', corrigirRespostasController);

// Novo: Algoritmo de Recomendação
router.get('/recommendations/:ra', getRecommendationsController);

export default router;