import Logs from '../models/Logs.js';

class LogsController {
  /**
   * Lista logs com filtros
   * GET /api/logs
   */
  static async list(req, res) {
    try {
      const {
        nivel,
        tipo,
        modulo,
        usuario,
        busca,
        data_inicio,
        data_fim,
        limite
      } = req.query;

      const filtros = {
        nivel: nivel || null,
        tipo: tipo || null,
        modulo: modulo || null,
        usuario_nome: usuario || null,
        busca: busca || null,
        data_inicio: data_inicio || null,
        data_fim: data_fim || null,
        limite: limite || null
      };

      // Remove filtros nulos/undefined
      Object.keys(filtros).forEach(key => {
        if (filtros[key] === null || filtros[key] === undefined || filtros[key] === '') {
          delete filtros[key];
        }
      });

      const logs = await Logs.findAll(filtros);

      return res.status(200).json({
        success: true,
        data: logs,
        total: logs.length,
        filtros_aplicados: Object.keys(filtros)
      });

    } catch (error) {
      console.error('❌ Erro ao listar logs:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao listar logs do sistema',
        error: error.message
      });
    }
  }

  /**
   * Busca log por ID
   * GET /api/logs/:id
   */
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const log = await Logs.findById(id);

      if (!log) {
        return res.status(404).json({
          success: false,
          message: 'Log não encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        data: log
      });

    } catch (error) {
      console.error('❌ Erro ao buscar log:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar log',
        error: error.message
      });
    }
  }

  /**
   * Cria um novo log
   * POST /api/logs
   */
  static async create(req, res) {
    try {
      const logData = {
        nivel: req.body.nivel || 'Info',
        tipo: req.body.tipo || 'Sistema',
        modulo: req.body.modulo || 'Geral',
        mensagem: req.body.mensagem || '',
        detalhes: req.body.detalhes || null,
        dados_adicionais: req.body.dados_adicionais || null,
        stack_trace: req.body.stack_trace || null,
        usuario_id: req.body.usuario_id || null,
        usuario_nome: req.body.usuario_nome || 'Sistema',
        ip: req.ip || req.body.ip || null,
        user_agent: req.get('User-Agent') || req.body.user_agent || null,
        session_id: req.body.session_id || null,
        url: req.body.url || req.originalUrl || null,
        metodo: req.body.metodo || req.method || null,
        codigo_status: req.body.codigo_status || null,
        tempo_execucao: req.body.tempo_execucao || null
      };

      const log = await Logs.create(logData);

      // Notifica via WebSocket se disponível
      if (req.app && req.app.get && req.app.get('notifyClients')) {
        const notifyClients = req.app.get('notifyClients');
        notifyClients({
          type: 'log_novo',
          data: log
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Log registrado com sucesso',
        data: log
      });

    } catch (error) {
      console.error('❌ Erro ao criar log:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao registrar log',
        error: error.message
      });
    }
  }

  /**
   * Retorna estatísticas dos logs
   * GET /api/logs/stats
   */
  static async getStats(req, res) {
    try {
      const stats = await Logs.getStats();

      return res.status(200).json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar estatísticas dos logs',
        error: error.message
      });
    }
  }

  /**
   * Limpa logs antigos
   * DELETE /api/logs/limpar
   */
  static async limpar(req, res) {
    try {
      const dias = req.query.dias || 30;
      const quantidade = await Logs.limparAntigos(dias);

      return res.status(200).json({
        success: true,
        message: `${quantidade} logs removidos (mais de ${dias} dias)`,
        registros_removidos: quantidade
      });

    } catch (error) {
      console.error('❌ Erro ao limpar logs:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao limpar logs antigos',
        error: error.message
      });
    }
  }

  /**
   * Busca logs de um usuário específico
   * GET /api/logs/usuario/:usuarioId
   */
  static async getByUser(req, res) {
    try {
      const { usuarioId } = req.params;
      const logs = await Logs.findByUser(usuarioId);

      return res.status(200).json({
        success: true,
        data: logs,
        total: logs.length
      });

    } catch (error) {
      console.error('❌ Erro ao buscar logs do usuário:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar logs do usuário',
        error: error.message
      });
    }
  }
}

export default LogsController;
