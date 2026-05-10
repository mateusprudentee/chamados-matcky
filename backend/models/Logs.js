import { getPool } from '../src/database.js';

class Logs {
  /**
   * Cria um novo registro de log
   * @param {Object} logData - Dados do log
   * @returns {Promise<Object>} Log criado
   */
  static async create(logData) {
    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute(
        `INSERT INTO logs_sistema (
          nivel,
          tipo,
          modulo,
          mensagem,
          detalhes,
          dados_adicionais,
          stack_trace,
          usuario_id,
          usuario_nome,
          ip,
          user_agent,
          session_id,
          url,
          metodo,
          codigo_status,
          tempo_execucao
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          logData.nivel || 'Info',
          logData.tipo || 'Sistema',
          logData.modulo || 'Geral',
          logData.mensagem || '',
          logData.detalhes || null,
          logData.dados_adicionais ? JSON.stringify(logData.dados_adicionais) : null,
          logData.stack_trace || null,
          logData.usuario_id || null,
          logData.usuario_nome || 'Sistema',
          logData.ip || null,
          logData.user_agent || null,
          logData.session_id || null,
          logData.url || null,
          logData.metodo || null,
          logData.codigo_status || null,
          logData.tempo_execucao || null
        ]
      );

      // Busca o log criado para retornar
      const [logCriado] = await connection.execute(
        'SELECT * FROM logs_sistema WHERE id = ?',
        [result.insertId]
      );

      return logCriado[0] || null;

    } catch (error) {
      console.error('❌ Erro em Logs.create:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Busca todos os logs com filtros
   * @param {Object} filtros - Filtros de busca
   * @returns {Promise<Array>} Lista de logs
   */
  static async findAll(filtros = {}) {
    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
      let query = 'SELECT * FROM logs_sistema WHERE 1=1';
      const params = [];

      // Filtro por nível
      if (filtros.nivel) {
        query += ' AND nivel = ?';
        params.push(filtros.nivel);
      }

      // Filtro por tipo
      if (filtros.tipo) {
        query += ' AND tipo = ?';
        params.push(filtros.tipo);
      }

      // Filtro por módulo
      if (filtros.modulo) {
        query += ' AND modulo = ?';
        params.push(filtros.modulo);
      }

      // Filtro por usuário
      if (filtros.usuario_nome) {
        query += ' AND usuario_nome = ?';
        params.push(filtros.usuario_nome);
      }

      // Filtro por data inicial
      if (filtros.data_inicio) {
        query += ' AND data_criacao >= ?';
        params.push(filtros.data_inicio);
      }

      // Filtro por data final
      if (filtros.data_fim) {
        query += ' AND data_criacao <= ?';
        params.push(filtros.data_fim);
      }

      // Filtro por busca textual
      if (filtros.busca) {
        query += ' AND (mensagem LIKE ? OR usuario_nome LIKE ? OR ip LIKE ?)';
        const buscaTerm = `%${filtros.busca}%`;
        params.push(buscaTerm, buscaTerm, buscaTerm);
      }

      // Ordenação
      query += ' ORDER BY data_criacao DESC';

      // Limite (opcional)
      if (filtros.limite) {
        query += ' LIMIT ?';
        params.push(parseInt(filtros.limite));
      }

      const [logs] = await connection.execute(query, params);

      return logs;

    } catch (error) {
      console.error('❌ Erro em Logs.findAll:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Busca log por ID
   * @param {number} id - ID do log
   * @returns {Promise<Object>} Log encontrado
   */
  static async findById(id) {
    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
      const [logs] = await connection.execute(
        'SELECT * FROM logs_sistema WHERE id = ?',
        [id]
      );

      return logs[0] || null;

    } catch (error) {
      console.error('❌ Erro em Logs.findById:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Busca estatísticas dos logs
   * @returns {Promise<Object>} Estatísticas
   */
  static async getStats() {
    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
      // Total de logs
      const [total] = await connection.execute(
        'SELECT COUNT(*) AS total FROM logs_sistema'
      );

      // Contagem por nível
      const [porNivel] = await connection.execute(
        `SELECT
          nivel,
          COUNT(*) as quantidade
        FROM logs_sistema
        GROUP BY nivel`
      );

      // Contagem por tipo
      const [porTipo] = await connection.execute(
        `SELECT
          tipo,
          COUNT(*) as quantidade
        FROM logs_sistema
        GROUP BY tipo`
      );

      // Contagem por módulo
      const [porModulo] = await connection.execute(
        `SELECT
          modulo,
          COUNT(*) as quantidade
        FROM logs_sistema
        GROUP BY modulo`
      );

      // Logs das últimas 24 horas
      const [ultimas24h] = await connection.execute(
        `SELECT COUNT(*) AS total
         FROM logs_sistema
         WHERE data_criacao >= DATE_SUB(NOW(), INTERVAL 24 HOUR)`
      );

      // Média de logs por hora nas últimas 24h
      const [mediaHora] = await connection.execute(
        `SELECT
          HOUR(data_criacao) as hora,
          COUNT(*) as quantidade
         FROM logs_sistema
         WHERE data_criacao >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
         GROUP BY HOUR(data_criacao)
         ORDER BY hora`
      );

      // Últimos erros
      const [ultimosErros] = await connection.execute(
        `SELECT id, mensagem, data_criacao
         FROM logs_sistema
         WHERE nivel = 'Erro'
         ORDER BY data_criacao DESC
         LIMIT 10`
      );

      return {
        total: total[0]?.total || 0,
        ultimas_24h: ultimas24h[0]?.total || 0,
        por_nivel: porNivel.reduce((acc, item) => {
          acc[item.nivel] = item.quantidade;
          return acc;
        }, {}),
        por_tipo: porTipo.reduce((acc, item) => {
          acc[item.tipo] = item.quantidade;
          return acc;
        }, {}),
        por_modulo: porModulo.reduce((acc, item) => {
          acc[item.modulo] = item.quantidade;
          return acc;
        }, {}),
        atividade_hora: mediaHora,
        ultimos_erros: ultimosErros
      };

    } catch (error) {
      console.error('❌ Erro em Logs.getStats:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Deleta logs antigos (limpeza)
   * @param {number} dias - Dias para manter
   * @returns {Promise<number>} Quantidade de logs deletados
   */
  static async limparAntigos(dias = 30) {
    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute(
        `DELETE FROM logs_sistema
         WHERE data_criacao < DATE_SUB(NOW(), INTERVAL ? DAY)`,
        [dias]
      );

      console.log(`🧹 Limpeza de logs: ${result.affectedRows} registros removidos (${dias} dias)`);

      return result.affectedRows;

    } catch (error) {
      console.error('❌ Erro em Logs.limparAntigos:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Busca logs de um usuário específico
   * @param {number} usuarioId - ID do usuário
   * @returns {Promise<Array>} Lista de logs do usuário
   */
  static async findByUser(usuarioId) {
    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
      const [logs] = await connection.execute(
        `SELECT * FROM logs_sistema
         WHERE usuario_id = ?
         ORDER BY data_criacao DESC
         LIMIT 100`,
        [usuarioId]
      );

      return logs;

    } catch (error) {
      console.error('❌ Erro em Logs.findByUser:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default Logs;
