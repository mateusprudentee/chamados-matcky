<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Header -->
      <div class="login-header">
        <div class="logo-icon"></div>
        <p class="login-title">Recuperar Senha</p>
      </div>

      <!-- Step 1: Request Email -->
      <form v-if="step === 1" @submit.prevent="requestResetCode" class="login-form">
        <div class="input-group">
          <label class="input-label">Email</label>
          <div class="input-wrapper">
            <svg class="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 4H17C18.1046 4 19 4.89543 19 6V14C19 15.1046 18.1046 16 17 16H3C1.89543 16 1 15.1046 1 14V6C1 4.89543 1.89543 4 3 4Z" stroke="currentColor" stroke-width="1.5"/>
              <path d="M1 6L10 11L19 6" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            <input
              v-model="email"
              type="email"
              placeholder="seu@email.com"
              class="input-field"
              autocomplete="email"
            />
          </div>
        </div>

        <!-- Message box -->
        <div
          v-if="message.text"
          :class="['message-box', message.type]"
        >
          <svg v-if="message.type === 'error'" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>
            <path d="M10 6V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="10" cy="14" r="0.5" fill="currentColor"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>
            <path d="M6 10L9 13L14 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ message.text }}</span>
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          class="submit-btn"
          :disabled="loading"
        >
          <span v-if="!loading">Enviar Código</span>
          <span v-else class="loading-spinner"></span>
        </button>

        <!-- Voltar para Login -->
        <button type="button" class="register-btn" @click="goToLogin">
          Voltar para o Login
        </button>
      </form>

      <!-- Step 2: Enter Code & Captcha -->
      <form v-if="step === 2" @submit.prevent="verifyCodeAndCaptcha" class="login-form">
        <p class="verification-text">
          Enviamos um código de 6 dígitos para <strong>{{ email }}</strong>
        </p>

        <div class="captcha-inputs">
          <input
            v-for="(digit, index) in codeDigits"
            :key="index"
            v-model="codeDigits[index]"
            type="text"
            maxlength="1"
            class="captcha-digit"
            :ref="el => digitRefs[index] = el"
            @input="handleCodeInput(index)"
            @keydown="handleCodeKeydown(index, $event)"
            @paste="handleCodePaste"
            autocomplete="off"
          />
        </div>

        <!-- Captcha Dialog -->
        <div v-if="showCaptcha" class="captcha-overlay">
          <div class="captcha-dialog">
            <div class="captcha-header">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#1a1a1a"/>
                <path d="M8 16L14 22L24 10" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <h2>Verificação de Segurança</h2>
              <p>Digite o código de segurança para confirmar a alteração de senha.</p>
            </div>

            <div class="captcha-inputs">
              <input
                v-for="(digit, index) in captchaDigits"
                :key="index"
                v-model="captchaDigits[index]"
                type="text"
                maxlength="1"
                class="captcha-digit"
                :ref="el => captchaDigitRefs[index] = el"
                @input="handleCaptchaInput(index)"
                @keydown="handleCaptchaKeydown(index, $event)"
                @paste="handleCaptchaPaste"
                autocomplete="off"
              />
            </div>

            <div v-if="captchaError" class="captcha-error">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/>
                <path d="M8 5V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <circle cx="8" cy="11" r="0.5" fill="currentColor"/>
              </svg>
              Código inválido. Tente novamente.
            </div>

            <div class="captcha-actions">
              <button type="button" class="captcha-btn secondary" @click="closeCaptcha">
                Cancelar
              </button>
              <button
                type="button"
                class="captcha-btn primary"
                @click="verifyCaptchaOnly"
                :disabled="isCaptchaIncomplete"
              >
                Verificar
              </button>
            </div>
          </div>
        </div>

        <!-- Message box -->
        <div
          v-if="message.text"
          :class="['message-box', message.type]"
        >
          <svg v-if="message.type === 'error'" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>
            <path d="M10 6V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="10" cy="14" r="0.5" fill="currentColor"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>
            <path d="M6 10L9 13L14 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ message.text }}</span>
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          class="submit-btn"
          :disabled="loading || isCodeIncomplete"
        >
          <span v-if="!loading">Verificar Código</span>
          <span v-else class="loading-spinner"></span>
        </button>

        <div class="resend-section">
          <span>Não recebeu o código?</span>
          <button type="button" class="resend-btn" @click="resendCode" :disabled="resendCountdown > 0">
            {{ resendCountdown > 0 ? `Reenviar em ${resendCountdown}s` : 'Reenviar Código' }}
          </button>
        </div>
      </form>

      <!-- Step 3: New Password -->
      <form v-if="step === 3" @submit.prevent="changePassword" class="login-form">
        <div class="input-group">
          <label class="input-label">Nova Senha</label>
          <div class="input-wrapper">
            <svg class="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="8" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M6 8V5C6 2.79086 7.79086 1 10 1C12.2091 1 14 2.79086 14 5V8" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="10" cy="13" r="1" fill="currentColor"/>
            </svg>
            <input
              v-model="newPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="input-field"
              autocomplete="new-password"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              <svg v-if="!showPassword" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4C4 4 1 10 1 10C1 10 4 16 10 16C16 16 19 10 19 10C19 10 16 4 10 4Z" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="10" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M1 1L19 19M10 4C4 4 1 10 1 10C1 10 4 16 10 16C13 16 15.5 14 17 11.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="input-group">
          <label class="input-label">Confirmar Nova Senha</label>
          <div class="input-wrapper">
            <svg class="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="8" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
              <path d="M6 8V5C6 2.79086 7.79086 1 10 1C12.2091 1 14 2.79086 14 5V8" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="10" cy="13" r="1" fill="currentColor"/>
            </svg>
            <input
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="input-field"
              autocomplete="new-password"
            />
          </div>
        </div>

        <div class="password-requirements">
          <p>A senha deve conter:</p>
          <ul>
            <li :class="{ valid: newPassword.length >= 6 }">Mínimo de 6 caracteres</li>
            <li :class="{ valid: /[A-Z]/.test(newPassword) }">Pelo menos 1 letra maiúscula</li>
            <li :class="{ valid: /\d/.test(newPassword) }">Pelo menos 1 número</li>
          </ul>
        </div>

        <!-- Terms text -->
        <p class="terms-text">
          Ao alterar sua senha você concorda com nossos
          <a href="#" class="terms-link">Termos de uso</a> e
          <a href="#" class="terms-link">Política de Privacidade</a>.
        </p>

        <!-- Message box -->
        <div
          v-if="message.text"
          :class="['message-box', message.type]"
        >
          <svg v-if="message.type === 'error'" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>
            <path d="M10 6V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <circle cx="10" cy="14" r="0.5" fill="currentColor"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>
            <path d="M6 10L9 13L14 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>{{ message.text }}</span>
          <span v-if="message.countdown" class="countdown">
            Redirecionando em {{ message.countdown }}s...
          </span>
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          class="submit-btn"
          :disabled="loading"
        >
          <span v-if="!loading">Alterar Senha</span>
          <span v-else class="loading-spinner"></span>
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'ForgotPassword'
,
  setup() {
    const router = useRouter()
    const API_URL = 'https://boom-matcky.onrender.com/api'

    const step = ref(1)
    const email = ref('')
    const codeDigits = ref(['', '', '', '', '', ''])
    const newPassword = ref('')
    const confirmPassword = ref('')
    const showPassword = ref(false)
    const loading = ref(false)
    const resendCountdown = ref(0)
    const resetToken = ref('')
    const digitRefs = ref([])

    // Captcha
    const showCaptcha = ref(false)
    const captchaDigits = ref(['', '', '', '', '', ''])
    const captchaError = ref(false)
    const captchaDigitRefs = ref([])
    const captchaVerified = ref(false)

    const CAPTCHA_CODE = '012698'

    const message = ref({
      text: '',
      type: '',
      countdown: 0
    })

    const isCodeIncomplete = computed(() => {
      return codeDigits.value.some(digit => digit === '')
    })

    const isCaptchaIncomplete = computed(() => {
      return captchaDigits.value.some(digit => digit === '')
    })

    const showMessage = (type, text, redirect = false) => {
      message.value = { text, type, countdown: 0 }

      if (redirect) {
        message.value.countdown = 3
        const timer = setInterval(() => {
          message.value.countdown--
          if (message.value.countdown <= 0) {
            clearInterval(timer)
            router.push('/login')
          }
        }, 1000)
      }
    }

    // Step 1: Request Reset Code
    const requestResetCode = async () => {
      message.value = { text: '', type: '', countdown: 0 }

      if (!email.value) {
        showMessage('error', 'Email é obrigatório')
        return
      }

      loading.value = true
      try {
        const response = await fetch(`${API_URL}/auth/forgot-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: email.value })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao enviar código')
        }

        showMessage('success', 'Código enviado para seu email!')
        startResendCountdown()
        step.value = 2
      } catch (error) {
        showMessage('error', error.message || 'Falha ao enviar código')
      } finally {
        loading.value = false
      }
    }

    // Code Input Handlers
    const handleCodeInput = (index) => {
      if (codeDigits.value[index] && index < 5) {
        nextTick(() => {
          digitRefs.value[index + 1]?.focus()
        })
      }
    }

    const handleCodeKeydown = (index, event) => {
      if (event.key === 'Backspace' && !codeDigits.value[index] && index > 0) {
        nextTick(() => {
          digitRefs.value[index - 1]?.focus()
        })
      }
    }

    const handleCodePaste = (event) => {
      event.preventDefault()
      const pastedData = event.clipboardData.getData('text')
      const numbers = pastedData.replace(/\D/g, '').slice(0, 6)

      if (numbers.length > 0) {
        numbers.split('').forEach((num, index) => {
          if (index < 6) {
            codeDigits.value[index] = num
          }
        })

        const lastIndex = Math.min(numbers.length - 1, 5)
        nextTick(() => {
          digitRefs.value[lastIndex]?.focus()
        })
      }
    }

    // Captcha Input Handlers
    const handleCaptchaInput = (index) => {
      captchaError.value = false
      if (captchaDigits.value[index] && index < 5) {
        nextTick(() => {
          captchaDigitRefs.value[index + 1]?.focus()
        })
      }
    }

    const handleCaptchaKeydown = (index, event) => {
      if (event.key === 'Backspace' && !captchaDigits.value[index] && index > 0) {
        nextTick(() => {
          captchaDigitRefs.value[index - 1]?.focus()
        })
      }
    }

    const handleCaptchaPaste = (event) => {
      event.preventDefault()
      const pastedData = event.clipboardData.getData('text')
      const numbers = pastedData.replace(/\D/g, '').slice(0, 6)

      if (numbers.length > 0) {
        numbers.split('').forEach((num, index) => {
          if (index < 6) {
            captchaDigits.value[index] = num
          }
        })

        const lastIndex = Math.min(numbers.length - 1, 5)
        nextTick(() => {
          captchaDigitRefs.value[lastIndex]?.focus()
        })
      }
    }

    const verifyCaptchaOnly = () => {
      const code = captchaDigits.value.join('')

      if (code === CAPTCHA_CODE) {
        captchaVerified.value = true
        showCaptcha.value = false
        captchaError.value = false
        showMessage('success', 'Código de segurança verificado!')

        // Agora verifica o código de reset
        verifyResetCode()
      } else {
        captchaError.value = true
        captchaDigits.value = ['', '', '', '', '', '']
        nextTick(() => {
          captchaDigitRefs.value[0]?.focus()
        })
      }
    }

    const closeCaptcha = () => {
      showCaptcha.value = false
      captchaDigits.value = ['', '', '', '', '', '']
      captchaError.value = false
    }

    // Step 2: Verify Code with Captcha
    const verifyCodeAndCaptcha = async () => {
      message.value = { text: '', type: '', countdown: 0 }
      const code = codeDigits.value.join('')

      if (code.length !== 6) {
        showMessage('error', 'Código deve ter 6 dígitos')
        return
      }

      // Primeiro mostra o captcha
      showCaptcha.value = true
    }

    const verifyResetCode = async () => {
      const code = codeDigits.value.join('')

      loading.value = true
      try {
        const response = await fetch(`${API_URL}/auth/verify-reset-code`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email.value,
            code: code
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Código inválido')
        }

        resetToken.value = data.token
        showMessage('success', 'Código verificado com sucesso!')
        step.value = 3
      } catch (error) {
        showMessage('error', error.message || 'Código inválido')
        codeDigits.value = ['', '', '', '', '', '']
        captchaVerified.value = false
      } finally {
        loading.value = false
      }
    }

    // Resend Code
    const resendCode = async () => {
      if (resendCountdown.value > 0) return

      loading.value = true
      try {
        const response = await fetch(`${API_URL}/auth/resend-reset-code`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: email.value })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao reenviar código')
        }

        showMessage('success', 'Novo código enviado!')
        startResendCountdown()
        codeDigits.value = ['', '', '', '', '', '']
      } catch (error) {
        showMessage('error', error.message || 'Falha ao reenviar código')
      } finally {
        loading.value = false
      }
    }

    const startResendCountdown = () => {
      resendCountdown.value = 30
      const timer = setInterval(() => {
        resendCountdown.value--
        if (resendCountdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    }

    // Step 3: Change Password
    const changePassword = async () => {
      message.value = { text: '', type: '', countdown: 0 }

      if (newPassword.value.length < 6) {
        showMessage('error', 'A senha deve ter pelo menos 6 caracteres')
        return
      }

      if (newPassword.value !== confirmPassword.value) {
        showMessage('error', 'As senhas não conferem')
        return
      }

      loading.value = true
      try {
        const response = await fetch(`${API_URL}/auth/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resetToken.value}`
          },
          body: JSON.stringify({
            newPassword: newPassword.value
          })
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao alterar senha')
        }

        showMessage('success', 'Senha alterada com sucesso!', true)
      } catch (error) {
        showMessage('error', error.message || 'Falha ao alterar senha')
      } finally {
        loading.value = false
      }
    }

    const goToLogin = () => {
      router.push('/login')
    }

    return {
      step,
      email,
      codeDigits,
      newPassword,
      confirmPassword,
      showPassword,
      loading,
      resendCountdown,
      message,
      isCodeIncomplete,
      digitRefs,
      showCaptcha,
      captchaDigits,
      captchaError,
      captchaDigitRefs,
      isCaptchaIncomplete,
      captchaVerified,
      requestResetCode,
      handleCodeInput,
      handleCodeKeydown,
      handleCodePaste,
      handleCaptchaInput,
      handleCaptchaKeydown,
      handleCaptchaPaste,
      verifyCodeAndCaptcha,
      verifyCaptchaOnly,
      closeCaptcha,
      resendCode,
      changePassword,
      goToLogin
    }
  }
}
</script>

<style scoped>
/* Reset & Base */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Container */
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
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #1100ff, #2913a7, #0051ff);
}

/* Header */
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
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.login-subtitle {
  font-size: 15px;
  color: #666;
  margin: 0;
  font-weight: 400;
  line-height: 1.5;
  margin-top: -25px;
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Input Groups */
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
  letter-spacing: 0.5px;
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
  pointer-events: none;
  transition: color 0.2s ease;
}

.input-field {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 2px solid #e5e5e5;
  border-radius: 12px;
  font-size: 15px;
  color: #1a1a1a;
  background: white;
  transition: all 0.2s ease;
  outline: none;
  font-family: inherit;
}

.input-field::placeholder {
  color: #bbb;
}

.input-field:focus {
  border-color: #1a1a1a;
  box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.05);
}

.input-field:focus ~ .input-icon,
.input-wrapper:focus-within .input-icon {
  color: #1a1a1a;
}

/* Toggle Password */
.toggle-password {
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #999;
  display: flex;
  align-items: center;
  transition: color 0.2s ease;
}

.toggle-password:hover {
  color: #1a1a1a;
}

/* Terms */
.terms-text {
  font-size: 12px;
  color: #999;
  line-height: 1.6;
  margin: 0;
  text-align: left;
}

.terms-link {
  color: #1a1a1a;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.2s ease;
}

.terms-link:hover {
  color: #666;
}

/* Verification Text */
.verification-text {
  text-align: center;
  color: #333;
  font-size: 14px;
  margin-bottom: 24px;
}

.verification-text strong {
  color: #1a1a1a;
}

/* Code Inputs */
.captcha-inputs {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
}

.captcha-digit {
  width: 52px;
  height: 64px;
  border: 2px solid #e5e5e5;
  border-radius: 12px;
  text-align: center;
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  background: #fafafa;
  transition: all 0.2s ease;
  outline: none;
  font-family: inherit;
}

.captcha-digit:focus {
  border-color: #1a1a1a;
  background: white;
  box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.05);
}

/* Password Requirements */
.password-requirements {
  background: #f8f8f8;
  border-radius: 8px;
  padding: 12px;
  font-size: 12px;
}

.password-requirements p {
  margin: 0 0 8px 0;
  color: #666;
  font-weight: 500;
}

.password-requirements ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.password-requirements li {
  color: #999;
  margin-bottom: 4px;
}

.password-requirements li::before {
  content: '○ ';
  color: #ccc;
}

.password-requirements li.valid {
  color: #16a34a;
}

.password-requirements li.valid::before {
  content: '✓ ';
  color: #16a34a;
}

/* Message Box */
.message-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  animation: slideIn 0.3s ease;
}

.message-box.success {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.message-box.error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.countdown {
  margin-left: auto;
  font-size: 13px;
  font-weight: 400;
  opacity: 0.8;
}

/* Buttons */
.submit-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(90deg, #1100ff, #2913a7, #0051ff);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  margin-top: 8px;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(90deg, #1100ffc2, #2913a7, #0051ff);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.register-btn {
  width: 100%;
  padding: 16px;
  background: transparent;
  color: #666;
  border: 2px solid #e5e5e5;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.register-btn:hover {
  border-color: #1a1a1a;
  color: #1a1a1a;
  background: #fafafa;
}

/* Resend Section */
.resend-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
}

.resend-btn {
  background: none;
  border: none;
  color: #1a1a1a;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  font-size: 13px;
}

.resend-btn:disabled {
  color: #999;
  cursor: not-allowed;
  text-decoration: none;
}

/* Loading Spinner */
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.6s linear infinite;
}

/* Captcha Overlay */
.captcha-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
  backdrop-filter: blur(4px);
}

.captcha-dialog {
  background: white;
  border-radius: 24px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  animation: slideUp 0.3s ease;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.15);
}

.captcha-header {
  text-align: center;
  margin-bottom: 32px;
}

.captcha-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 16px 0 8px 0;
  letter-spacing: -0.3px;
}

.captcha-header p {
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.captcha-error {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #dc2626;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 16px;
  justify-content: center;
  animation: shake 0.5s ease;
}

.captcha-actions {
  display: flex;
  gap: 12px;
}

.captcha-btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.captcha-btn.primary {
  background: #1a1a1a;
  color: white;
}

.captcha-btn.primary:hover:not(:disabled) {
  background: #333;
}

.captcha-btn.primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.captcha-btn.secondary {
  background: #f5f5f5;
  color: #666;
}

.captcha-btn.secondary:hover {
  background: #eee;
  color: #333;
}

/* Animations */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 480px) {
  .login-container {
    padding: 32px 24px;
  }

  .captcha-dialog {
    padding: 32px 24px;
  }

  .captcha-digit {
    width: 44px;
    height: 56px;
    font-size: 20px;
  }

  .captcha-inputs {
    gap: 8px;
  }
}
</style>
