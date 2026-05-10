import express from 'express';
import CatalogoController from '../controllers/CatalogoController.js';

const router = express.Router();

router.get('/tipos', CatalogoController.getTipos);
router.get('/categorias', CatalogoController.getCategorias);
router.get('/subcategorias', CatalogoController.getSubcategorias);
router.get('/prioridades', CatalogoController.getPrioridades);
router.get('/test-database', CatalogoController.testDatabase);

export default router;
