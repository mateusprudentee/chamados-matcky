const routes = [
{
  path: '/captcha',
  component: () => import('pages/CaptchaPage.vue'),
  meta: { public: true }
},
  {
    path: '/login',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('pages/LoginPage.vue'),
        meta: { public: true }
      }
    ]
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { public: false },
    children: [
      { path: '', component: () => import('pages/HomePage.vue') },
      { path: 'dashboard', component: () => import('pages/DashboardPage.vue') },
      { path: 'novo', component: () => import('../chamados/NovoChamado.vue') },
      { path: 'chamados', component: () => import('../chamados/Chamados.vue') },
       { path: 'excluidos', component: () => import('../chamados/Excluidos.vue') },
    ]
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorPage.vue'),
    meta: { public: true }
  }
]

export default routes
