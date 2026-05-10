const express = require('express');
const router = express.Router();
const ChamadoController = require('../controllers/chamadoController');

// Rota POST - Criar novo chamado
router.post('/chamados', ChamadoController.criar);

// Rota GET - Listar todos os chamados
router.get('/chamados', ChamadoController.listar);

// Rota GET - Buscar chamado específico por ID
router.get('/chamados/:id', ChamadoController.buscarPorId);

// Rota PUT - Atualizar chamado
router.put('/chamados/:id', ChamadoController.atualizar);

// Rota GET - Buscar chamados por usuário
router.get('/chamados/usuario/:email', ChamadoController.buscarPorUsuario);

module.exports = router;
