import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET_KEY = '8448270f4a7672db1af3d41cefc127909b735edad27c8b1b8d4fa6145c27dbaa';

// Definição hierárquica de cargos
const ROLES = {
  MASTER: 'master',     // Nível máximo
  MANAGER: 'gerente',   // Segundo nível
  ADMIN: 'admin',       // Terceiro nível
  MODERATOR: 'moderador', // Quarto nível
  HELPER: 'ajudante',   // Quinto nível
  MEMBER: 'membro',     // Membro normal
  GUEST: 'guest'        // Visitante
};

// Todas as permissões disponíveis no sistema
const PERMISSIONS = {
  // Básicas
  CAN_REGISTER: 'can_register',
  CAN_VIEW_FORUM: 'can_view_forum',
  CAN_VIEW_MEMBERS: 'can_view_members',
  CAN_VIEW_PUNISHMENTS: 'can_view_punishments',
  CAN_FOLLOW: 'can_follow',
  CAN_UNFOLLOW: 'can_unfollow',


  // Ajudante+
  CAN_REPORT_CONTENT: 'can_report_content',

  // Moderador+
  CAN_LOCK_TOPIC: 'can_lock_topic',
  CAN_DELETE_REPLY: 'can_delete_reply',
  CAN_WARN_USERS: 'can_warn_users',
  CAN_USE_MULTIMOD: 'can_use_multimod',

  // Admin+
  CAN_DELETE_TOPIC: 'can_delete_topic',
  CAN_PIN_TOPIC: 'can_pin_topic',
  CAN_MANAGE_CATEGORIES: 'can_manage_categories',

  // Gerente+
  CAN_MANAGE_USERS: 'can_manage_users',
  CAN_MANAGE_MODERATORS: 'can_manage_moderators',
  CAN_ACCESS_REPORTS: 'can_access_reports',

  // Master
  CAN_ALL: 'can_all',
  CAN_DELETE_TOPIC: 'can_delete_topic',
  CAN_PIN_TOPIC: 'can_pin_topic',
  CAN_MANAGE_CATEGORIES: 'can_manage_categories'
};

// Mapeamento de permissões por cargo
const ROLE_PERMISSIONS = {
  [ROLES.MASTER]:
  [
    PERMISSIONS.CAN_REGISTER,
    PERMISSIONS.CAN_VIEW_FORUM,
    PERMISSIONS.CAN_VIEW_MEMBERS,
    PERMISSIONS.CAN_VIEW_PUNISHMENTS,
    PERMISSIONS.CAN_FOLLOW,
    PERMISSIONS.CAN_UNFOLLOW,
    PERMISSIONS.CAN_LOCK_TOPIC,
    PERMISSIONS.CAN_DELETE_TOPIC,
    PERMISSIONS.CAN_DELETE_REPLY,
    PERMISSIONS.CAN_PIN_TOPIC,
    PERMISSIONS.CAN_USE_MULTIMOD,
    PERMISSIONS.CAN_MANAGE_CATEGORIES,
    PERMISSIONS.CAN_WARN_USERS,
    PERMISSIONS.CAN_MANAGE_USERS,
    PERMISSIONS.CAN_MANAGE_MODERATORS,
    PERMISSIONS.CAN_ACCESS_REPORTS

  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.CAN_REGISTER,
    PERMISSIONS.CAN_VIEW_FORUM,
    PERMISSIONS.CAN_VIEW_MEMBERS,
    PERMISSIONS.CAN_VIEW_PUNISHMENTS,
    PERMISSIONS.CAN_FOLLOW,
    PERMISSIONS.CAN_UNFOLLOW,
    PERMISSIONS.CAN_LOCK_TOPIC,
    PERMISSIONS.CAN_DELETE_TOPIC,
    PERMISSIONS.CAN_DELETE_REPLY,
    PERMISSIONS.CAN_PIN_TOPIC,
    PERMISSIONS.CAN_USE_MULTIMOD,
    PERMISSIONS.CAN_MANAGE_CATEGORIES,
    PERMISSIONS.CAN_WARN_USERS,
    PERMISSIONS.CAN_MANAGE_USERS,
    PERMISSIONS.CAN_MANAGE_MODERATORS,
    PERMISSIONS.CAN_ACCESS_REPORTS
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.CAN_REGISTER,
    PERMISSIONS.CAN_VIEW_FORUM,
    PERMISSIONS.CAN_VIEW_MEMBERS,
    PERMISSIONS.CAN_VIEW_PUNISHMENTS,
    PERMISSIONS.CAN_FOLLOW,
    PERMISSIONS.CAN_UNFOLLOW,
    PERMISSIONS.CAN_LOCK_TOPIC,
    PERMISSIONS.CAN_DELETE_TOPIC,
    PERMISSIONS.CAN_DELETE_REPLY,
    PERMISSIONS.CAN_PIN_TOPIC,
    PERMISSIONS.CAN_USE_MULTIMOD,
    PERMISSIONS.CAN_MANAGE_CATEGORIES,
    PERMISSIONS.CAN_WARN_USERS
  ],
  [ROLES.MODERATOR]: [
    PERMISSIONS.CAN_REGISTER,
    PERMISSIONS.CAN_VIEW_FORUM,
    PERMISSIONS.CAN_VIEW_MEMBERS,
    PERMISSIONS.CAN_VIEW_PUNISHMENTS,
    PERMISSIONS.CAN_FOLLOW,
    PERMISSIONS.CAN_UNFOLLOW,
    PERMISSIONS.CAN_LOCK_TOPIC,
    PERMISSIONS.CAN_DELETE_REPLY,
    PERMISSIONS.CAN_WARN_USERS,
    PERMISSIONS.CAN_USE_MULTIMOD,
    PERMISSIONS.CAN_REPORT_CONTENT
  ],
  [ROLES.HELPER]: [
    PERMISSIONS.CAN_REGISTER,
    PERMISSIONS.CAN_VIEW_FORUM,
    PERMISSIONS.CAN_VIEW_MEMBERS,
    PERMISSIONS.CAN_VIEW_PUNISHMENTS,
    PERMISSIONS.CAN_FOLLOW,
    PERMISSIONS.CAN_UNFOLLOW,
    PERMISSIONS.CAN_REPORT_CONTENT
  ],
  [ROLES.MEMBER]: [
    PERMISSIONS.CAN_REGISTER,
    PERMISSIONS.CAN_VIEW_FORUM,
    PERMISSIONS.CAN_VIEW_MEMBERS,
    PERMISSIONS.CAN_VIEW_PUNISHMENTS,
    PERMISSIONS.CAN_FOLLOW,
    PERMISSIONS.CAN_UNFOLLOW
  ],
  [ROLES.GUEST]: [
    PERMISSIONS.CAN_REGISTER,
    PERMISSIONS.CAN_VIEW_FORUM,
    PERMISSIONS.CAN_VIEW_MEMBERS,
    PERMISSIONS.CAN_VIEW_PUNISHMENTS
  ]
};

// Verifica se um usuário tem uma permissão específica
function checkPermission(permission) {
  return (req, res, next) => {
    const user = req.user;

    if (!user || !user.role) {
      return res.status(403).json({
        success: false,
        error: 'Acesso não autorizado'
      });
    }

    // Master tem todas as permissões
    if (user.role === ROLES.MASTER) {
      return next();
    }

    const hasPermission = ROLE_PERMISSIONS[user.role]?.includes(permission) ||
                         ROLE_PERMISSIONS[user.role]?.includes(PERMISSIONS.CAN_ALL);

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: 'Você não tem permissão para realizar esta ação'
      });
    }

    next();
  };
}

// Verifica se tem pelo menos uma das permissões
function checkAnyPermission(permissions) {
  return (req, res, next) => {
    const user = req.user;

    if (!user || !user.role) {
      return res.status(403).json({
        success: false,
        error: 'Acesso não autorizado'
      });
    }

    // Master tem todas as permissões
    if (user.role === ROLES.MASTER) {
      return next();
    }

    const hasAnyPermission = permissions.some(permission =>
      ROLE_PERMISSIONS[user.role]?.includes(permission)
    );

    if (!hasAnyPermission) {
      return res.status(403).json({
        success: false,
        error: 'Você não tem permissão para realizar esta ação'
      });
    }

    next();
  };
}

// Verifica hierarquia de cargos
function checkRoleHierarchy(requesterRole, targetRole) {
  const hierarchy = [
    ROLES.MASTER,
    ROLES.MANAGER,
    ROLES.ADMIN,
    ROLES.MODERATOR,
    ROLES.HELPER,
    ROLES.MEMBER,
    ROLES.GUEST
  ];

  return hierarchy.indexOf(requesterRole) <= hierarchy.indexOf(targetRole);
}

// Middleware de autenticação JWT melhorado
function authenticateToken(req, res, next) {
  // 1. Verifica o cabeçalho de autorização
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];

  // 2. Extrai o token
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token de autenticação não fornecido',
      code: 'MISSING_TOKEN'
    });
  }

  // 3. Verifica o token
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      // Tratamento detalhado de erros
      let errorResponse = {
        success: false,
        error: 'Falha na autenticação'
      };

      if (err.name === 'TokenExpiredError') {
        errorResponse = {
          ...errorResponse,
          error: 'Sessão expirada',
          code: 'TOKEN_EXPIRED',
          isExpired: true
        };
      } else if (err.name === 'JsonWebTokenError') {
        errorResponse = {
          ...errorResponse,
          error: 'Token inválido',
          code: 'INVALID_TOKEN'
        };
      }

      return res.status(401).json(errorResponse);
    }

    // 4. Adiciona informações do usuário à requisição
    req.user = {
      id: decoded.id,
      username: decoded.username,
      // Adicione apenas as informações necessárias
      ...(decoded.role && { role: decoded.role }) // Adiciona role apenas se existir
    };

    next();
  });
}

// Criptografa senha
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// Compara senha com hash
async function comparePasswords(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

// Gera token JWT
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      username: user.username,
      avatar: user.avatar,
      created_at: user.created_at,
      permissions: ROLE_PERMISSIONS[user.role] || []
    },
    SECRET_KEY,
    { expiresIn: '1d' }
  );
}

export {
  authenticateToken,
  hashPassword,
  comparePasswords,
  generateToken,
  checkPermission,
  checkAnyPermission,
  checkRoleHierarchy,
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS
};
