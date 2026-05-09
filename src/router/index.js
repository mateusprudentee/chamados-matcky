import { createRouter, createWebHistory } from 'vue-router'
import routes from './routes'
import axios from 'axios'

// Constantes de roles
const ROLES = {
  MASTER: 'master',
  MANAGER: 'gerente',
  ADMIN: 'admin',
  MODERATOR: 'moderador',
  HELPER: 'ajudante',
  MEMBER: 'membro',
  GUEST: 'guest'
}

// Função auxiliar para checar validade do captcha
const isCaptchaOk = () => {
  const expire = localStorage.getItem('captcha_expire')
  if (!expire) return false

  if (Date.now() > Number(expire)) {
    localStorage.removeItem('captcha_expire')
    return false
  }
  return true
}

// Função para atualizar a página que o usuário está visualizando
const updateViewingPage = async (username, pageDescription) => {
  if (!username) return

  try {
    const sanitizedPage = pageDescription.length > 100
      ? pageDescription.substring(0, 97) + '...'
      : pageDescription

    await axios.put(
      `${import.meta.env.VITE_API_URL || 'https://boom-matcky.onrender.com'}/api/members/viewing/${encodeURIComponent(username)}`,
      { page: sanitizedPage },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        }
      }
    )
  } catch (error) {
    console.error('Erro ao atualizar página visualizada:', error)
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Middleware global de navegação
router.beforeEach(async (to, from, next) => {
  // 1. Verifica se a rota ou algum pai dela é pública
  const isPublic = to.matched.some(record => record.meta.public)

  // 2. Se a rota NÃO é pública e o captcha NÃO está ok -> Vai para o Captcha
  if (!isPublic && !isCaptchaOk()) {
    // Evita redirecionar se já estiver indo para o captcha (prevenção de loop)
    if (to.path !== '/captcha' && to.path !== '/login') {
      return next('/captcha')
    }
  }

  // 3. Se o captcha JÁ está ok e o usuário tenta ir para o /captcha manualmente
  if (isCaptchaOk() && to.path === '/captcha') {
    return next('/')
  }

  // 4. Verificação de autenticação para rotas protegidas
  const authToken = localStorage.getItem('authToken')
  let userData = JSON.parse(localStorage.getItem('userData') || '{}')

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authToken) {
      return next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
    }

    // Tenta validar o token e obter dados atualizados do usuário
    if (!userData.role) {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'https://boom-matcky.onrender.com'}/api/auth/me`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        )

        if (response.data) {
          localStorage.setItem('userData', JSON.stringify(response.data))
          userData = response.data
        }
      } catch (error) {
        console.error('Erro na validação do token:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
        localStorage.removeItem('captcha_expire')
        return next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
      }
    }
  }

  // 5. Verificação de roles/permissões
  const requiredRoles = to.meta.requiredRole
  if (requiredRoles) {
    if (!authToken || !userData.role) {
      return next({ path: '/login', query: { redirect: to.fullPath } })
    }

    // Converte para array se for string única
    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]

    // Verifica se o usuário tem alguma das roles necessárias
    const hasPermission = rolesArray.some(role =>
      userData.role?.toLowerCase() === role.toLowerCase()
    )

    if (!hasPermission) {
      return next('/404')
    }
  }

  // 6. Rotas para visitantes (não logados)
  if (to.matched.some(record => record.meta.requiresGuest)) {
    if (authToken && isCaptchaOk()) {
      return next('/')
    }
  }

  // 7. Verifica se o usuário existe (para rotas de perfil)
  if (to.name === 'Perfil') {
    try {
      const username = to.params.username
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'https://boom-matcky.onrender.com'}/api/members/${encodeURIComponent(username)}`,
        { validateStatus: status => status < 500 }
      )

      if (response.status === 404) {
        return next('/404')
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error)
      return next('/404')
    }
  }

  // 8. Atualiza a página visualizada se o usuário estiver logado
  if (authToken && userData.username && isCaptchaOk()) {
    let pageDescription = to.meta.pageTitle || 'Página desconhecida'

    // Descrições personalizadas para rotas específicas
    if (to.name === 'Perfil') {
      pageDescription = `perfil de ${to.params.username}`
    } else if (to.name === 'ForumCategoryView') {
      pageDescription = `categoria ${to.params.category}`
    } else if (to.name === 'ForumSubcategoryView') {
      pageDescription = `subcategoria ${to.params.subcategory}`
    } else if (to.name === 'ForumTopic' || to.name === 'ForumTopicNoCategory' || to.name === 'ForumTopicWithSubcategory') {
      pageDescription = `tópico "${to.params.topic || to.params.id}"`
    } else if (to.name === 'ForumNew') {
      pageDescription = to.params.subcategory
        ? `criando tópico em ${to.params.category}/${to.params.subcategory}`
        : `criando tópico em ${to.params.category}`
    } else if (to.name === 'Config') {
      pageDescription = 'configurações de perfil'
    } else if (to.name === 'Admin') {
      pageDescription = 'painel administrativo'
    }

    // Atualiza no servidor sem bloquear a navegação
    updateViewingPage(userData.username, pageDescription)
  }

  next()
})

export default router
