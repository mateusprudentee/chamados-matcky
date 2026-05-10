import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';

const dbConfig = {
  host: process.env.DB_HOST || '50.6.138.116',
  user: process.env.DB_USER || 'mate5357_chamados',
  password: process.env.DB_PASSWORD || 'mm19102005MM!',
  database: process.env.DB_NAME || 'mate5357_chamados',
  waitForConnections: true,
  connectionLimit: 5, // Aumentado para evitar problemas
  queueLimit: 0, // Sem limite na fila
  acquireTimeout: 30000,
  timeout: 60000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
};

// Configuração SMTP para Titan Email
const smtpConfig = {
  host: 'smtp.titan.email',
  port: 465,
  secure: true,
  auth: {
    user: 'ajuda@redeboom.com',
    pass: 'mm19102005MM!'
  },
  connectionTimeout: 30000,
  greetingTimeout: 30000,
  socketTimeout: 30000
};

// Criar transporter
const transporter = nodemailer.createTransport(smtpConfig);

// Verificar conexão SMTP
transporter.verify(function(error, success) {
  if (error) {
    console.log('Erro na conexão SMTP:', error);
  } else {
    console.log('Servidor SMTP pronto para enviar mensagens');
  }
});

// Criar pool de conexões
let pool = null;
let lastConnectionTime = 0;
const CONNECTION_COOLDOWN = 5000;

// Função para criar pool com retry
async function createPoolWithRetry(retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const currentTime = Date.now();
      if (currentTime - lastConnectionTime < CONNECTION_COOLDOWN) {
        await new Promise(resolve => setTimeout(resolve, CONNECTION_COOLDOWN));
      }

      lastConnectionTime = Date.now();

      // Criar o pool CORRETAMENTE
      const newPool = mysql.createPool(dbConfig);

      // Testar a conexão
      const testConn = await newPool.getConnection();
      console.log('✅ Conexão com o banco de dados estabelecida com sucesso');
      testConn.release();

      return newPool;
    } catch (error) {
      console.error(`❌ Tentativa ${i + 1} falhou:`, error.message);

      if (i === retries - 1) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Inicializar pool
async function initializePool() {
  try {
    pool = await createPoolWithRetry();
    console.log('✅ Pool de conexões inicializado com sucesso');
  } catch (error) {
    console.error('❌ Falha ao inicializar o pool de conexões:', error.message);
    throw error;
  }
}

// Função para garantir que o pool está inicializado
async function getPool() {
  if (!pool) {
    await initializePool();
  }
  return pool;
}

// Middleware para gerenciar conexões
const withConnection = async (callback) => {
  const poolInstance = await getPool();
  let connection;
  try {
    connection = await poolInstance.getConnection();
    const result = await callback(connection);
    return result;
  } catch (error) {
    console.error('Erro na operação do banco:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Função para verificar saúde do pool
async function checkPoolHealth() {
  try {
    const poolInstance = await getPool();
    const connection = await poolInstance.getConnection();
    connection.release();
    return true;
  } catch (error) {
    console.error('Pool não saudável:', error.message);
    return false;
  }
}

// Exportar funções - CORRIGIDO
export {
  getPool,
  withConnection,
  checkPoolHealth,
  initializePool,
  pool as db
};

// Exportar o transporter como default
export default transporter;
