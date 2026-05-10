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

// Buscar chamado por protocolo
router.get('/chamados/protocolo/:protocolo', ChamadoController.getByProtocolo);

// Atualizar chamado
router.put('/chamados/:id', ChamadoController.update);

// Atualizar status
router.patch('/chamados/:id/status', ChamadoController.updateStatus);

// Excluir chamado
router.delete('/chamados/:id', ChamadoController.delete);

// Estatísticas
router.get('/stats/chamados', ChamadoController.getStats);

export default router;
