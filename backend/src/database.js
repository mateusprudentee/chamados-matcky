import mysql from 'mysql2/promise';
import nodemailer from 'nodemailer';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'sua_senha',
  database: process.env.DB_NAME || 'chamados_db',
  waitForConnections: true,
  connectionLimit: 2,
  queueLimit: 10,
  acquireTimeout: 30000,
  timeout: 60000,
  reconnect: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
};



// Configuração SMTP para Titan Email
const smtpConfig = {
  host: 'smtp.titan.email',
  port: 465,
  secure: true, // true para porta 465, false para outras portas
  auth: {
    user: 'ajuda@redeboom.com',
    pass: 'mm19102005MM!'
  },
  connectionTimeout: 30000, // 30 segundos
  greetingTimeout: 30000,   // 30 segundos para greeting
  socketTimeout: 30000      // 30 segundos
};

// Criar transporter
const transporter = nodemailer.createTransport(smtpConfig);

// Verificar conexão
transporter.verify(function(error, success) {
  if (error) {
    console.log('Erro na conexão SMTP:', error);
  } else {
    console.log('Servidor SMTP pronto para enviar mensagens');
  }
});

export default transporter;
// Criar pool de conexões
let pool;
let lastConnectionTime = 0;
const CONNECTION_COOLDOWN = 5000; // 5 segundos entre tentativas

// Função para criar pool com retry
async function createPoolWithRetry(retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const currentTime = Date.now();
      // Esperar um pouco entre tentativas se necessário
      if (currentTime - lastConnectionTime < CONNECTION_COOLDOWN) {
        await new Promise(resolve => setTimeout(resolve, CONNECTION_COOLDOWN));
      }

      lastConnectionTime = Date.now();
      const newPool = mysql.createPool(dbConfig);

      // Testar a conexão
      const testConn = await newPool.getConnection();
      testConn.release();

      console.log('Conexão com o banco de dados estabelecida com sucesso');
      return newPool;
    } catch (error) {
      console.error(`Tentativa ${i + 1} falhou:`, error.message);

      if (i === retries - 1) {
        throw error;
      }

      // Esperar antes da próxima tentativa
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Inicializar pool
async function initializePool() {
  try {
    pool = await createPoolWithRetry();
  } catch (error) {
    console.error('Falha ao inicializar o pool de conexões:', error.message);
    // Criar um pool "fake" para evitar crash, mas que lançará erro quando usado
    pool = {
      getConnection: () => Promise.reject(error),
      execute: () => Promise.reject(error),
      query: () => Promise.reject(error),
      end: () => Promise.resolve()
    };
  }
}

// Middleware para gerenciar conexões
const withConnection = async (callback) => {
  let connection;
  try {
    connection = await pool.getConnection();
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
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch (error) {
    console.error('Pool não saudável:', error.message);
    return false;
  }
}

// Inicializar imediatamente
initializePool();

// Exportar funções
export { pool as db, withConnection, checkPoolHealth, initializePool };
