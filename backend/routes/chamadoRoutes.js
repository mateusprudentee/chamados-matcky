import express from 'express';
import ChamadoController from '../controllers/chamadoController.js';

const router = express.Router();

// Criar chamado
router.post('/chamados', ChamadoController.create);

// Listar chamados
router.get('/chamados', ChamadoController.list);

// Buscar chamados por usuário
router.get('/chamados/usuario/:email', ChamadoController.getByUser);

// Buscar chamado por ID
router.get('/chamados/:id', ChamadoController.getById);

// Atualizar chamado
router.put('/chamados/:id', ChamadoController.update);

export default router;
