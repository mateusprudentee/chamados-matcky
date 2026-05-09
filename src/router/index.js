import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'

export default defineRouter(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

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

  Router.beforeEach((to, from, next) => {
    // 1. Verifica se a rota ou algum pai dela é público
    const isPublic = to.matched.some(record => record.meta.public)

    // 2. Se a rota NÃO é pública e o captcha NÃO está ok -> Vai para o Captcha
    if (!isPublic && !isCaptchaOk()) {
      // Evita redirecionar se já estiver indo para o captcha (prevenção de loop)
      if (to.path !== '/login') {
        return next('/login')
      }
    }

    // 3. Se o captcha JÁ está ok e o usuário tenta ir para o /captcha manualmente
    if (isCaptchaOk() && to.path === '/captcha') {
      return next('/')
    }

    // 4. Caso contrário, segue o fluxo normal
    next()
  })

  return Router
})
