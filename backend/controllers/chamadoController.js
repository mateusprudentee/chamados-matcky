const ChamadoModel = require('../models/Chamado.js');

class ChamadoController {
  // Criar novo chamado
  static async criar(req, res) {
    try {
      const {
        tipo, icone_tipo, categoria, subcategoria,
        titulo, prioridade, descricao, anexos,
        nome_usuario, email_usuario, departamento_usuario,
        sla_resposta, sla_resolucao
      } = req.body;

      // Validação básica
      if (!tipo || !categoria || !subcategoria || !titulo ||
          !prioridade || !descricao || !nome_usuario || !email_usuario) {
        return res.status(400).json({
          success: false,
          message: 'Campos obrigatórios não preenchidos',
          campos: ['tipo', 'categoria', 'subcategoria', 'titulo',
                   'prioridade', 'descricao', 'nome_usuario', 'email_usuario']
        });
      }

      const chamadoData = {
        tipo,
        icone_tipo: icone_tipo || '',
        categoria,
        subcategoria,
        titulo,
        prioridade,
        descricao,
        anexos: anexos || [],
        id_usuario: req.body.id_usuario || null,
        nome_usuario,
        email_usuario,
        departamento_usuario: departamento_usuario || '',
        sla_resposta: sla_resposta || '',
        sla_resolucao: sla_resolucao || ''
      };

      const novoChamado = await ChamadoModel.criar(chamadoData);

      return res.status(201).json({
        success: true,
        message: 'Chamado criado com sucesso',
        chamado: novoChamado
      });
    } catch (error) {
      console.error('Erro ao criar chamado:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao criar chamado',
        error: error.message
      });
    }
  }

  // Listar todos os chamados
  static async listar(req, res) {
    try {
      const filtros = {
        status: req.query.status,
        tipo: req.query.tipo,
        prioridade: req.query.prioridade,
        usuario: req.query.usuario
      };

      const chamados = await ChamadoModel.buscarTodos(filtros);

      return res.status(200).json({
        success: true,
        quantidade: chamados.length,
        chamados
      });
    } catch (error) {
      console.error('Erro ao listar chamados:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao listar chamados',
        error: error.message
      });
    }
  }

  // Buscar chamado por ID
  static async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      const chamado = await ChamadoModel.buscarPorId(id);

      if (!chamado) {
        return res.status(404).json({
          success: false,
          message: 'Chamado não encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        chamado
      });
    } catch (error) {
      console.error('Erro ao buscar chamado:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao buscar chamado',
        error: error.message
      });
    }
  }

  // Atualizar chamado
  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const dadosAtualizacao = req.body;

      const chamadoAtualizado = await ChamadoModel.atualizar(id, dadosAtualizacao);

      if (!chamadoAtualizado) {
        return res.status(404).json({
          success: false,
          message: 'Chamado não encontrado ou sem dados para atualizar'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Chamado atualizado com sucesso',
        chamado: chamadoAtualizado
      });
    } catch (error) {
      console.error('Erro ao atualizar chamado:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao atualizar chamado',
        error: error.message
      });
    }
  }

  // Buscar chamados por usuário
  static async buscarPorUsuario(req, res) {
    try {
      const { email } = req.params;
      const chamados = await ChamadoModel.buscarPorUsuario(email);

      return res.status(200).json({
        success: true,
        quantidade: chamados.length,
        chamados
      });
    } catch (error) {
      console.error('Erro ao buscar chamados do usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao buscar chamados do usuário',
        error: error.message
      });
    }
  }
}

module.exports = ChamadoController;
