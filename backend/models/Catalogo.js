import { db } from '../src/database.js'; // Corrigido o caminho - removido /src

class Catalogo {
  static async getTipos() {
    try {
      const [rows] = await db.query(
        `SELECT value, label, icone
         FROM tipos_chamado
         WHERE ativo = 1
         ORDER BY id`
      );
      return rows;
    } catch (error) {
      console.error('Erro em getTipos:', error.message);
      throw error;
    }
  }

  static async getCategorias() {
    try {
      const [rows] = await db.query(
        `SELECT value, label
         FROM categorias
         WHERE ativo = 1
         ORDER BY label`
      );
      return rows;
    } catch (error) {
      console.error('Erro em getCategorias:', error.message);
      throw error;
    }
  }

  static async getSubcategorias(categoriaValue = null) {
    try {
      let query = `
        SELECT value, label, categoria_value
        FROM subcategorias
        WHERE ativo = 1
      `;

      const params = [];

      if (categoriaValue) {
        query += ' AND categoria_value = ?';
        params.push(categoriaValue);
      }

      query += ' ORDER BY label';

      const [rows] = await db.query(query, params);
      return rows;
    } catch (error) {
      console.error('Erro em getSubcategorias:', error.message);
      throw error;
    }
  }

  static async getPrioridades() {
    try {
      const [rows] = await db.query(
        `SELECT value, label, icone, cor, sla, sla_resposta, sla_resolucao
         FROM prioridades
         WHERE ativo = 1
         ORDER BY id`
      );
      return rows;
    } catch (error) {
      console.error('Erro em getPrioridades:', error.message);
      throw error;
    }
  }
}

export default Catalogo;
