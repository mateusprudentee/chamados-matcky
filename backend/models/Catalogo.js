import { db } from '../src/database.js';

class Catalogo {
  static async getTipos() {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT value, label, icone FROM tipos_chamado WHERE ativo = 1 ORDER BY id',
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static async getCategorias() {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT value, label FROM categorias WHERE ativo = 1 ORDER BY label',
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static async getSubcategorias(categoriaValue = null) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT value, label, categoria_value FROM subcategorias WHERE ativo = 1';
      const params = [];

      if (categoriaValue) {
        query += ' AND categoria_value = ?';
        params.push(categoriaValue);
      }

      query += ' ORDER BY label';

      db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async getPrioridades() {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT value, label, icone, cor, sla, sla_resposta, sla_resolucao FROM prioridades WHERE ativo = 1 ORDER BY id',
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }
}

export default Catalogo;
