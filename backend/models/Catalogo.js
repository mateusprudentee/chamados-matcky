import { getPool } from '../src/database.js';

class CatalogoModel {

  static async getTipos() {
    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute(`
        SELECT *
        FROM tipos_chamado
        WHERE ativo = 1
        ORDER BY label ASC
      `);

      return rows;

    } finally {
      connection.release();
    }
  }

  static async getCategorias() {
    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute(`
        SELECT *
        FROM categorias
        WHERE ativo = 1
        ORDER BY label ASC
      `);

      return rows;

    } finally {
      connection.release();
    }
  }

  static async getSubcategorias(categoria) {
    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute(`
        SELECT *
        FROM subcategorias
        WHERE categoria_value = ?
        AND ativo = 1
        ORDER BY label ASC
      `, [categoria]);

      return rows;

    } finally {
      connection.release();
    }
  }

  static async getPrioridades() {
    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute(`
        SELECT *
        FROM prioridades
        WHERE ativo = 1
        ORDER BY id ASC
      `);

      return rows;

    } finally {
      connection.release();
    }
  }
}

export default CatalogoModel;
