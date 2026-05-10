import Logs from '../models/Logs.js';

/**
 * Middleware para log automático de requisições
 */
export const requestLogger = async (req, res, next) => {
  const startTime = Date.now();

  // Captura a resposta
  const originalSend = res.send;
  res.send = function(data) {
    const tempoExecucao = (Date.now() - startTime) / 1000;

    // Registra log apenas para endpoints da API
    if (req.path.startsWith('/api/')) {
      Logs.create({
        nivel: res.statusCode >= 400 ? 'Erro' : 'Info',
        tipo: 'API',
        modulo: obterModulo(req.path),
        mensagem: `${req.method} ${req.originalUrl} - ${res.statusCode}`,
        dados_adicionais: {
          status_code: res.statusCode,
          tempo_execucao: tempoExecucao,
          query_params: req.query
        },
        usuario_id: req.user?.id || null,
        usuario_nome: req.user?.username || 'Anônimo',
        ip: req.ip,
        user_agent: req.get('User-Agent'),
        url: req.originalUrl,
        metodo: req.method,
        codigo_status: res.statusCode,
        tempo_execucao: tempoExecucao
      }).catch(err => {
        console.error('Erro ao registrar log automático:', err);
      });
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Função para log de erros
 */
export const errorLogger = async (error, req) => {
  try {
    await Logs.create({
      nivel: 'Erro',
      tipo: 'Sistema',
      modulo: obterModulo(req?.path || '/'),
      mensagem: error.message || 'Erro desconhecido',
      stack_trace: error.stack || null,
      dados_adicionais: {
        error_name: error.name,
        error_code: error.code
      },
      usuario_id: req?.user?.id || null,
      usuario_nome: req?.user?.username || 'Sistema',
      ip: req?.ip || null,
      user_agent: req?.get?.('User-Agent') || null,
      url: req?.originalUrl || null,
      metodo: req?.method || null,
      codigo_status: error.status || 500
    });
  } catch (err) {
    console.error('Erro ao registrar log de erro:', err);
  }
};

/**
 * Função para log de eventos do sistema
 */
export const systemLogger = {
  info: async (mensagem, dados = {}) => {
    try {
      await Logs.create({
        nivel: 'Info',
        tipo: 'Sistema',
        modulo: 'Sistema',
        mensagem,
        dados_adicionais: dados
      });
    } catch (err) {
      console.error('Erro ao registrar log do sistema:', err);
    }
  },

  warning: async (mensagem, dados = {}) => {
    try {
      await Logs.create({
        nivel: 'Aviso',
        tipo: 'Sistema',
        modulo: 'Sistema',
        mensagem,
        dados_adicionais: dados
      });
    } catch (err) {
      console.error('Erro ao registrar log do sistema:', err);
    }
  },

  error: async (error, mensagem, dados = {}) => {
    try {
      await Logs.create({
        nivel: 'Erro',
        tipo: 'Sistema',
        modulo: 'Sistema',
        mensagem: mensagem || error.message,
        stack_trace: error.stack,
        dados_adicionais: {
          ...dados,
          error_name: error.name
        }
      });
    } catch (err) {
      console.error('Erro ao registrar log do sistema:', err);
    }
  },

  debug: async (mensagem, dados = {}) => {
    try {
      await Logs.create({
        nivel: 'Debug',
        tipo: 'Sistema',
        modulo: 'Sistema',
        mensagem,
        dados_adicionais: dados
      });
    } catch (err) {
      console.error('Erro ao registrar log do sistema:', err);
    }
  }
};

/**
 * Obtém o módulo baseado na URL
 */
function obterModulo(path) {
  if (!path) return 'Geral';

  if (path.includes('/auth')) return 'Auth';
  if (path.includes('/chamados')) return 'Chamados';
  if (path.includes('/members')) return 'Usuários';
  if (path.includes('/logs')) return 'Logs';
  if (path.includes('/catalogo') || path.includes('/tipos') || path.includes('/categorias')) return 'Catálogo';

  return 'Geral';
}
