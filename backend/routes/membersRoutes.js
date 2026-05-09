import express from 'express';
import MembersController from '../controllers/membersController.js';
import { authenticateToken, checkPermission, PERMISSIONS } from '../src/config/auth.js';

const router = express.Router();

// Rotas públicas
// Rotas para rastreamento de visualização
router.put('/api/members/viewing/:username', MembersController.updateViewingPage);
router.get('/api/forum/topic/:topicId/viewers', MembersController.getTopicViewers);
router.get('/api/members', MembersController.getAllMembers);
router.get('/api/members/topic/:username', MembersController.getMemberTopics);
router.get('/api/members/:username', MembersController.getMemberByUsername);
router.put('/api/members/viewing/:username', MembersController.updateViewingPage);
router.post('/api/auth/change-password', authenticateToken, MembersController.changePassword);

router.get('/api/members/stats/total', MembersController.getMembersStats);
router.get('/api/members/online', MembersController.getOnlineMembers);
router.get('/api/members/online/list', MembersController.getDetailedOnlineMembers);
router.get('/api/members/:username/posts', MembersController.countUserPosts);
router.post('/api/members/avatar', authenticateToken, MembersController.updateAvatar);
router.get('api/members/avatar', authenticateToken, MembersController.getAvatar);
router.post('/api/members/novo-role/:id', authenticateToken, MembersController.updateRole);
router.post('/api/members/:id/email', authenticateToken, MembersController.updateMemberEmail);

// routes.js
router.post('/api/seguir/:nickname', authenticateToken, MembersController.followUser);
router.delete('/api/seguir/:nickname', authenticateToken, MembersController.followUser);
router.get('/api/seguir/check/:nickname', authenticateToken, MembersController.checkFollow);

router.get('/api/assinatura/:nickname', authenticateToken, MembersController.checkAssinatura);
router.post('/api/assinatura/new/:nickname', authenticateToken, MembersController.newAssinatura);


export default router;
