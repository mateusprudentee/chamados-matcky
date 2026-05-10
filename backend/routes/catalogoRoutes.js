import express from 'express';
import CatalogoController from '../controllers/catalogoController.js';

const router = express.Router();

// Rota GET - Tipos de chamado
router.get('/catalogo/tipos', CatalogoController.getTipos);

// Rota GET - Categorias
router.get('/catalogo/categorias', CatalogoController.getCategorias);

// Rota GET - Subcategorias (opcional: ?categoria=hardware)
router.get('/catalogo/subcategorias', CatalogoController.getSubcategorias);

// Rota GET - Prioridades
router.get('/catalogo/prioridades', CatalogoController.getPrioridades);

export default router;
