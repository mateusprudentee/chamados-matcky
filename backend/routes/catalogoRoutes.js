import express from 'express';
import CatalogoController from '../controllers/catalogoController.js';

const router = express.Router();

// Rotas existentes
router.get('/catalogo/tipos', CatalogoController.getTipos);
router.get('/catalogo/categorias', CatalogoController.getCategorias);
router.get('/catalogo/subcategorias', CatalogoController.getSubcategorias);
router.get('/catalogo/prioridades', CatalogoController.getPrioridades);

// ROTA DE TESTE - Adicione isso
router.get('/catalogo/test-db', CatalogoController.testDatabase);

export default router;
