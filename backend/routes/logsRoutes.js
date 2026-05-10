import express from 'express';
import LogsController from '../controllers/logsController.js';
import { authenticateToken } from '../src/auth.js';

const router = express.Router();

// Rotas públicas (para registro de logs do sistema)
router.post('/api/logs', LogsController.create);

// Rotas protegidas (para visualização de logs)
router.get('/api/logs', authenticateToken, LogsController.list);
router.get('/api/logs/stats', authenticateToken, LogsController.getStats);
router.get('/api/logs/usuario/:usuarioId', authenticateToken, LogsController.getByUser);
router.get('/api/logs/:id', authenticateToken, LogsController.getById);
router.delete('/api/logs/limpar', authenticateToken, LogsController.limpar);

export default router;
