import CatalogoModel from '../models/Catalogo.js';

class CatalogoController {
  static async getTipos(req, res) {
    try {
      const tipos = await CatalogoModel.getTipos();
      return res.status(200).json({
        success: true,
        data: tipos
      });
    } catch (error) {
      console.error('Erro ao buscar tipos:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao carregar tipos de chamado'
      });
    }
  }

  static async getCategorias(req, res) {
    try {
      const categorias = await CatalogoModel.getCategorias();
      return res.status(200).json({
        success: true,
        data: categorias
      });
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao carregar categorias'
      });
    }
  }

  static async getSubcategorias(req, res) {
    try {
      const { categoria } = req.query;
      const subcategorias = await CatalogoModel.getSubcategorias(categoria);
      return res.status(200).json({
        success: true,
        data: subcategorias
      });
    } catch (error) {
      console.error('Erro ao buscar subcategorias:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao carregar subcategorias'
      });
    }
  }

  static async getPrioridades(req, res) {
    try {
      const prioridades = await CatalogoModel.getPrioridades();
      return res.status(200).json({
        success: true,
        data: prioridades
      });
    } catch (error) {
      console.error('Erro ao buscar prioridades:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao carregar prioridades'
      });
    }
  }
}

export default CatalogoController;
