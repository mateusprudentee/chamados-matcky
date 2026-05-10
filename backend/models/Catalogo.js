import { getPool } from '../src/database.js';

class CatalogoModel {

  static async getTipos() {
    let connection;

    try {
      const pool = await getPool();
      connection = await pool.getConnection();

      const [rows] = await connection.execute(
        'SELECT * FROM tipos_chamado ORDER BY nome ASC'
      );

      return rows;

    } finally {
      if (connection) connection.release();
    }
  }

  static async getCategorias() {
    let connection;

    try {
      const pool = await getPool();
      connection = await pool.getConnection();

      const [rows] = await connection.execute(
        'SELECT * FROM categorias ORDER BY nome ASC'
      );

      return rows;

    } finally {
      if (connection) connection.release();
    }
  }

  static async getSubcategorias(categoria) {
    let connection;

    try {
      const pool = await getPool();
      connection = await pool.getConnection();

      const [rows] = await connection.execute(
        'SELECT * FROM subcategorias WHERE categoria = ? ORDER BY nome ASC',
        [categoria]
      );

      return rows;

    } finally {
      if (connection) connection.release();
    }
  }

  static async getPrioridades() {
    return [
      { valor: 'baixa', label: 'Baixa' },
      { valor: 'media', label: 'Média' },
      { valor: 'alta', label: 'Alta' },
      { valor: 'critica', label: 'Crítica' }
    ];
  }
}

export default CatalogoModel;
