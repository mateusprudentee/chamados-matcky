
<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Header -->
      <div class="login-header">
        <div class="logo-icon"></div>
        <p class="login-title">Criar Conta</p>

      </div>

      <!-- Form -->
      <form @submit.prevent="handleRegister" class="login-form">

        <!-- Username -->
        <div class="input-group">
          <label class="input-label">Usuário</label>
          <div class="input-wrapper">
            <svg class="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="6" r="4" stroke="currentColor" stroke-width="1.5"/>
              <path d="M3 17C3 13.6863 5.68629 11 9 11H11C14.3137 11 17 13.6863 17 17" stroke="currentColor" stroke-width="1.5"/>
            </svg>

           <input
  v-model="form.username"
  type="text"
  placeholder="Seu usuário"
  class="input-field"
  maxlength="20"
  pattern="[A-Za-z0-9]+"
  @input="form.username = form.username.replace(/[^A-Za-z0-9]/g, '')"
/>
          </div>
        </div>

        <!-- Email -->
        <div class="input-group">
          <label class="input-label">Email</label>
          <div class="input-wrapper">
            <svg class="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 4H17C18.1046 4 19 4.89543 19 6V14C19 15.1046 18.1046 16 17 16H3C1.89543 16 1 15.1046 1 14V6C1 4.89543 1.89543 4 3 4Z" stroke="currentColor" stroke-width="1.5"/>
              <path d="M1 6L10 11L19 6" stroke="currentColor" stroke-width="1.5"/>
            </svg>

            <input
              v-model="form.email"
              type="email"
              placeholder="seu@email.com"
              class="input-field"
            />
          </div>
        </div>



        <!-- Password -->
        <div class="input-group">
          <label class="input-label">Senha</label>
          <div class="input-wrapper">
            <svg class="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="8" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M6 8V5C6 2.79086 7.79086 1 10 1C12.2091 1 14 2.79086 14 5V8" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="10" cy="13" r="1" fill="currentColor"/>
            </svg>

            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="input-field"
            />

            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              👁
            </button>
          </div>
        </div>

        <!-- Signature -->
        <div class="input-group">
          <label class="input-label">Assinatura</label>
          <textarea
            v-model="form.assinatura"
            placeholder="Digite sua assinatura..."
            class="textarea-field"
          ></textarea>
        </div>

        <!-- Terms -->
        <p class="terms-text">
  Ao criar uma conta, você confirma estar ciente de que este sistema é privado e que os dados informados serão utilizados apenas para autenticação de acesso.
</p>

        <!-- Message -->
        <div
          v-if="message.text"
          :class="['message-box', message.type]"
        >
          {{ message.text }}
        </div>

        <!-- Button -->
        <button
          type="submit"
          class="submit-btn"
          :disabled="loading"
        >
          <span v-if="!loading">Criar Conta</span>
          <span v-else class="loading-spinner"></span>
        </button>

        <!-- Login -->
        <button
          type="button"
          class="register-btn"
          @click="goToLogin"
        >
          Já tenho conta
        </button>

      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
export default {
  name: 'RegisterPage'
,
  setup() {
    const router = useRouter()

    const loading = ref(false)
    const showPassword = ref(false)

    const form = ref({
      username: '',
      email: '',
      password: '',
      assinatura: '',

      // defaults
      role: 'user',
      avatar: '',
      seguidores: 0,
      seguindo: 0,
      curtidas: 0,
      postagens: 0,
      verified: false,
      viewing_page: '',
    })

    const message = ref({
      text: '',
      type: ''
    })

    const showMessage = (type, text) => {
      message.value = { type, text }
    }

    const validateForm = () => {
      if (
        !form.value.username ||
        !form.value.email ||
        !form.value.password
      ) {
        showMessage('error', 'Preencha todos os campos obrigatórios')
        return false
      }

      if (form.value.password.length < 6) {
        showMessage('error', 'A senha deve ter pelo menos 6 caracteres')
        return false
      }

      return true
    }

    const handleRegister = async () => {
      if (!validateForm()) return

      loading.value = true

      try {
        const response = await fetch('https://chamados-backend-4efw.onrender.com/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(form.value)
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao criar conta')
        }

        showMessage('success', 'Conta criada com sucesso!')

        setTimeout(() => {
          router.push('/login')
        }, 2000)

      } catch (error) {
        showMessage('error', error.message)
      } finally {
        loading.value = false
      }
    }

    const goToLogin = () => {
      router.push('/login')
    }

    return {
      form,
      loading,
      showPassword,
      message,
      handleRegister,
      goToLogin
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.login-container {
  width: 100%;
  max-width: 440px;
  background: white;
  border-radius: 24px;
  padding: 48px 40px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 1px 2px rgba(0, 0, 0, 0.06),
    0 20px 60px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.login-container::before {
  content: '';
  position: absolute;
  inset: 0 0 auto 0;
  height: 3px;
  background: linear-gradient(90deg, #1100ff, #2913a7, #0051ff);
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.logo-icon {
  display: inline-flex;
  margin-bottom: 24px;
  background-image: url("https://i.imgur.com/THfDr9W.png");
  background-size: cover;
  background-position: center;
  height: 70px;
  width: 90px;
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
}

.login-subtitle {
  font-size: 14px;
  color: #666;
  margin-top: -10px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  text-transform: uppercase;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: #999;
}

.input-field {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 2px solid #e5e5e5;
  border-radius: 12px;
  font-size: 15px;
  outline: none;
  transition: .2s;
}

.input-field:focus,
.textarea-field:focus {
  border-color: #1a1a1a;
  box-shadow: 0 0 0 4px rgba(0,0,0,.05);
}

.textarea-field {
  width: 100%;
  min-height: 100px;
  resize: none;
  border: 2px solid #e5e5e5;
  border-radius: 12px;
  padding: 14px;
  font-size: 15px;
  outline: none;
  transition: .2s;
}

.toggle-password {
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
}

.terms-text {
  font-size: 12px;
  color: #999;
  line-height: 1.6;
}

.terms-link {
  color: #1a1a1a;
}

.message-box {
  padding: 14px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

.message-box.success {
  background: #f0fdf4;
  color: #166534;
}

.message-box.error {
  background: #fef2f2;
  color: #991b1b;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(90deg, #1100ff, #2913a7, #0051ff);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: .2s;
}

.submit-btn:hover {
  transform: translateY(-1px);
}

.register-btn {
  width: 100%;
  padding: 16px;
  background: transparent;
  border: 2px solid #e5e5e5;
  border-radius: 12px;
  cursor: pointer;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: white;
  border-radius: 50%;
  display: inline-block;
  animation: spin .6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 32px 24px;
  }
}
</style>
