import express from 'express';
import AuthController from '../controllers/AuthController.js';
import { authenticateToken } from '../src/auth.js';

const router = express.Router();

router.post('/api/auth/register', AuthController.register);
router.post('/api/auth/login',    AuthController.login);
router.get( '/api/auth/me',       authenticateToken, AuthController.getMe);
router.post('/api/formulario',    authenticateToken, AuthController.formulario);
router.get('/validate-token', authenticateToken, AuthController.validateToken);

// Novas rotas para verificação de email
router.get('/verify-email', authenticateToken, AuthController.verifyEmail);
router.post('/resend-verification', AuthController.resendVerificationEmail);
export default router;
