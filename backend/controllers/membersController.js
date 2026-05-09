import { db } from '../src/config/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET_KEY = '8448270f4a7672db1af3d41cefc127909b735edad27c8b1b8d4fa6145c27dbaa';

class MembersController {
  // ========== REGISTRO DE MEMBRO ==========
  register = async (req, res) => {
    try {
      const { username, email, password, minecraftNick, avatar } = req.body;

      if (!username || !email || !password || !minecraftNick) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const avatarUrl = avatar || `https://cravatar.eu/helmavatar/${encodeURIComponent(username)}/190.png`;

      const [result] = await db.execute(
        `INSERT INTO membros
           (username, email, password, minecraft_nick, avatar, data_criacao)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [username, email, hashedPassword, minecraftNick, avatarUrl]
      );

      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        userId: result.insertId,
        user: { username, email, minecraftNick, avatar: avatarUrl, created_at: new Date() }
      });
    } catch (err) {
      console.error('Erro no registro:', err);
      const msg = err.message.includes('ER_DUP_ENTRY')
        ? 'Nome de usuário ou email já existe'
        : 'Erro ao registrar usuário';
      res.status(400).json({ error: msg });
    }
  };

  // ========== LOGIN DE MEMBRO ==========
  login = async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Nome de usuário e senha são obrigatórios' });
      }

      const [rows] = await db.query(
        `SELECT * FROM membros WHERE username = ? OR email = ?`,
        [username, username]
      );

      const user = rows[0];
      if (!user) {
        return res.status(401).json({ error: 'Usuário não encontrado' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: 'Senha incorreta' });
      }

      await db.execute(
        `UPDATE membros SET last_login = NOW() WHERE id = ?`,
        [user.id]
      );

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        SECRET_KEY,
        { expiresIn: '24h' }
      );

      const { password: _, ...userWithoutPassword } = user;
      res.json({ success: true, message: 'Login bem-sucedido', token, user: userWithoutPassword });
    } catch (err) {
      console.error('Erro no login:', err);
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  };

  // ========== OBTER PERFIL DO MEMBRO ==========
  getProfile = async (req, res) => {
    try {
      const { id } = req.user;

      const [rows] = await db.query(`SELECT * FROM membros WHERE id = ?`, [id]);

      const user = rows[0];
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  };

  // ========== SEGUIR/DEIXAR DE SEGUIR USUÁRIO ==========
  followUser = async (req, res) => {
    const conn = await db.getConnection();
    try {
      const { nickname } = req.params;
      const followerId = req.user.id;

      const [[targetUser]] = await conn.query(
        `SELECT id, seguidores FROM membros WHERE username = ?`,
        [nickname]
      );

      const [[follower]] = await conn.query(
        `SELECT id, seguindo, seguidores FROM membros WHERE id = ?`,
        [followerId]
      );

      if (!targetUser || !follower) {
        return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
      }

      const currentFollowing = (follower.seguindo || '')
        .toString()
        .split(',')
        .filter(Boolean);

      const isFollowing = currentFollowing.includes(targetUser.id.toString());
      const shouldFollow = req.method === 'POST';

      if (isFollowing === shouldFollow) {
        return res.status(400).json({
          success: false,
          error: shouldFollow
            ? 'Você já está seguindo este usuário'
            : 'Você não está seguindo este usuário'
        });
      }

      const newFollowingList = shouldFollow
        ? [...currentFollowing, targetUser.id]
        : currentFollowing.filter(id => id !== targetUser.id);

      const newFollowerCount = shouldFollow
        ? (targetUser.seguidores || 0) + 1
        : Math.max((targetUser.seguidores || 0) - 1, 0);

      const newFollowingCount = newFollowingList.length;

      await conn.beginTransaction();

      await conn.query(
        `UPDATE membros SET seguindo = ? WHERE id = ?`,
        [newFollowingList.join(','), followerId]
      );

      await conn.query(
        `UPDATE membros SET seguidores = ? WHERE id = ?`,
        [newFollowerCount, targetUser.id]
      );

      if (followerId === targetUser.id) {
        await conn.query(
          `UPDATE membros SET seguindo = ? WHERE id = ?`,
          [newFollowingCount, followerId]
        );
      }

      await conn.commit();

      res.json({
        success: true,
        following: shouldFollow,
        followers: newFollowerCount,
        followingCount: newFollowingCount
      });
    } catch (err) {
      await conn.rollback();
      console.error('Erro no followUser:', err);
      res.status(500).json({ success: false, error: 'Erro ao atualizar status de seguimento' });
    } finally {
      conn.release();
    }
  };

 checkFollow = async (req, res) => {
  try {
    const { nickname } = req.params;
    const follower = req.user;

    if (!follower || !follower.id) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const [[targetUser]] = await db.query(
      `SELECT id, seguidores FROM membros WHERE username = ?`,
      [nickname]
    );

    if (!targetUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const [[followerData]] = await db.query(
      `SELECT seguindo FROM membros WHERE id = ?`,
      [follower.id]
    );

    // Força conversão para string e divide corretamente
    const seguindoRaw = followerData?.seguindo ?? '';
    const followingList = String(seguindoRaw)
      .split(',')
      .filter(id => id.trim() !== '');

    const isFollowing = followingList.includes(targetUser.id.toString());

    res.json({
      success: true,
      following: isFollowing,
      followers: targetUser.seguidores || 0,
    });
  } catch (err) {
    console.error('Erro ao verificar follow:', err);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
};


  // ========== VER SEGUIDORES ==========
  viewFollowers = async (req, res) => {
    try {
      const { nickname } = req.params;

      const [[user]] = await db.query(
        `SELECT id FROM membros WHERE username = ?`,
        [nickname]
      );

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const [[countRow]] = await db.query(
        `SELECT seguidores FROM membros WHERE id = ?`,
        [user.id]
      );

      const [followers] = await db.query(
        `SELECT seguidor_id, seguidor_username FROM seguidores WHERE seguindo_id = ?`,
        [user.id]
      );

      res.json({
        success: true,
        followersCount: countRow.seguidores || 0,
        followersList: followers
      });
    } catch (err) {
      console.error('Erro ao visualizar seguidores:', err);
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  };

  // ========== CONTAR POSTS ==========
  countUserPosts = async (req, res) => {
    try {
      const { username } = req.params;

      const [[{ postCount }]] = await db.query(
        `SELECT COUNT(*) AS postCount FROM topic_replies WHERE author = ?`,
        [username]
      );

      res.json({ username, postCount: postCount || 0 });
    } catch (err) {
      console.error('Erro ao contar posts do usuário:', err);
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  };
  getAvatar = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT avatar FROM membros WHERE id = ?`,
      [req.user.id]
    );

    if (!rows[0] || !rows[0].avatar) {
      return res.status(404).send('Avatar não encontrado');
    }

    res.set('Content-Type', 'image/jpeg'); // Ajuste conforme o tipo de imagem
    res.send(rows[0].avatar);
  } catch (err) {
    console.error('Erro ao buscar avatar:', err);
    res.status(500).send('Erro interno no servidor');
  } finally {
    conn.release();
  }
};
// ========== ALTERAR AVATAR ==========
updateAvatar = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { id } = req.user;
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({
        success: false,
        error: 'URL do avatar é obrigatória'
      });
    }

    // Validação simples da URL
    try {
      new URL(avatarUrl);
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: 'URL do avatar inválida'
      });
    }

    await conn.query(
      `UPDATE membros SET avatar = ? WHERE id = ?`,
      [avatarUrl, id]
    );

    // Busca os dados atualizados do usuário
    const [[updatedUser]] = await conn.query(
      `SELECT id, username, avatar FROM membros WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Avatar atualizado com sucesso',
      user: updatedUser
    });
  } catch (err) {
    console.error('Erro ao atualizar avatar:', err);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor'
    });
  } finally {
    conn.release();
  }
};
// Atualiza a página que o membro está visualizando
updateViewingPage = async (req, res) => {
    try {
        const { username } = req.params;
        const { page } = req.body;

        if (!username || !page) {
            return res.status(400).json({ error: 'Username e página são obrigatórios' });
        }

        const sql = `UPDATE membros SET viewing_page = ?, last_activity = NOW() WHERE username = ?`;
        await db.query(sql, [page, username]);

        res.json({ success: true, message: 'Página de visualização atualizada' });
    } catch (err) {
        console.error('Erro ao atualizar página de visualização:', err);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
};

// Obtém quem está visualizando um tópico específico
getTopicViewers = async (req, res) => {
    try {
        const { topicId } = req.params;

        // Busca membros que estão visualizando este tópico (últimos 5 minutos)
        const sql = `
            SELECT username, avatar, role
            FROM membros
            WHERE viewing_page LIKE ?
            AND last_activity > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
            ORDER BY last_activity DESC
            LIMIT 20
        `;

        const [rows] = await db.query(sql, [`%/forum/topico?id=${topicId}%`]);

        // Filtra para remover duplicatas (manter apenas a última visualização)
        const uniqueViewers = [];
        const seenUsernames = new Set();

        rows.forEach(viewer => {
            if (!seenUsernames.has(viewer.username)) {
                seenUsernames.add(viewer.username);
                uniqueViewers.push(viewer);
            }
        });

        res.json({ viewers: uniqueViewers });
    } catch (err) {
        console.error('Erro ao buscar visualizadores do tópico:', err);
        res.status(500).json({ error: 'Erro interno no servidor' });
    }
};
  // ========== LISTAR TODOS OS MEMBROS ==========
  getAllMembers = async (req, res) => {
    try {
      const { username } = req.query;

      let sql = `SELECT id, username, email, role, postagens, seguindo, seguidores, avatar, data_criacao, minecraft_nick
                 FROM membros`;

      const params = [];
      if (username) {
        sql += ` WHERE username = ?`;
        params.push(username);
      }

      const [rows] = await db.query(sql, params);
      return username ? res.json(rows[0] || null) : res.json(rows);
    } catch (err) {
      console.error('Erro ao buscar membros:', err);
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  };

getMemberTopics = async (req, res) => {
    try {
      const username = decodeURIComponent(req.params.username || '');

      if (!username.trim()) {
        return res.status(400).json({ success: false, error: 'Username é obrigatório' });
      }

      const [rows] = await db.query(
        `SELECT id, data_criacao FROM membros WHERE username = ?`,
        [username]
      );

      const row = rows[0];
      if (!row) {
        return res.status(404).json({ success: false, error: 'Membro não encontrado' });
      }

      const memberData = {
        id: row.id,
        created_at: row.created_at,
      };

      res.json({ success: true, member: memberData });
    } catch (err) {
      console.error('Erro ao buscar membro:', err);
      res.status(500).json({ success: false, error: 'Erro interno no servidor' });
    }
  };
  // ========== OBTER MEMBRO POR USERNAME ==========
 getMemberByUsername = async (req, res) => {
  try {
    const username = decodeURIComponent(req.params.username || '');

    if (!username.trim()) {
      return res.status(400).json({ success: false, error: 'Username é obrigatório' });
    }

    const [rows] = await db.query(
      `SELECT
         id,
         username,
         role,
         avatar,
         data_criacao AS created_at,
         minecraft_nick,
         postagens,
         assinatura,
         seguindo,
         curtidas,
         last_login,
         viewing_page
       FROM membros
       WHERE username = ?`,
      [username]
    );

    const row = rows[0];
    if (!row) {
      return res.status(404).json({ success: false, error: 'Membro não encontrado' });
    }

    const memberData = {
      id: row.id,
      username: row.username,
      email: row.email,
      role: row.role,
      avatar: row.avatar,
      postagens: row.postagens,
      created_at: row.created_at,
      minecraft_nick: row.minecraft_nick,
      assinatura: row.assinatura,
      seguindo: row.seguindo,
      curtidas: row.curtidas,
      last_login: row.last_login,
      viewing_page: row.viewing_page,
    };

    res.json({ success: true, member: memberData });
  } catch (err) {
    console.error('Erro ao buscar membro:', err);
    res.status(500).json({ success: false, error: 'Erro interno no servidor' });
  }
};


  // ========== ATUALIZAR PÁGINA VISUALIZADA ==========
  // cache local simples
updateViewingPage = async (req, res) => {
    try {
      const username = decodeURIComponent(req.params.username || '');
      const { page } = req.body;

      if (!username || !page) {
        return res.status(400).json({ success: false, error: 'Username e página são obrigatórios' });
      }

      const [result] = await db.execute(
        `UPDATE membros
         SET viewing_page = ?, last_login = NOW()
         WHERE username = ?`,
        [page, username]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, error: 'Membro não encontrado' });
      }

      res.json({ success: true, message: 'Página visualizada atualizada com sucesso' });
    } catch (err) {
      console.error('Erro ao atualizar página visualizada:', err);
      res.status(500).json({ success: false, error: 'Erro interno no servidor' });
    }
  };
  // ========== ESTATÍSTICAS DE MEMBROS ==========
  getMembersStats = async (req, res) => {
    try {
      const [[{ total_members }]] = await db.query(
        `SELECT COUNT(id) AS total_members FROM membros`
      );

      res.json({ total_members: total_members || 0 });
    } catch (err) {
      console.error('Erro ao contar membros:', err);
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  };

  // ========== MEMBROS ONLINE ==========
  getOnlineMembers = async (req, res) => {
    try {
      const onlineThreshold = new Date(Date.now() - 15 * 60 * 1000).toISOString();

      const [[countRow]] = await db.query(
        `SELECT
           COUNT(id) AS online_count,
           (SELECT COUNT(id) FROM membros) AS total_members
         FROM membros
         WHERE last_login > ?`,
        [onlineThreshold]
      );

      const [names] = await db.query(
        `SELECT username
         FROM membros
         WHERE last_login > ?
         ORDER BY username`,
        [onlineThreshold]
      );

      res.json({
        online_members: names.map(r => r.username),
        total_members: countRow.total_members || 0,
        online_count: countRow.online_count || 0,
        last_updated: new Date().toISOString()
      });
    } catch (err) {
      console.error('Erro ao buscar membros online:', err);
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  };

  // ========== ASSINATURAS DE MEMBROS ==========
  checkAssinatura = async (req, res) => {
    try {
      const { nickname } = req.params;

      const [[row]] = await db.query(
        `SELECT assinatura FROM membros WHERE username = ?`,
        [nickname]
      );

      res.json({ assinatura: row?.assinatura || '' });
    } catch (err) {
      console.error('Erro ao buscar assinatura:', err);
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  };

  newAssinatura = async (req, res) => {
    try {
      const { nickname } = req.params;
      const { assinatura } = req.body;

      if (!assinatura || typeof assinatura !== 'string') {
        return res.status(400).json({ error: 'Assinatura inválida' });
      }

      const [result] = await db.execute(
        `UPDATE membros SET assinatura = ? WHERE username = ?`,
        [assinatura, nickname]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json({ success: true, message: 'Assinatura atualizada com sucesso' });
    } catch (err) {
      console.error('Erro ao atualizar assinatura:', err);
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  };
// ========== ALTERAR SENHA ==========
changePassword = async (req, res) => {
  const conn = await db.getConnection();
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Senha atual e nova senha são obrigatórias'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'A nova senha deve ter pelo menos 6 caracteres'
      });
    }

    // Busca o usuário e a senha atual
    const [[user]] = await conn.query(
      `SELECT password FROM membros WHERE id = ?`,
      [userId]
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Verifica a senha atual
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Senha atual incorreta'
      });
    }

    // Cria o hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualiza a senha no banco de dados
    await conn.query(
      `UPDATE membros SET password = ? WHERE id = ?`,
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });
  } catch (err) {
    console.error('Erro ao alterar senha:', err);
    res.status(500).json({
      success: false,
      error: 'Erro interno no servidor'
    });
  } finally {
    conn.release();
  }
};
  // ========== MEMBROS DETALHADOS ONLINE ==========
  getDetailedOnlineMembers = async (req, res) => {
    try {
      const onlineThreshold = new Date(Date.now() - 30 * 60 * 1000).toISOString();

      const [onlineRows] = await db.query(
        `SELECT username
         FROM membros
         WHERE last_login > ?
         ORDER BY username ASC`,
        [onlineThreshold]
      );

      const [[{ total }]] = await db.query(
        `SELECT COUNT(id) AS total FROM membros`
      );

      res.json({
        online_members: onlineRows.map(r => r.username),
        online_count: onlineRows.length,
        total_members: total,
        last_updated: new Date().toISOString()
      });
    } catch (err) {
      console.error('Erro na API detalhada de membros online:', err);
      res.status(500).json({ error: 'Erro interno', members: [] });
    }
  };
// membersController.js - Adicione ou atualize este método na sua classe MembersController
updateMemberEmail = async (req, res) => {
  try {
    const { id } = req.params; // ID do usuário cujo email será alterado (passado na URL)
    const { email } = req.body; // Novo email (passado no corpo da requisição)

    // Validação básica do corpo da requisição
    if (!email) {
      return res.status(400).json({ success: false, error: 'O novo email é obrigatório.' });
    }

    // Validação de formato de email simples (pode ser mais robusta)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'Formato de email inválido.' });
    }

    // Opcional: Verificar se o novo email já está em uso por outro membro (exceto o próprio)
    const [[emailExists]] = await db.query(
      `SELECT id FROM membros WHERE email = ? AND id != ?`,
      [email, id]
    );
    if (emailExists) {
      return res.status(409).json({ success: false, error: 'Este email já está em uso por outro membro.' });
    }

    // Busca o usuário para garantir que ele existe antes de tentar atualizar
    const [[targetUser]] = await db.query(`SELECT id, username, email FROM membros WHERE id = ?`, [id]);

    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'Membro não encontrado.' });
    }

    // Se o email não mudou, retorne uma mensagem informativa
    if (targetUser.email.toLowerCase() === email.toLowerCase()) {
      return res.status(200).json({ success: true, message: `O email do usuário ${targetUser.username} já era ${email}. Nenhuma alteração necessária.` });
    }

    // Atualiza o email no banco de dados
    const [result] = await db.execute(
      `UPDATE membros SET email = ? WHERE id = ?`,
      [email.toLowerCase(), id] // Salva em minúsculas para consistência
    );

    if (result.affectedRows === 0) {
      return res.status(500).json({ success: false, error: 'Falha ao atualizar o email do membro.' });
    }

    res.json({ success: true, message: `Email do usuário ${targetUser.username} alterado para ${email} com sucesso.` });

  } catch (err) {
    console.error('Erro ao alterar email do membro:', err);
    res.status(500).json({ success: false, error: 'Erro interno no servidor ao alterar o email.' });
  }
};
updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validação básica
    if (!role) {
      return res.status(400).json({ success: false, error: 'O novo cargo é obrigatório.' });
    }

    const validRoles = ['master', 'gerente', 'admin', 'moderador', 'ajudante', 'parceiro', 'safira', 'ruby', 'gold', 'membro'];
    if (!validRoles.includes(role.toLowerCase())) {
      return res.status(400).json({ success: false, error: 'Cargo inválido.' });
    }

    // Busca o usuário
    const [[targetUser]] = await db.query(`SELECT id, username, avatar FROM membros WHERE id = ?`, [id]);

    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'Membro não encontrado.' });
    }

    const newRoleLower = role.toLowerCase();

    // 1. Atualiza o cargo na tabela 'membros'
    const [resultMembros] = await db.execute(
      `UPDATE membros SET role = ? WHERE id = ?`,
      [newRoleLower, id]
    );

    let message = `Cargo do usuário ${targetUser.username} alterado para ${role} com sucesso.`;

    // 2. Lógica para adicionar/atualizar na tabela team_members se o cargo for específico
    const teamRoles = ['ajudante', 'moderador', 'admin', 'gerente', 'master'];

    if (teamRoles.includes(newRoleLower)) {
      // Verifica se o membro já existe na tabela team_members
      const [[existingTeamMember]] = await db.query(
        `SELECT id FROM team_members WHERE name = ?`,
        [targetUser.username]
      );

      if (existingTeamMember) {
        // Atualiza o cargo se já existir
        await db.execute(
          `UPDATE team_members SET role = ? WHERE name = ?`,
          [newRoleLower, targetUser.username]
        );
        message += ` Cargo atualizado na tabela team_members.`;
      } else {
        // Insere novo registro se não existir
        await db.execute(
          `INSERT INTO team_members (name, role, avatar, data_criacao) VALUES (?, ?, ?, NOW())`,
          [targetUser.username, newRoleLower, targetUser.avatar || `https://mc-heads.net/avatar/${targetUser.username}`]
        );
        message += ` Adicionado à tabela team_members.`;
      }
    } else {
      // Se o novo cargo NÃO for de team, remove da tabela team_members se existir
      const [deleteResult] = await db.execute(
        `DELETE FROM team_members WHERE name = ?`,
        [targetUser.username]
      );

      if (deleteResult.affectedRows > 0) {
        message += ` Removido da tabela team_members (cargo não é mais de equipe).`;
      }
    }

    res.json({ success: true, message });

  } catch (err) {
    console.error('Erro ao alterar cargo do membro:', err);
    res.status(500).json({ success: false, error: 'Erro interno no servidor.' });
  }
};

  // ========== ATUALIZAR PERFIL ==========
  updateProfile = async (req, res) => {
    try {
      const { id } = req.user;
      const { minecraftNick, assinatura } = req.body;

      if (!minecraftNick && !assinatura) {
        return res.status(400).json({ error: 'Nenhum dado válido para atualização' });
      }

      const fields = [];
      const values = [];

      if (minecraftNick) {
        fields.push('minecraft_nick = ?', 'avatar = ?');
        values.push(
          minecraftNick,
          `https://cravatar.eu/helmavatar/${encodeURIComponent(minecraftNick)}/190.png`
        );
      }

      if (assinatura) {
        fields.push('assinatura = ?');
        values.push(assinatura);
      }

      values.push(id);

      const [result] = await db.execute(
        `UPDATE membros SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      const [rows] = await db.query(
        `SELECT id, username, email, role, avatar, minecraft_nick, assinatura
         FROM membros WHERE id = ?`,
        [id]
      );

      res.json({ success: true, user: rows[0] });
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      res.status(500).json({ error: 'Erro interno no servidor' });
    }
  };
}

export default new MembersController();
