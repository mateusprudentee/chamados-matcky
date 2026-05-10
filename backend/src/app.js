import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'http';

import authRoutes from '../routes/authRoutes.js';
import membersRoutes from '../routes/membersRoutes.js';
import catalogoRoutes from '../routes/catalogoRoutes.js';
import chamadoRoutes from '../routes/chamadoRoutes.js';

// CORREÇÃO: Importar corretamente do database.js
import { initializePool, getPool, checkPoolHealth } from './database.js';

const app = express();
const port = process.env.PORT || 3001;

// TRUST PROXY
app.set('trust proxy', true);

// ==========================================
// CORS (TEM QUE VIR ANTES DAS ROTAS)
// ==========================================

const allowedOrigins = [
  'http://localhost:9000',
  'http://localhost:5173',
  'http://localhost:8080',
  'https://chamados.matcky.com',
  'https://redeboom.com',
  'https://loja.redeboom.com',
  'https://boom-matcky.onrender.com',
  'https://chamados-backend-4efw.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite requests sem origin (Postman/mobile/etc)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log(`CORS bloqueado para origem: ${origin}`);
    return callback(new Error('CORS bloqueado'));
  },
  credentials: true
}));

// ==========================================
// MIDDLEWARES
// ==========================================

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));

process.env.TZ = 'UTC';

// ==========================================
// MIDDLEWARE PARA VERIFICAR BANCO DE DADOS
// ==========================================

app.use(async (req, res, next) => {
  // Pular verificação para rotas de health check
  if (req.path === '/api/status' || req.path === '/ping') {
    return next();
  }

  try {
    const isHealthy = await checkPoolHealth();
    if (!isHealthy) {
      console.warn('Pool não saudável, tentando reinicializar...');
      await initializePool();
    }
    next();
  } catch (error) {
    console.error('Erro ao verificar saúde do pool:', error);
    next();
  }
});

// ==========================================
// ROTA API STATUS
// ==========================================

app.get('/api/status', async (req, res) => {
  try {
    const dbStatus = await checkPoolHealth();
    const pool = await getPool();
    let dbVersion = null;
    let dbName = null;

    if (dbStatus && pool) {
      try {
        const [rows] = await pool.execute('SELECT VERSION() as version, DATABASE() as db_name');
        dbVersion = rows[0].version;
        dbName = rows[0].db_name;
      } catch (err) {
        console.error('Erro ao consultar versão do DB:', err);
      }
    }

    res.status(200).json({
      success: true,
      message: 'API Online - Sistema de Chamados',
      version: '1.0.0',
      services: {
        auth: true,
        members: true,
        chamados: true,
        websocket: true,
        database: dbStatus
      },
      database: {
        connected: dbStatus,
        version: dbVersion,
        name: dbName
      },
      endpoints: {
        chamados: [
          'POST /api/chamados - Criar chamado',
          'GET /api/chamados - Listar chamados',
          'GET /api/chamados/:id - Buscar por ID',
          'PUT /api/chamados/:id - Atualizar chamado',
          'GET /api/chamados/usuario/:email - Chamados do usuário'
        ]
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar status',
      error: error.message
    });
  }
});

// ==========================================
// ROTA TESTE
// ==========================================

app.get('/ping', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// WEBSOCKET CHECK
// ==========================================

app.use((req, res, next) => {
  if (
    req.headers.upgrade &&
    req.headers.upgrade.toLowerCase() === 'websocket'
  ) {
    return res.status(426).send('Upgrade required for WebSocket');
  }
  next();
});

// ==========================================
// ROTAS
// ==========================================

app.use('/', authRoutes);
app.use('/api', membersRoutes);
app.use('/api', catalogoRoutes);
app.use('/api', chamadoRoutes);

// ==========================================
// ROTA DE TESTE DO BANCO
// ==========================================

app.get('/api/test-db', async (req, res) => {
  try {
    const pool = await getPool();
    const [result] = await pool.execute('SELECT 1 as connected, NOW() as current_time, DATABASE() as database_name');
    const [tables] = await pool.execute('SHOW TABLES');

    res.json({
      success: true,
      connection: result[0],
      tables: tables.map(row => Object.values(row)[0]),
      poolActive: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      code: error.code
    });
  }
});

// ==========================================
// MIDDLEWARE DE ERRO PARA CHAMADOS
// ==========================================

app.use((err, req, res, next) => {
  console.error('Erro na aplicação:', err);

  // Se for um erro de CORS
  if (err.message === 'CORS bloqueado') {
    return res.status(403).json({
      success: false,
      message: 'Origem não permitida pelo CORS'
    });
  }

  // Erro de banco de dados
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      success: false,
      message: 'Banco de dados indisponível',
      error: 'Conexão com o banco de dados foi recusada'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ==========================================
// HTTP SERVER
// ==========================================

const server = http.createServer(app);

// ==========================================
// WEBSOCKET SERVER
// ==========================================

const wss = new WebSocketServer({
  server,
  path: '/ws'
});

// ==========================================
// CONEXÕES
// ==========================================

const activeConnections = {
  global: new Map(),
  categories: new Map(),
  chamados: new Map()
};

// ==========================================
// HEARTBEAT
// ==========================================

const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

// ==========================================
// WEBSOCKET CONNECTION
// ==========================================

wss.on('connection', (ws, req) => {
  console.log('✅ Novo cliente WebSocket conectado');

  ws.isAlive = true;

  ws.on('pong', () => {
    ws.isAlive = true;
  });

  const urlParams = new URL(
    req.url,
    `http://${req.headers.host}`
  ).searchParams;

  const category = urlParams.get('category');
  const subcategory = urlParams.get('subcategory');
  const chamadoId = urlParams.get('chamadoId');
  const clientId = urlParams.get('clientId') || `anon-${Date.now()}`;

  const registerConnection = (map, key) => {
    if (!map.has(key)) {
      map.set(key, new Map());
    }
    map.get(key).set(clientId, ws);
  };

  registerConnection(activeConnections, 'global');

  if (category) {
    registerConnection(activeConnections.categories, category);

    if (subcategory) {
      const compoundKey = `${category}:${subcategory}`;
      registerConnection(activeConnections.categories, compoundKey);
    }
  }

  if (chamadoId) {
    registerConnection(activeConnections.chamados, chamadoId);
  }

  // Enviar confirmação de conexão
  ws.send(JSON.stringify({
    type: 'connected',
    clientId: clientId,
    timestamp: Date.now(),
    subscriptions: {
      global: true,
      category: category || null,
      subcategory: subcategory || null,
      chamadoId: chamadoId || null
    }
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('📨 Mensagem recebida:', data);

      if (data.type === 'ping') {
        ws.send(JSON.stringify({
          type: 'pong',
          timestamp: Date.now()
        }));
      }

      if (data.type === 'subscribe_chamado' && data.chamadoId) {
        registerConnection(activeConnections.chamados, data.chamadoId);
        ws.send(JSON.stringify({
          type: 'subscribed',
          chamadoId: data.chamadoId,
          message: 'Inscrito para notificações do chamado'
        }));
      }

      if (data.type === 'unsubscribe_chamado' && data.chamadoId) {
        if (activeConnections.chamados.has(data.chamadoId)) {
          activeConnections.chamados.get(data.chamadoId).delete(clientId);
          if (activeConnections.chamados.get(data.chamadoId).size === 0) {
            activeConnections.chamados.delete(data.chamadoId);
          }
        }
        ws.send(JSON.stringify({
          type: 'unsubscribed',
          chamadoId: data.chamadoId,
          message: 'Removido das notificações do chamado'
        }));
      }

    } catch (error) {
      console.error('Erro ao processar mensagem WebSocket:', error);
    }
  });

  ws.on('close', () => {
    console.log(`❌ Cliente ${clientId} desconectado`);

    const removeFromMap = (map, key) => {
      if (map.has(key)) {
        map.get(key).delete(clientId);
        if (map.get(key).size === 0) {
          map.delete(key);
        }
      }
    };

    removeFromMap(activeConnections, 'global');

    if (category) {
      removeFromMap(activeConnections.categories, category);
      if (subcategory) {
        const compoundKey = `${category}:${subcategory}`;
        removeFromMap(activeConnections.categories, compoundKey);
      }
    }

    if (chamadoId) {
      removeFromMap(activeConnections.chamados, chamadoId);
    }
  });

  ws.on('error', (error) => {
    console.error('❌ Erro no WebSocket:', error);
  });
});

// ==========================================
// NOTIFICAÇÕES
// ==========================================

const notifyClients = ({
  type,
  data,
  category = null,
  subcategory = null,
  chamadoId = null,
  excludeClientId = null
}) => {
  console.log(`📢 Enviando notificação: ${type}`, data);

  const message = JSON.stringify({
    type,
    data,
    timestamp: Date.now()
  });

  const sendToConnections = (connections) => {
    connections.forEach((ws, id) => {
      if (
        ws.readyState === ws.OPEN &&
        id !== excludeClientId
      ) {
        ws.send(message);
      }
    });
  };

  if (chamadoId && activeConnections.chamados.has(chamadoId)) {
    sendToConnections(activeConnections.chamados.get(chamadoId));
    return;
  }

  if (category && subcategory) {
    const compoundKey = `${category}:${subcategory}`;
    if (activeConnections.categories.has(compoundKey)) {
      sendToConnections(activeConnections.categories.get(compoundKey));
    }
    return;
  }

  if (category) {
    if (activeConnections.categories.has(category)) {
      sendToConnections(activeConnections.categories.get(category));
    }
    return;
  }

  sendToConnections(activeConnections.global);
};

// ==========================================
// EXPORTAR FUNÇÃO DE NOTIFICAÇÃO PARA USO NAS ROTAS
// ==========================================

app.set('notifyClients', notifyClients);

// ==========================================
// SERVER CLOSE
// ==========================================

server.on('close', () => {
  clearInterval(heartbeatInterval);
  wss.clients.forEach((ws) => ws.terminate());
});

// ==========================================
// START SERVER
// ==========================================

initializePool()
  .then(() => {
    server.listen(port, () => {
      console.log(`🚀 Servidor HTTP e WebSocket rodando na porta ${port}`);
      console.log(`📡 WebSocket disponível em wss://chamados-backend-4efw.onrender.com/ws`);
      console.log(`📋 API de Chamados: https://chamados-backend-4efw.onrender.com/api/chamados`);
      console.log(`🌐 Status: https://chamados-backend-4efw.onrender.com/api/status`);
      console.log(`✅ Banco de dados: Conectado`);
    });
  })
  .catch(err => {
    console.error('❌ Falha ao inicializar o banco de dados:', err);
    process.exit(1);
  });

// ==========================================
// TRATAMENTO DE SINAIS PARA ENCERRAMENTO GRACEFUL
// ==========================================

process.on('SIGTERM', () => {
  console.log('SIGTERM recebido, encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT recebido, encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado');
    process.exit(0);
  });
});

export { app, server, notifyClients };
