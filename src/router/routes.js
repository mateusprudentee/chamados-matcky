const routes = [
  // Rotas públicas (não exigem captcha)
  {
    path: '/captcha',
    component: () => import('pages/CaptchaPage.vue'),
    meta: { public: true, pageTitle: 'Verificação de Segurança' }
  },
  {
    path: '/recuperar-senha',
    component: () => import('pages/Forgot.vue'),
    meta: { public: true, pageTitle: 'Recuperar Senha' }
  },
  {
    path: '/login',
    component: () => import('layouts/AuthLayout.vue'),
    meta: { public: true },
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('pages/LoginPage.vue'),
        meta: { public: true, requiresGuest: true, pageTitle: 'Login' }
      }
    ]
  },



  // Rotas protegidas (exigem captcha e autenticação)
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { public: false },
    children: [
      {
        path: '',
        component: () => import('pages/HomePage.vue'),
        meta: { pageTitle: 'Página Inicial' }
      },
      {
        path: 'dashboard',
        component: () => import('pages/DashboardPage.vue'),
        meta: { pageTitle: 'Dashboard' }
      },
      {
        path: 'novo',
        component: () => import('../chamados/NovoChamado.vue'),
        meta: { pageTitle: 'Novo Chamado' }
      },
      {
        path: 'chamados',
        component: () => import('../chamados/Chamados.vue'),
        meta: { pageTitle: 'Meus Chamados' }
      },
      {
        path: 'excluidos',
        component: () => import('../chamados/Excluidos.vue'),
        meta: { pageTitle: 'Chamados Excluídos' }
      },
      {
        path: 'perfil',
        component: () => import('../perfil/Perfil.vue'),
        meta: { pageTitle: 'Perfil' }
      },
    ]
  },



  // Página 404 - Deve ser a última rota
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorPage.vue'),
    meta: { public: true, pageTitle: 'Página não encontrada' }
  }
]

export default routes
