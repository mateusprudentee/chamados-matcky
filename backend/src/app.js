import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'http';
import authRoutes from './routes/authRoutes.js';
import membersRoutes from './routes/membersRoutes.js';
import { initializePool } from './src/config/database.js';

const app = express();
const port = process.env.PORT || 3001;

// Configuração do trust proxy (deve vir antes de outras middlewares)
app.set('trust proxy', true); // ou 1 se quiser confiar apenas no primeiro proxy

// Configurações básicas
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['http://smtp.titan.email', 'http://localhost:9000', 'smtp.titan.email', 'https://api.mercadolibre.com/tracks', 'https://www.mercadolibre.com', 'https://boom-matcky.onrender.com', 'http://localhost:5173', 'https://redeboom.com', 'http://localhost:5173', 'https://loja.redeboom.com']
    : 'http://localhost:5173',
  credentials: true
}));

app.use(bodyParser.json());
app.use(express.json());

// Configuração de fuso horário UTC
process.env.TZ = 'UTC';

// Middleware para verificar conexões WebSocket
app.use((req, res, next) => {
  if (req.headers.upgrade && req.headers.upgrade.toLowerCase() === 'websocket') {
    // Deixe o WebSocketServer lidar com a requisição
    return res.status(426).send('Upgrade required for WebSocket');
  }
  next();
});

// Rotas
app.use('', authRoutes);
app.use('', membersRoutes);

// Criar servidor HTTP
const server = http.createServer(app);

// Configurar WebSocket Server
const wss = new WebSocketServer({ server, path: '/ws' });

// Objeto para armazenar conexões ativas
const activeConnections = {
  global: new Map(),
  categories: new Map() // Mapeia categoria -> subcategorias -> conexões
};

// Heartbeat para manter conexões ativas
const heartbeatInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('connection', (ws, req) => {
  console.log('Novo cliente WebSocket conectado');
  ws.isAlive = true;

  // Configurar heartbeat
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  // Extrair parâmetros da URL
  const urlParams = new URL(req.url, `http://${req.headers.host}`).searchParams;
  const category = urlParams.get('category');
  const subcategory = urlParams.get('subcategory');
  const clientId = urlParams.get('clientId') || `anon-${Date.now()}`;

  // Registrar conexão
  const registerConnection = (map, key) => {
    if (!map.has(key)) map.set(key, new Map());
    map.get(key).set(clientId, ws);
  };

  // Adicionar às conexões globais
  registerConnection(activeConnections, 'global');

  // Adicionar às categorias/subcategorias se especificado
  if (category) {
    registerConnection(activeConnections.categories, category);

    if (subcategory) {
      const compoundKey = `${category}:${subcategory}`;
      registerConnection(activeConnections.categories, compoundKey);
    }
  }

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Mensagem recebida:', data);

      // Processar mensagens recebidas (exemplo)
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      }
    } catch (error) {
      console.error('Erro ao processar mensagem WebSocket:', error);
    }
  });

  ws.on('close', () => {
    console.log(`Cliente ${clientId} desconectado`);
    // Remover de todas as conexões
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
  });

  ws.on('error', (error) => {
    console.error('Erro no WebSocket:', error);
  });
});

// Função para notificar clientes
const notifyClients = ({ type, data, category = null, subcategory = null, excludeClientId = null }) => {
  console.log(`Enviando notificação: ${type}`, data);

  const message = JSON.stringify({ type, data });

  const sendToConnections = (connections) => {
    connections.forEach((ws, id) => {
      if (ws.readyState === ws.OPEN && id !== excludeClientId) {
        ws.send(message);
      }
    });
  };

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

  // Enviar para todos os clientes globais
  sendToConnections(activeConnections.global);
};

// Limpeza ao encerrar o servidor
server.on('close', () => {
  clearInterval(heartbeatInterval);
  wss.clients.forEach((ws) => ws.terminate());
});

// Inicialização do banco de dados
initializePool()
  .then(() => {
    server.listen(port, () => {
      console.log(`Servidor HTTP e WebSocket rodando na porta ${port}`);
      console.log(`WebSocket disponível em wss://boom-matcky.onrender.com/ws`);
    });
  })
  .catch(err => {
    console.error('Falha ao inicializar o banco de dados:', err);
    process.exit(1);
  });

export { app, server, notifyClients };
