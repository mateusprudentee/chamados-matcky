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
      console.error('Erro detalhado ao buscar tipos:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlMessage: error.sqlMessage
      });
      return res.status(500).json({
        success: false,
        message: 'Erro ao carregar tipos de chamado',
        error: error.message
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
      console.error('Erro detalhado ao buscar categorias:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlMessage: error.sqlMessage
      });
      return res.status(500).json({
        success: false,
        message: 'Erro ao carregar categorias',
        error: error.message
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
      console.error('Erro detalhado ao buscar subcategorias:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlMessage: error.sqlMessage
      });
      return res.status(500).json({
        success: false,
        message: 'Erro ao carregar subcategorias',
        error: error.message
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
      console.error('Erro detalhado ao buscar prioridades:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlMessage: error.sqlMessage
      });
      return res.status(500).json({
        success: false,
        message: 'Erro ao carregar prioridades',
        error: error.message
      });
    }
  }

  static async testDatabase(req, res) {
    try {
      const [result] = await db.query('SELECT 1 as connected, NOW() as time, DATABASE() as db_name');
      const [tables] = await db.query('SHOW TABLES');
      const [categoriasTable] = await db.query("SHOW TABLES LIKE 'categorias'");

      let categoriasStructure = null;
      if (categoriasTable.length > 0) {
        [categoriasStructure] = await db.query('DESCRIBE categorias');
      }

      return res.status(200).json({
        success: true,
        connection: result[0],
        all_tables: tables,
        categorias_table_exists: categoriasTable.length > 0,
        categorias_structure: categoriasStructure
      });
    } catch (error) {
      console.error('Erro no diagnóstico:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
        code: error.code,
        sqlMessage: error.sqlMessage
      });
    }
  }
}

export default CatalogoController;
