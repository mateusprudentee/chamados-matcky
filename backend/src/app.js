import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';

import authRoutes from '../routes/authRoutes.js';
import membersRoutes from '../routes/membersRoutes.js';
import catalogoRoutes from '../routes/catalogoRoutes.js';
import chamadoRoutes from '../routes/chamadoRoutes.js';
import logsRoutes from '../routes/logsRoutes.js';

import {
  initializePool,
  getPool,
  checkPoolHealth
} from './database.js';

const app = express();
const port = process.env.PORT || 3001;

app.set('trust proxy', true);

process.env.TZ = 'UTC';

// ==========================================
// CORS
// ==========================================

const allowedOrigins = [
  'http://localhost:9000',
  'http://localhost:5173',
  'http://localhost:8080',
  'https://chamados.matcky.com',
  'https://redeboom.com',
  'https://loja.redeboom.com',
  'https://chamados-backend-4efw.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {

    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log(`❌ CORS bloqueado: ${origin}`);

    return callback(new Error('CORS bloqueado'));
  },
  credentials: true
}));

// ==========================================
// MIDDLEWARES
// ==========================================

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '10mb'
}));

app.use(express.json({ limit: '10mb' }));

// ==========================================
// HEALTH CHECK DB
// ==========================================

app.use(async (req, res, next) => {

  if (
    req.path === '/api/status' ||
    req.path === '/ping'
  ) {
    return next();
  }

  try {

    const isHealthy = await checkPoolHealth();

    if (!isHealthy) {
      console.warn('⚠️ Pool não saudável, reinicializando...');
      await initializePool();
    }

    next();

  } catch (error) {

    console.error('❌ Erro pool:', error);
    next();
  }
});

// ==========================================
// STATUS API
// ==========================================

app.get('/api/status', async (req, res) => {

  try {

    const dbStatus = await checkPoolHealth();

    const pool = await getPool();

    let dbVersion = null;
    let dbName = null;

    if (dbStatus && pool) {

      try {

        const [rows] = await pool.execute(`
          SELECT
            VERSION() as version,
            DATABASE() as db_name
        `);

        dbVersion = rows[0].version;
        dbName = rows[0].db_name;

      } catch (err) {

        console.error('Erro DB version:', err);
      }
    }

    res.status(200).json({
      success: true,
      websocket: true,
      database: {
        connected: dbStatus,
        version: dbVersion,
        name: dbName
      },
      connections: wss.clients.size,
      timestamp: new Date().toISOString()
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==========================================
// PING
// ==========================================

app.get('/ping', (req, res) => {

  res.status(200).json({
    success: true,
    message: 'pong',
    websocketClients: wss.clients.size,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// TEST DB
// ==========================================

app.get('/api/test-db', async (req, res) => {

  try {

    const pool = await getPool();

    const [result] = await pool.execute(`
      SELECT
        1 as connected,
        NOW() as current_time,
        DATABASE() as database_name
    `);

    const [tables] = await pool.execute('SHOW TABLES');

    res.json({
      success: true,
      connection: result[0],
      tables: tables.map(row => Object.values(row)[0]),
      websocketClients: wss.clients.size
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==========================================
// ROTAS
// ==========================================

app.use('/', authRoutes);
app.use('/', membersRoutes);
app.use('/api', catalogoRoutes);
app.use('/api', chamadoRoutes);
app.use('/', logsRoutes);
// ==========================================
// ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {

  console.error('❌ Erro aplicação:', err);

  if (err.message === 'CORS bloqueado') {

    return res.status(403).json({
      success: false,
      message: 'Origem não permitida'
    });
  }

  if (err.code === 'ECONNREFUSED') {

    return res.status(503).json({
      success: false,
      message: 'Banco indisponível'
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erro interno'
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
// CONNECTION STORAGE
// ==========================================

const activeConnections = {
  global: new Map(),
  categories: new Map(),
  chamados: new Map()
};

// ==========================================
// HELPERS
// ==========================================

const registerConnection = (map, key, clientId, ws) => {

  if (!map.has(key)) {
    map.set(key, new Map());
  }

  map.get(key).set(clientId, ws);
};

const removeConnection = (map, key, clientId) => {

  if (!map.has(key)) {
    return;
  }

  map.get(key).delete(clientId);

  if (map.get(key).size === 0) {
    map.delete(key);
  }
};

// ==========================================
// HEARTBEAT
// ==========================================

const heartbeatInterval = setInterval(() => {

  wss.clients.forEach((ws) => {

    if (ws.isAlive === false) {

      console.log('💀 Terminando conexão morta');

      return ws.terminate();
    }

    ws.isAlive = false;

    try {

      ws.ping();

    } catch (err) {

      console.error('Erro ping WS:', err);
    }
  });

}, 30000);

// ==========================================
// WEBSOCKET CONNECTION
// ==========================================

wss.on('connection', (ws, req) => {

  try {

    console.log('✅ Cliente conectado WS');

    ws.isAlive = true;

    ws.on('pong', () => {

      ws.isAlive = true;

      console.log('🏓 Pong recebido');
    });

    const url = new URL(req.url, 'http://localhost');

    const category = url.searchParams.get('category');
    const subcategory = url.searchParams.get('subcategory');
    const chamadoId = url.searchParams.get('chamadoId');

    const clientId =
      url.searchParams.get('clientId')
      || `client-${Date.now()}`;

    // ==========================================
    // GLOBAL
    // ==========================================

    registerConnection(
      activeConnections.global,
      'global',
      clientId,
      ws
    );

    // ==========================================
    // CATEGORY
    // ==========================================

    if (category) {

      registerConnection(
        activeConnections.categories,
        category,
        clientId,
        ws
      );

      if (subcategory) {

        const compoundKey =
          `${category}:${subcategory}`;

        registerConnection(
          activeConnections.categories,
          compoundKey,
          clientId,
          ws
        );
      }
    }

    // ==========================================
    // CHAMADO
    // ==========================================

    if (chamadoId) {

      registerConnection(
        activeConnections.chamados,
        chamadoId,
        clientId,
        ws
      );
    }

    // ==========================================
    // CONNECTED MESSAGE
    // ==========================================

    ws.send(JSON.stringify({
      type: 'connected',
      clientId,
      timestamp: Date.now(),
      websocketClients: wss.clients.size,
      subscriptions: {
        global: true,
        category,
        subcategory,
        chamadoId
      }
    }));

    // ==========================================
    // MESSAGE
    // ==========================================

    ws.on('message', (message) => {

      try {

        const data = JSON.parse(message.toString());

        console.log('📨 WS mensagem:', data);

        // ======================================
        // PING MANUAL
        // ======================================

        if (data.type === 'ping') {

          ws.send(JSON.stringify({
            type: 'pong',
            timestamp: Date.now()
          }));
        }

        // ======================================
        // SUBSCRIBE CHAMADO
        // ======================================

        if (
          data.type === 'subscribe_chamado' &&
          data.chamadoId
        ) {

          registerConnection(
            activeConnections.chamados,
            data.chamadoId,
            clientId,
            ws
          );

          ws.send(JSON.stringify({
            type: 'subscribed',
            chamadoId: data.chamadoId
          }));
        }

        // ======================================
        // UNSUBSCRIBE
        // ======================================

        if (
          data.type === 'unsubscribe_chamado' &&
          data.chamadoId
        ) {

          removeConnection(
            activeConnections.chamados,
            data.chamadoId,
            clientId
          );

          ws.send(JSON.stringify({
            type: 'unsubscribed',
            chamadoId: data.chamadoId
          }));
        }

      } catch (error) {

        console.error('❌ Erro WS message:', error);
      }
    });

    // ==========================================
    // CLOSE
    // ==========================================

    ws.on('close', () => {

      console.log(`❌ Cliente desconectado: ${clientId}`);

      removeConnection(
        activeConnections.global,
        'global',
        clientId
      );

      if (category) {

        removeConnection(
          activeConnections.categories,
          category,
          clientId
        );

        if (subcategory) {

          removeConnection(
            activeConnections.categories,
            `${category}:${subcategory}`,
            clientId
          );
        }
      }

      if (chamadoId) {

        removeConnection(
          activeConnections.chamados,
          chamadoId,
          clientId
        );
      }
    });

    // ==========================================
    // ERROR
    // ==========================================

    ws.on('error', (error) => {

      console.error('❌ WS erro:', error);
    });

  } catch (error) {

    console.error('❌ Erro conexão WS:', error);

    ws.close();
  }
});

// ==========================================
// NOTIFY CLIENTS
// ==========================================

const notifyClients = ({
  type,
  data,
  category = null,
  subcategory = null,
  chamadoId = null,
  excludeClientId = null
}) => {

  try {

    console.log(`📢 Broadcast: ${type}`);

    const message = JSON.stringify({
      type,
      data,
      timestamp: Date.now()
    });

    const sendToConnections = (connections) => {

      if (!connections) return;

      connections.forEach((ws, clientId) => {

        if (
          ws.readyState === WebSocket.OPEN &&
          clientId !== excludeClientId
        ) {

          try {

            ws.send(message);

          } catch (err) {

            console.error('Erro send WS:', err);
          }
        }
      });
    };

    // ======================================
    // CHAMADO
    // ======================================

    if (
      chamadoId &&
      activeConnections.chamados.has(chamadoId)
    ) {

      sendToConnections(
        activeConnections.chamados.get(chamadoId)
      );

      return;
    }

    // ======================================
    // CATEGORY + SUBCATEGORY
    // ======================================

    if (category && subcategory) {

      const compoundKey =
        `${category}:${subcategory}`;

      if (
        activeConnections.categories.has(compoundKey)
      ) {

        sendToConnections(
          activeConnections.categories.get(compoundKey)
        );
      }

      return;
    }

    // ======================================
    // CATEGORY
    // ======================================

    if (category) {

      if (
        activeConnections.categories.has(category)
      ) {

        sendToConnections(
          activeConnections.categories.get(category)
        );
      }

      return;
    }

    // ======================================
    // GLOBAL
    // ======================================

    sendToConnections(
      activeConnections.global.get('global')
    );

  } catch (error) {

    console.error('❌ notifyClients erro:', error);
  }
};

// ==========================================
// GLOBAL APP ACCESS
// ==========================================

app.set('notifyClients', notifyClients);

// ==========================================
// SERVER CLOSE
// ==========================================

server.on('close', () => {

  clearInterval(heartbeatInterval);

  wss.clients.forEach((ws) => {

    try {
      ws.terminate();
    } catch {}
  });
});

// ==========================================
// START SERVER
// ==========================================

initializePool()
  .then(() => {

    server.listen(port, () => {

      console.log(`
🚀 Servidor online
🌐 Porta: ${port}
📡 WS: wss://chamados-backend-4efw.onrender.com/ws
📋 API: https://chamados-backend-4efw.onrender.com/api
✅ Banco conectado
      `);
    });
  })
  .catch((err) => {

    console.error(
      '❌ Erro inicializar DB:',
      err
    );

    process.exit(1);
  });

// ==========================================
// SHUTDOWN
// ==========================================

process.on('SIGTERM', () => {

  console.log('SIGTERM recebido');

  server.close(() => {

    console.log('Servidor encerrado');

    process.exit(0);
  });
});

process.on('SIGINT', () => {

  console.log('SIGINT recebido');

  server.close(() => {

    console.log('Servidor encerrado');

    process.exit(0);
  });
});

export {
  app,
  server,
  notifyClients
};
