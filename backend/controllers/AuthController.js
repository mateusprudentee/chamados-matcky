import { db } from '../src/database.js';
import { hashPassword, comparePasswords, generateToken } from '../src/auth.js';
import validator from 'validator';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';

// ============ Proteção: cache de tentativas de login ============
const loginAttempts = {}; // cache simples por IP
const LOGIN_LIMIT = 5;
const BLOCK_TIME = 15 * 60 * 1000; // 15 minutos

// Sanitização e validação avançadas
const sanitize = {
  username: (username) => {
    if (!username || typeof username !== 'string') return false;
    const sanitized = validator.escape(username.trim());
    return validator.isLength(sanitized, { min: 3, max: 20 }) &&
           validator.matches(sanitized, /^[a-zA-Z0-9_\-]+$/);
  },
  email: (email) => {
    if (!email || typeof email !== 'string') return false;
    return validator.isEmail(validator.normalizeEmail(email.trim()));
  },
  password: (password) => {
    if (!password || typeof password !== 'string') return false;
    return validator.isLength(password, { min: 8, max: 100 }) &&
           /[A-Z]/.test(password) &&
           /[0-9]/.test(password) &&
           /[^A-Za-z0-9]/.test(password);
  },
  minecraftNick: (nick) => {
    if (!nick || typeof nick !== 'string') return false;
    const sanitized = validator.escape(nick.trim());
    return validator.isLength(sanitized, { min: 3, max: 16 }) &&
           validator.matches(sanitized, /^[a-zA-Z0-9_]+$/);
  },
  avatar: (url) => {
    if (!url) return null;
    if (typeof url !== 'string') return false;
    return validator.isURL(url, {
      protocols: ['http', 'https'],
      require_protocol: true,
      allow_underscores: true
    }) ? validator.escape(url.trim()) : null;
  }
};

// Proteção contra brute force global (extra camada)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Muitas tentativas de login. Tente novamente mais tarde.'
});

// Função para gerar token de verificação
const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Função simulada para enviar email de verificação (apenas log)
const sendVerificationEmail = async (email, token, username) => {
  const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/verify-email?token=${token}`;

  console.log('=== EMAIL DE VERIFICAÇÃO (SIMULAÇÃO) ===');
  console.log('Para:', email);
  console.log('Assunto: Verifique sua conta - Confirmação de Email');
  console.log('Link de verificação:', verificationLink);
  console.log('========================================');

  return true;
};

class AuthController {
  static async register(req, res) {
    try {
      const { username, email, password } = req.body;

      // Anti-bot simples: valida agente e estrutura dos dados
      const userAgent = req.get('User-Agent');
      if (!userAgent || userAgent.length < 10) {
        return res.status(400).json({ error: 'Agente de navegação inválido' });
      }

      const connection = await db.getConnection();

      try {
        const [existing] = await connection.query(
          'SELECT id FROM membros WHERE username = ? OR email = ? LIMIT 1',
          [username, email]
        );

        if (existing.length > 0) {
          return res.status(400).json({ error: 'Usuário ou email já existe' });
        }

        const hashedPassword = await hashPassword(password);
        const verificationToken = generateVerificationToken();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

        const [result] = await connection.query(
          `INSERT INTO membros
           (username, email, password, minecraft_nick, avatar,
            verification_token, verification_expires, data_criacao, verified)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), TRUE)`, // AUTO-VERIFICADO
          [
            username,
            email,
            hashedPassword,
            username,
            `https://i.imgur.com/kKIqX11.png`,
            verificationToken,
            verificationExpires
          ]
        );

        // Simular envio de email (apenas log no console)
        try {
          await sendVerificationEmail(email, verificationToken, username);
          console.log('Email de verificação simulado para:', email);
        } catch (emailError) {
          console.error('Erro ao simular email:', emailError);
        }

        // Gerar token automaticamente (usuário já está verificado)
        const token = generateToken({
          id: result.insertId,
          username: username
        });

        return res.status(201).json({
          success: true,
          message: 'Registro realizado com sucesso!',
          token: token,
          user: {
            id: result.insertId,
            username,
            email
          }
        });
      } finally {
        if (connection) connection.release();
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      return res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
  }

  // Método para verificar email (mantido para compatibilidade)
  static async verifyEmail(req, res) {
    try {
      const { token } = req.query;

      if (!token) {
        return res.status(400).json({ error: 'Token de verificação é obrigatório' });
      }

      const connection = await db.getConnection();

      try {
        const [users] = await connection.query(
          `SELECT id, username, verification_expires
           FROM membros
           WHERE verification_token = ?
           LIMIT 1`,
          [token]
        );

        if (users.length === 0) {
          return res.status(400).json({ error: 'Token inválido ou expirado' });
        }

        const user = users[0];

        if (new Date() > user.verification_expires) {
          return res.status(400).json({ error: 'Token expirado.' });
        }

        // Atualizar usuário como verificado
        await connection.query(
          `UPDATE membros
           SET verified = TRUE,
               verification_token = NULL,
               verification_expires = NULL
           WHERE id = ?`,
          [user.id]
        );

        // Gerar token de autenticação
        const authToken = generateToken({
          id: user.id,
          username: user.username
        });

        return res.status(200).json({
          success: true,
          message: 'Email verificado com sucesso!',
          token: authToken,
          user: {
            id: user.id,
            username: user.username
          }
        });
      } finally {
        if (connection) connection.release();
      }
    } catch (error) {
      console.error('Erro na verificação de email:', error);
      return res.status(500).json({ error: 'Erro ao verificar email' });
    }
  }

  // Método para reenviar email de verificação (simulado)
  static async resendVerificationEmail(req, res) {
    try {
      const { email } = req.body;

      if (!email || !sanitize.email(email)) {
        return res.status(400).json({ error: 'Email inválido' });
      }

      const connection = await db.getConnection();

      try {
        const [users] = await connection.query(
          `SELECT id, username, verified
           FROM membros
           WHERE email = ?
           LIMIT 1`,
          [email]
        );

        if (users.length === 0) {
          return res.status(404).json({ error: 'Email não encontrado' });
        }

        const user = users[0];

        if (user.verified) {
          return res.status(400).json({ error: 'Esta conta já foi verificada' });
        }

        // Gerar novo token de verificação
        const verificationToken = generateVerificationToken();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

        await connection.query(
          `UPDATE membros
           SET verification_token = ?,
               verification_expires = ?
           WHERE id = ?`,
          [verificationToken, verificationExpires, user.id]
        );

        // Simular envio de email
        try {
          await sendVerificationEmail(email, verificationToken, user.username);
          return res.status(200).json({
            success: true,
            message: 'Email de verificação reenviado com sucesso!'
          });
        } catch (emailError) {
          console.error('Erro ao simular email:', emailError);
          return res.status(500).json({ error: 'Falha ao enviar email de verificação' });
        }
      } finally {
        if (connection) connection.release();
      }
    } catch (error) {
      console.error('Erro ao reenviar email de verificação:', error);
      return res.status(500).json({ error: 'Erro ao reenviar email de verificação' });
    }
  }

  // ... (os outros métodos permanecem iguais)

  static async formulario(req, res) {
    try {
      const { nomeCompleto, nascimento, discord, email, experiencia, motivo } = req.body;
      const { id, username, role } = req.user;

      await db.query(`
        INSERT INTO formulario (
          user_id,
          username,
          role,
          nome_completo,
          nascimento,
          discord,
          email,
          experiencia,
          motivo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        username,
        role,
        nomeCompleto,
        nascimento,
        discord,
        email,
        experiencia,
        motivo
      ]);

      res.status(201).json({ message: 'Formulário enviado com sucesso.' });
    } catch (err) {
      console.error('Erro em formulario:', err);
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  }

  static async login(req, res) {
    try {
      await new Promise((resolve, reject) => {
        authLimiter(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const ip = req.ip;
      const key = `login:${ip}`;

      if (!loginAttempts[key]) loginAttempts[key] = { count: 0, lastAttempt: Date.now() };
      const attempt = loginAttempts[key];

      if (attempt.count >= LOGIN_LIMIT && Date.now() - attempt.lastAttempt < BLOCK_TIME) {
        return res.status(429).json({ error: 'Sua conta foi bloqueada por 15 minutos devido muitas tentativas de login' });
      }

      const { username, password } = req.body;

      if (!sanitize.username(username) && !sanitize.email(username)) {
        attempt.count += 1;
        attempt.lastAttempt = Date.now();
        return res.status(400).json({ error: 'Credenciais inválidas' });
      }
      if (!password || typeof password !== 'string') {
        attempt.count += 1;
        attempt.lastAttempt = Date.now();
        return res.status(400).json({ error: 'Credenciais inválidas' });
      }

      const [rows] = await db.query(
        'SELECT * FROM membros WHERE username = ? OR email = ? LIMIT 1',
        [username, username]
      );

      const fakeHash = await hashPassword(crypto.randomBytes(16).toString('hex'));
      const user = rows[0] || { password: fakeHash, salt: '' };

      const valid = await comparePasswords(password + (user.salt || ''), user.password);

      if (!valid || !rows.length) {
        attempt.count += 1;
        attempt.lastAttempt = Date.now();
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // REMOVIDA a verificação de email - todos os usuários são auto-verificados
      // if (!user.verified) {
      //   return res.status(401).json({
      //     error: 'Email não verificado. Verifique sua caixa de entrada.',
      //     needsVerification: true,
      //     email: user.email
      //   });
      // }

      loginAttempts[key] = { count: 0, lastAttempt: 0 };

      await db.execute(
        'UPDATE membros SET last_login = NOW() WHERE id = ?',
        [user.id]
      );

      const token = generateToken({
        id: user.id,
        username: user.username,
        role: user.role,
        jti: crypto.randomBytes(16).toString('hex')
      });

      const { password: _, salt: __, ...userWithoutSecrets } = user;

      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');

      res.json({
        success: true,
        message: 'Login bem-sucedido',
        token,
        user: userWithoutSecrets,
        cookie: `auth=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${7 * 24 * 60 * 60}`
      });
    } catch (err) {
      console.error('Erro no login:', err);
      res.status(500).json({
        error: 'Erro interno no servidor',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  }

  static async getMe(req, res) {
    try {
      if (!req.user?.id || !validator.isInt(String(req.user.id))) {
        return res.status(401).json({ error: 'Não autorizado' });
      }

      const [rows] = await db.query(
        `SELECT
           id, username, email, role, avatar, verified,
           minecraft_nick AS minecraftNick,
           data_criacao AS created_at,
           last_login AS lastLogin
         FROM membros
         WHERE id = ?`,
        [req.user.id]
      );

      const user = rows[0];
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const safeUser = {
        ...user,
        username: validator.escape(user.username),
        email: validator.escape(user.email),
        minecraftNick: validator.escape(user.minecraftNick),
        avatar: validator.escape(user.avatar)
      };

      res.json(safeUser);
    } catch (err) {
      console.error('Erro em getMe:', err);
      res.status(500).json({
        error: 'Erro ao carregar perfil',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  }

  static async validateToken(req, res) {
    try {
      if (!req.user?.id || !validator.isInt(String(req.user.id))) {
        return res.status(401).json({ valid: false, error: 'Token inválido' });
      }

      const [rows] = await db.query(
        `SELECT
           id, username, email, role, avatar, verified,
           minecraft_nick AS minecraftNick,
           data_criacao AS created_at,
           last_login AS lastLogin
         FROM membros
         WHERE id = ?`,
        [req.user.id]
      );

      const user = rows[0];
      if (!user) {
        return res.status(404).json({ valid: false, error: 'Usuário não encontrado' });
      }

      const safeUser = {
        ...user,
        username: validator.escape(user.username),
        email: validator.escape(user.email),
        minecraftNick: validator.escape(user.minecraftNick),
        avatar: validator.escape(user.avatar)
      };

      res.json({
        valid: true,
        user: safeUser,
        expiresIn: req.user.exp - Math.floor(Date.now() / 1000)
      });
    } catch (err) {
      console.error('Erro ao validar token:', err);
      res.status(500).json({
        valid: false,
        error: 'Erro ao validar token',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  }
}

export default AuthController;
