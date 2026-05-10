import { getPool } from '../src/database.js';

class Chamado {
  static async create(chamadoData) {
    let connection;
    try {
      const pool = await getPool();
      connection = await pool.getConnection();

      const {
        tipo,
        icone_tipo,
        categoria,
        subcategoria,
        prioridade,
        titulo,
        descricao,
        nome_usuario,
        email_usuario,
        departamento_usuario,
        sla_resposta,
        sla_resolucao
      } = chamadoData;

      const protocolo = `CHAMADO-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const [result] = await connection.execute(
        `INSERT INTO chamados (
          protocolo, tipo, icone_tipo, categoria, subcategoria,
          prioridade, titulo, descricao, nome_usuario, email_usuario,
          departamento_usuario, sla_resposta, sla_resolucao,
          status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'aberto', NOW(), NOW())`,
        [
          protocolo, tipo, icone_tipo, categoria, subcategoria,
          prioridade, titulo, descricao, nome_usuario, email_usuario,
          departamento_usuario, sla_resposta, sla_resolucao
        ]
      );

      const [newChamado] = await connection.execute(
        'SELECT * FROM chamados WHERE id = ?',
        [result.insertId]
      );

      return {
        success: true,
        chamado: newChamado[0],
        protocolo
      };
    } catch (error) {
      console.error('Erro em Chamado.create:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  static async findAll(filters = {}) {
    let connection;
    try {
      const pool = await getPool();
      connection = await pool.getConnection();

      let query = 'SELECT * FROM chamados WHERE 1=1';
      const params = [];

      if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
      }

      if (filters.email_usuario) {
        query += ' AND email_usuario = ?';
        params.push(filters.email_usuario);
      }

      if (filters.prioridade) {
        query += ' AND prioridade = ?';
        params.push(filters.prioridade);
      }

      query += ' ORDER BY created_at DESC';

      const [rows] = await connection.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Erro em Chamado.findAll:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  static async findById(id) {
    let connection;
    try {
      const pool = await getPool();
      connection = await pool.getConnection();

      const [rows] = await connection.execute(
        'SELECT * FROM chamados WHERE id = ?',
        [id]
      );

      return rows[0] || null;
    } catch (error) {
      console.error('Erro em Chamado.findById:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  static async findByProtocolo(protocolo) {
    let connection;
    try {
      const pool = await getPool();
      connection = await pool.getConnection();

      const [rows] = await connection.execute(
        'SELECT * FROM chamados WHERE protocolo = ?',
        [protocolo]
      );

      return rows[0] || null;
    } catch (error) {
      console.error('Erro em Chamado.findByProtocolo:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  static async findByUserEmail(email) {
    let connection;
    try {
      const pool = await getPool();
      connection = await pool.getConnection();

      const [rows] = await connection.execute(
        'SELECT * FROM chamados WHERE email_usuario = ? ORDER BY created_at DESC',
        [email]
      );

      return rows;
    } catch (error) {
      console.error('Erro em Chamado.findByUserEmail:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  static async update(id, updateData) {
    let connection;
    try {
      const pool = await getPool();
      connection = await pool.getConnection();

      const allowedFields = ['status', 'prioridade', 'descricao', 'atribuido_para'];
      const updates = [];
      const params = [];

      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          updates.push(`${field} = ?`);
          params.push(updateData[field]);
        }
      }

      if (updates.length === 0) {
        return null;
      }

      updates.push('updated_at = NOW()');
      params.push(id);

      const [result] = await connection.execute(
        `UPDATE chamados SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      if (result.affectedRows === 0) {
        return null;
      }

      return await this.findById(id);
    } catch (error) {
      console.error('Erro em Chamado.update:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  static async updateStatus(id, status) {
    let connection;
    try {
      const pool = await getPool();
      connection = await pool.getConnection();

      const [result] = await connection.execute(
        'UPDATE chamados SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro em Chamado.updateStatus:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  static async delete(id) {
    let connection;
    try {
      const pool = await getPool();
      connection = await pool.getConnection();

      const [result] = await connection.execute(
        'DELETE FROM chamados WHERE id = ?',
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro em Chamado.delete:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  static async getStats() {
    let connection;
    try {
      const pool = await getPool();
      connection = await pool.getConnection();

      const [total] = await connection.execute('SELECT COUNT(*) as total FROM chamados');
      const [abertos] = await connection.execute("SELECT COUNT(*) as abertos FROM chamados WHERE status = 'aberto'");
      const [emAndamento] = await connection.execute("SELECT COUNT(*) as em_andamento FROM chamados WHERE status = 'em_andamento'");
      const [concluidos] = await connection.execute("SELECT COUNT(*) as concluidos FROM chamados WHERE status = 'concluido'");
      const [porPrioridade] = await connection.execute(
        'SELECT prioridade, COUNT(*) as total FROM chamados GROUP BY prioridade'
      );

      return {
        total: total[0].total,
        abertos: abertos[0].abertos,
        em_andamento: emAndamento[0].em_andamento,
        concluidos: concluidos[0].concluidos,
        por_prioridade: porPrioridade
      };
    } catch (error) {
      console.error('Erro em Chamado.getStats:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }
}

export default Chamado;
