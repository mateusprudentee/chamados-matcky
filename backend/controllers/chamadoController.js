import Chamado from '../models/Chamado.js';
class ChamadoController {
  static async create(req, res) {
    try {
      console.log('📝 Dados recebidos para criar chamado:', req.body);

      const chamado = await Chamado.create(req.body);

      return res.status(201).json({
        success: true,
        message: 'Chamado criado com sucesso',
        data: chamado
      });
    } catch (error) {
      console.error('❌ Erro ao criar chamado:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao criar chamado',
        error: error.message
      });
    }
  }

  static async list(req, res) {
    try {
      const { status, email, prioridade } = req.query;
      const chamados = await Chamado.findAll({ status, email_usuario: email, prioridade });

      return res.status(200).json({
        success: true,
        data: chamados,
        total: chamados.length
      });
    } catch (error) {
      console.error('❌ Erro ao listar chamados:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao listar chamados',
        error: error.message
      });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const chamado = await Chamado.findById(id);

      if (!chamado) {
        return res.status(404).json({
          success: false,
          message: 'Chamado não encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        data: chamado
      });
    } catch (error) {
      console.error('❌ Erro ao buscar chamado:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar chamado',
        error: error.message
      });
    }
  }

  static async getByProtocolo(req, res) {
    try {
      const { protocolo } = req.params;
      const chamado = await Chamado.findByProtocolo(protocolo);

      if (!chamado) {
        return res.status(404).json({
          success: false,
          message: 'Chamado não encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        data: chamado
      });
    } catch (error) {
      console.error('❌ Erro ao buscar chamado por protocolo:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar chamado',
        error: error.message
      });
    }
  }

  static async getByUser(req, res) {
    try {
      const { email } = req.params;
      const chamados = await Chamado.findByUserEmail(email);

      return res.status(200).json({
        success: true,
        data: chamados,
        total: chamados.length
      });
    } catch (error) {
      console.error('❌ Erro ao buscar chamados do usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar chamados do usuário',
        error: error.message
      });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const updatedChamado = await Chamado.update(id, req.body);

      if (!updatedChamado) {
        return res.status(404).json({
          success: false,
          message: 'Chamado não encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Chamado atualizado com sucesso',
        data: updatedChamado
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar chamado:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar chamado',
        error: error.message
      });
    }
  }

  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status é obrigatório'
        });
      }

      const updated = await Chamado.updateStatus(id, status);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Chamado não encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Status atualizado com sucesso'
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar status',
        error: error.message
      });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Chamado.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Chamado não encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Chamado deletado com sucesso'
      });
    } catch (error) {
      console.error('❌ Erro ao deletar chamado:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao deletar chamado',
        error: error.message
      });
    }
  }

  static async getStats(req, res) {
    try {
      const stats = await Chamado.getStats();

      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar estatísticas',
        error: error.message
      });
    }
  }
}

export default ChamadoController;
