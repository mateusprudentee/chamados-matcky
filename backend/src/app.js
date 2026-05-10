import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'http';

import authRoutes from '../routes/authRoutes.js';
import membersRoutes from '../routes/membersRoutes.js';
import catalogoRoutes from '../routes/catalogoRoutes.js';


import chamadoRoutes from '../routes/chamadoRoutes.js'; // Nova importação
import { initializePool } from './database.js';

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
  'https://redeboom.com',
  'https://loja.redeboom.com',
  'https://boom-matcky.onrender.com',
  'https://chamados-backend-4efw.onrender.com' // Adiciona a nova URL
];

app.use(cors({
  origin: function (origin, callback) {
    // Permite requests sem origin (Postman/mobile/etc)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS bloqueado'));
  },
  credentials: true
}));

// ==========================================
// MIDDLEWARES
// ==========================================

app.use(bodyParser.json());
app.use(express.json());

// Aumentar limite para upload de arquivos
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

process.env.TZ = 'UTC';

// ==========================================
// ROTA API STATUS
// ==========================================

app.get('/api/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Online - Sistema de Chamados',
    version: '1.0.0',
    services: {
      auth: true,
      members: true,
      chamados: true,
      websocket: true
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
});

// ==========================================
// ROTA TESTE
// ==========================================

app.get('/ping', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'pong'
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

app.use('', authRoutes);
app.use('', membersRoutes);
app.use('/api', catalogoRoutes);
app.use('/api', chamadoRoutes); // Adiciona as rotas de chamados

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
  chamados: new Map() // Adiciona monitoramento de chamados
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
  console.log('Novo cliente WebSocket conectado');

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
  const chamadoId = urlParams.get('chamadoId'); // ID do chamado para notificações

  const clientId =
    urlParams.get('clientId') || `anon-${Date.now()}`;

  const registerConnection = (map, key) => {
    if (!map.has(key)) {
      map.set(key, new Map());
    }
    map.get(key).set(clientId, ws);
  };

  registerConnection(activeConnections, 'global');

  if (category) {
    registerConnection(
      activeConnections.categories,
      category
    );

    if (subcategory) {
      const compoundKey =
        `${category}:${subcategory}`;
      registerConnection(
        activeConnections.categories,
        compoundKey
      );
    }
  }

  // Registra para notificações de chamados específicos
  if (chamadoId) {
    registerConnection(activeConnections.chamados, chamadoId);
  }

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Mensagem recebida:', data);

      if (data.type === 'ping') {
        ws.send(JSON.stringify({
          type: 'pong',
          timestamp: Date.now()
        }));
      }

      // Notificações de chamados em tempo real
      if (data.type === 'subscribe_chamado' && data.chamadoId) {
        registerConnection(activeConnections.chamados, data.chamadoId);
        ws.send(JSON.stringify({
          type: 'subscribed',
          chamadoId: data.chamadoId,
          message: 'Inscrito para notificações do chamado'
        }));
      }

    } catch (error) {
      console.error('Erro ao processar mensagem WebSocket:', error);
    }
  });

  ws.on('close', () => {
    console.log(`Cliente ${clientId} desconectado`);

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

    // Remove de notificações de chamados
    if (chamadoId) {
      removeFromMap(activeConnections.chamados, chamadoId);
    }
  });

  ws.on('error', (error) => {
    console.error('Erro no WebSocket:', error);
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
  chamadoId = null, // Novo parâmetro
  excludeClientId = null
}) => {
  console.log(`Enviando notificação: ${type}`, data);

  const message = JSON.stringify({
    type,
    data
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

  // Notificações específicas de chamados
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
      console.log(`📡 WebSocket disponível em wss://boom-matcky.onrender.com/ws`);
      console.log(`📋 API de Chamados: https://chamados-backend-4efw.onrender.com/api/chamados`);
      console.log(`🌐 Status: https://chamados-backend-4efw.onrender.com/api/status`);
    });
  })
  .catch(err => {
    console.error('Falha ao inicializar o banco de dados:', err);
    process.exit(1);
  });

export { app, server, notifyClients };
