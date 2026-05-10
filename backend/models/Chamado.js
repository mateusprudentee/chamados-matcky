import pool from '../src/database.js';
class ChamadoModel {
  // Criar novo chamado
  static async criar(chamadoData) {
    const connection = await pool.getConnection();

    try {
      const [result] = await connection.execute(
        `INSERT INTO chamados (
          tipo, icone_tipo, categoria, subcategoria, titulo,
          prioridade, descricao, anexos, status, id_usuario,
          nome_usuario, email_usuario, departamento_usuario,
          sla_resposta, sla_resolucao
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Aberto', ?, ?, ?, ?, ?, ?)`,
        [
          chamadoData.tipo,
          chamadoData.icone_tipo,
          chamadoData.categoria,
          chamadoData.subcategoria,
          chamadoData.titulo,
          chamadoData.prioridade,
          chamadoData.descricao,
          JSON.stringify(chamadoData.anexos || []),
          chamadoData.id_usuario || null,
          chamadoData.nome_usuario,
          chamadoData.email_usuario,
          chamadoData.departamento_usuario || null,
          chamadoData.sla_resposta,
          chamadoData.sla_resolucao
        ]
      );

      // Retornar o chamado criado
      const [chamado] = await connection.execute(
        'SELECT * FROM chamados WHERE id = ?',
        [result.insertId]
      );

      return chamado[0];
    } finally {
      connection.release();
    }
  }

  // Buscar todos os chamados
  static async buscarTodos(filtros = {}) {
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

      if (filtros.usuario) {
        query += ' AND (nome_usuario LIKE ? OR email_usuario LIKE ?)';
        params.push(`%${filtros.usuario}%`, `%${filtros.usuario}%`);
      }

      query += ' ORDER BY data_criacao DESC';

      const [chamados] = await connection.execute(query, params);
      return chamados;
    } finally {
      connection.release();
    }
  }

  // Buscar chamado por ID
  static async buscarPorId(id) {
    const connection = await pool.getConnection();

    try {
      const [chamados] = await connection.execute(
        'SELECT * FROM chamados WHERE id = ?',
        [id]
      );

      return chamados[0] || null;
    } finally {
      connection.release();
    }
  }

  // Atualizar chamado
  static async atualizar(id, dados) {
    const connection = await pool.getConnection();

    try {
      const campos = [];
      const valores = [];

      if (dados.status) {
        campos.push('status = ?');
        valores.push(dados.status);
      }

      if (dados.descricao) {
        campos.push('descricao = ?');
        valores.push(dados.descricao);
      }

      if (dados.prioridade) {
        campos.push('prioridade = ?');
        valores.push(dados.prioridade);
      }

      if (dados.data_resolucao) {
        campos.push('data_resolucao = ?');
        valores.push(dados.data_resolucao);

        // Calcular tempo de resolução
        campos.push('tempo_resolucao = TIMESTAMPDIFF(MINUTE, data_criacao, ?)');
        valores.push(dados.data_resolucao);
      }

      if (campos.length === 0) return null;

      valores.push(id);

      const [result] = await connection.execute(
        `UPDATE chamados SET ${campos.join(', ')} WHERE id = ?`,
        valores
      );

      if (result.affectedRows === 0) return null;

      // Retornar chamado atualizado
      const [chamado] = await connection.execute(
        'SELECT * FROM chamados WHERE id = ?',
        [id]
      );

      return chamado[0];
    } finally {
      connection.release();
    }
  }

  // Buscar chamados de um usuário específico
  static async buscarPorUsuario(email) {
    const connection = await pool.getConnection();

    try {
      const [chamados] = await connection.execute(
        'SELECT * FROM chamados WHERE email_usuario = ? ORDER BY data_criacao DESC',
        [email]
      );

      return chamados;
    } finally {
      connection.release();
    }
  }
}

export default ChamadoModel;
