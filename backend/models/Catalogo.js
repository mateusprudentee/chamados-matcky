import { db } from '../src/database.js';

class Catalogo {
  static async getTipos() {
    const [rows] = await db.query(
      `SELECT value, label, icone
       FROM tipos_chamado
       WHERE ativo = 1
       ORDER BY id`
    );

    return rows;
  }

  static async getCategorias() {
    const [rows] = await db.query(
      `SELECT value, label
       FROM categorias
       WHERE ativo = 1
       ORDER BY label`
    );

    return rows;
  }

  static async getSubcategorias(categoriaValue = null) {
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
  }

  static async getPrioridades() {
    const [rows] = await db.query(
      `SELECT value, label, icone, cor, sla, sla_resposta, sla_resolucao
       FROM prioridades
       WHERE ativo = 1
       ORDER BY id`
    );

    return rows;
  }
}

export default Catalogo;
