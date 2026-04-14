import { Router } from 'express';
import { 
  loginController,
  registerController,
  forgotPassword,
  resetPassword
} from '../controllers/authController';

const router = Router();

router.post('/register', registerController);
router.post('/login', loginController);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
