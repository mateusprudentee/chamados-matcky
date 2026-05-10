import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'http';

import authRoutes from '../routes/authRoutes.js';
import membersRoutes from '../routes/membersRoutes.js';
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
  'https://redeboom.com',
  'https://loja.redeboom.com',
  'https://boom-matcky.onrender.com'
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

process.env.TZ = 'UTC';

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
  categories: new Map()
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

    } catch (error) {

      console.error(
        'Erro ao processar mensagem WebSocket:',
        error
      );

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

      removeFromMap(
        activeConnections.categories,
        category
      );

      if (subcategory) {

        const compoundKey =
          `${category}:${subcategory}`;

        removeFromMap(
          activeConnections.categories,
          compoundKey
        );
      }
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

  if (category) {

    if (activeConnections.categories.has(category)) {

      sendToConnections(
        activeConnections.categories.get(category)
      );

    }

    return;
  }

  sendToConnections(activeConnections.global);

};

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

      console.log(
        `Servidor HTTP e WebSocket rodando na porta ${port}`
      );

      console.log(
        `WebSocket disponível em wss://boom-matcky.onrender.com/ws`
      );

    });

  })
  .catch(err => {

    console.error(
      'Falha ao inicializar o banco de dados:',
      err
    );

    process.exit(1);

  });

export { app, server, notifyClients };
