import pool from '../src/database.js';

class Chamado {

  // Criar novo chamado
  static async create(chamadoData) {
    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute(
        `INSERT INTO chamados (
          tipo,
          icone_tipo,
          categoria,
          subcategoria,
          titulo,
          prioridade,
          descricao,
          anexos,
          status,
          id_usuario,
          nome_usuario,
          email_usuario,
          departamento_usuario,
          sla_resposta,
          sla_resolucao
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          chamadoData.tipo,
          chamadoData.icone_tipo,
          chamadoData.categoria,
          chamadoData.subcategoria,
          chamadoData.titulo,
          chamadoData.prioridade,
          chamadoData.descricao,
          JSON.stringify(chamadoData.anexos || []),
          chamadoData.status || 'aberto',
          chamadoData.id_usuario || null,
          chamadoData.nome_usuario,
          chamadoData.email_usuario,
          chamadoData.departamento_usuario || null,
          chamadoData.sla_resposta,
          chamadoData.sla_resolucao
        ]
      );

      // Retorna o chamado criado
      const [chamado] = await connection.execute(
        'SELECT * FROM chamados WHERE id = ?',
        [result.insertId]
      );

      return chamado[0];

    } catch (error) {
      console.error('❌ Erro em Chamado.create:', error);
      throw error;

    } finally {
      connection.release();
    }
  }

  // Buscar todos os chamados
  static async findAll(filtros = {}) {
    const connection = await pool.getConnection();

    try {
      let query = 'SELECT * FROM chamados WHERE 1=1';
      const params = [];

      if (filtros.status) {
        query += ' AND status = ?';
        params.push(filtros.status);
      }

      if (filtros.tipo) {
        query += ' AND tipo = ?';
        params.push(filtros.tipo);
      }

      if (filtros.prioridade) {
        query += ' AND prioridade = ?';
        params.push(filtros.prioridade);
      }

      if (filtros.email_usuario) {
        query += ' AND email_usuario = ?';
        params.push(filtros.email_usuario);
      }

      query += ' ORDER BY id DESC';

      const [chamados] = await connection.execute(query, params);

      return chamados;

    } catch (error) {
      console.error('❌ Erro em Chamado.findAll:', error);
      throw error;

    } finally {
      connection.release();
    }
  }

  // Buscar chamado por ID
  static async findById(id) {
    const connection = await pool.getConnection();

    try {
      const [chamados] = await connection.execute(
        'SELECT * FROM chamados WHERE id = ?',
        [id]
      );

      return chamados[0] || null;

    } catch (error) {
      console.error('❌ Erro em Chamado.findById:', error);
      throw error;

    } finally {
      connection.release();
    }
  }

  // Buscar chamado por protocolo
  static async findByProtocolo(protocolo) {
    const connection = await pool.getConnection();

    try {
      const [chamados] = await connection.execute(
        'SELECT * FROM chamados WHERE protocolo = ?',
        [protocolo]
      );

      return chamados[0] || null;

    } catch (error) {
      console.error('❌ Erro em Chamado.findByProtocolo:', error);
      throw error;

    } finally {
      connection.release();
    }
  }

  // Buscar chamados por e-mail do usuário
  static async findByUserEmail(email) {
    const connection = await pool.getConnection();

    try {
      const [chamados] = await connection.execute(
        'SELECT * FROM chamados WHERE email_usuario = ? ORDER BY id DESC',
        [email]
      );

      return chamados;

    } catch (error) {
      console.error('❌ Erro em Chamado.findByUserEmail:', error);
      throw error;

    } finally {
      connection.release();
    }
  }

  // Atualizar chamado
  static async update(id, dados) {
    const connection = await pool.getConnection();

    try {
      const campos = [];
      const valores = [];

      if (dados.status !== undefined) {
        campos.push('status = ?');
        valores.push(dados.status);
      }

      if (dados.descricao !== undefined) {
        campos.push('descricao = ?');
        valores.push(dados.descricao);
      }

      if (dados.prioridade !== undefined) {
        campos.push('prioridade = ?');
        valores.push(dados.prioridade);
      }

      if (dados.data_resolucao !== undefined) {
        campos.push('data_resolucao = ?');
        valores.push(dados.data_resolucao);
      }

      if (campos.length === 0) {
        return null;
      }

      valores.push(id);

      const [result] = await connection.execute(
        `UPDATE chamados
         SET ${campos.join(', ')}
         WHERE id = ?`,
        valores
      );

      if (result.affectedRows === 0) {
        return null;
      }

      return await this.findById(id);

    } catch (error) {
      console.error('❌ Erro em Chamado.update:', error);
      throw error;

    } finally {
      connection.release();
    }
  }

  // Atualizar apenas status
  static async updateStatus(id, status) {
    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute(
        'UPDATE chamados SET status = ? WHERE id = ?',
        [status, id]
      );

      return result.affectedRows > 0;

    } catch (error) {
      console.error('❌ Erro em Chamado.updateStatus:', error);
      throw error;

    } finally {
      connection.release();
    }
  }

  // Deletar chamado
  static async delete(id) {
    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute(
        'DELETE FROM chamados WHERE id = ?',
        [id]
      );

      return result.affectedRows > 0;

    } catch (error) {
      console.error('❌ Erro em Chamado.delete:', error);
      throw error;

    } finally {
      connection.release();
    }
  }

  // Estatísticas
  static async getStats() {
    const connection = await pool.getConnection();

    try {
      const [total] = await connection.execute(
        'SELECT COUNT(*) AS total FROM chamados'
      );

      const [abertos] = await connection.execute(
        "SELECT COUNT(*) AS total FROM chamados WHERE status = 'aberto'"
      );

      const [fechados] = await connection.execute(
        "SELECT COUNT(*) AS total FROM chamados WHERE status = 'fechado'"
      );

      return {
        total: total[0].total,
        abertos: abertos[0].total,
        fechados: fechados[0].total
      };

    } catch (error) {
      console.error('❌ Erro em Chamado.getStats:', error);
      throw error;

    } finally {
      connection.release();
    }
  }
}

export default Chamado;
