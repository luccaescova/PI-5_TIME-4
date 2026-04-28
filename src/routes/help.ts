import { Router } from 'express';
import { askGeminiHelp } from '../controllers/helpController';

const router = Router();

router.post('/ask', askGeminiHelp);

export default router;