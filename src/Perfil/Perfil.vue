<template>
  <q-layout view="hHh Lpr fFf">
    <q-page-container>
      <q-page class="q-pa-lg">
        <div class="container">
          <!-- Cabeçalho da Página -->
          <div class="row q-mb-lg">
            <div class="col-12">
              <div class="flex justify-between items-center">
                <div>
                  <div class="text-h5 text-weight-medium">
                    <q-icon name="person" size="28px" color="primary" class="q-mr-sm" />
                    Meu Perfil
                  </div>
                  <div class="text-subtitle2 text-grey-7 q-mt-sm">
                    Gerencie suas informações pessoais e configurações
                  </div>
                </div>
                <div>

                  <q-btn
                    flat
                    round
                    dense
                    icon="refresh"
                    @click="recarregarDados"
                    :loading="recarregando"
                  >
                    <q-tooltip>Recarregar dados</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading com Skeleton -->
          <div v-if="loadingInicial" class="row q-col-gutter-xl">
            <div class="col-12 col-md-4">
              <q-skeleton type="rect" height="400px" animation="wave" />
            </div>
            <div class="col-12 col-md-8">
              <q-skeleton type="rect" height="600px" animation="wave" />
            </div>
          </div>

          <!-- Mensagem de Erro -->
          <div v-else-if="erroCarregamento" class="text-center q-pa-xl">
            <q-icon name="error_outline" size="64px" color="negative" />
            <div class="text-h6 text-negative q-mt-md">{{ erroCarregamento }}</div>
            <div class="text-caption q-mt-sm">Verifique sua conexão ou tente novamente mais tarde</div>
            <q-btn
              label="Tentar Novamente"
              color="primary"
              icon="refresh"
              class="q-mt-lg"
              @click="recarregarDados"
              :loading="recarregando"
            />
          </div>

          <!-- Conteúdo Principal -->
          <div v-else class="row q-col-gutter-xl">
            <!-- Coluna Esquerda (40%) - Avatar e Informações Pessoais -->
            <div class="col-12 col-md-4">
              <div class="column q-gutter-y-lg">
                <!-- Card do Avatar -->
                <q-card class="avatar-card">
                  <q-card-section class="text-center q-pa-md">
                    <div class="avatar-container">
                      <q-avatar size="120px" class="q-mb-md">
                        <img :src="userAvatar" :alt="userName">
                        <q-badge
                          v-if="userOnline"
                          rounded
                          color="positive"
                          class="online-badge"
                          floating
                        >
                          <q-icon name="check_circle" size="12px" />
                        </q-badge>
                      </q-avatar>
                    </div>

                    <div class="text-h6 text-weight-medium q-mt-sm">
                      {{ userName }}
                    </div>

                    <q-chip
                      :color="getRoleColor(userRole)"
                      text-color="white"
                      size="sm"
                      class="q-mt-xs"
                    >
                      <q-icon name="badge" size="14px" class="q-mr-xs" />
                      {{ formatRole(userRole) }}
                    </q-chip>

                    <div class="text-caption text-grey-6 q-mt-sm">
                      Membro desde {{ formatDate(userCreatedAt) }}
                    </div>

                    <!-- Botão de editar avatar -->
                    <q-btn
                      flat
                      dense
                      color="primary"
                      icon="edit"
                      label="Alterar Avatar"
                      size="sm"
                      class="q-mt-md"
                      @click="abrirDialogAvatar"
                    />
                  </q-card-section>

                  <q-separator />

                  <!-- Informações do Usuário -->
                  <q-card-section>


                    <q-list dense>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="fingerprint" color="primary" size="18px" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label caption>ID do Usuário</q-item-label>
                          <q-item-label>{{ userId || 'Não informado' }}</q-item-label>
                        </q-item-section>
                      </q-item>


                    </q-list>
                  </q-card-section>
                </q-card>

                <!-- Card de Estatísticas -->
                <q-card class="info-card">
                  <q-card-section>

                    <div class="row q-col-gutter-md">
                      <div class="col-4 text-center">
                        <q-icon name="chat" size="24px" color="primary" />
                        <div class="text-h6 q-mt-xs">{{ postagensCount }}</div>
                        <div class="text-caption text-grey-6">Postagens</div>
                      </div>
                      <div class="col-4 text-center">
                        <q-icon name="group" size="24px" color="primary" />
                        <div class="text-h6 q-mt-xs">{{ seguidoresCount }}</div>
                        <div class="text-caption text-grey-6">Seguidores</div>
                      </div>
                      <div class="col-4 text-center">
                        <q-icon name="person_add" size="24px" color="primary" />
                        <div class="text-h6 q-mt-xs">{{ seguindoCount }}</div>
                        <div class="text-caption text-grey-6">Seguindo</div>
                      </div>
                    </div>


                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Coluna Direita (60%) - Configurações e Informações -->
            <div class="col-12 col-md-8">
              <div class="column q-gutter-y-lg">
                <!-- Card de Atividade Recente -->
                <q-card class="profile-card">
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-medium q-mb-md">
                      Atividade Recente
                    </div>

                    <div class="row q-col-gutter-md">
                      <div class="col-12 col-md-6">
                        <div class="activity-item q-pa-sm bg-grey-1 rounded-borders">
                          <q-icon name="schedule" size="16px" color="green" class="q-mr-sm" />
                          <span class="text-caption text-grey-7">Última atividade:</span>
                          <div class="text-body2 text-weight-medium">{{ formatRelativeTime(userLastLogin) }}</div>
                        </div>
                      </div>
                      <div class="col-12 col-md-6">
                        <div class="activity-item q-pa-sm bg-grey-1 rounded-borders">
                          <q-icon name="visibility" size="16px" color="blue" class="q-mr-sm" />
                          <span class="text-caption text-grey-7">Visualizando agora:</span>
                          <div class="text-body2 text-weight-medium">{{ userViewingPage || 'Nenhuma' }}</div>
                        </div>
                      </div>
                    </div>


                  </q-card-section>
                </q-card>

                <!-- Card de Alterar Senha -->
                <q-card class="profile-card">
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-medium q-mb-md">
                      Segurança
                    </div>

                    <q-form @submit="alterarSenha">
                      <div class="row q-col-gutter-md">
                        <div class="col-12">
                          <q-input
                            v-model="senhaForm.currentPassword"
                            label="Senha Atual"
                            type="password"
                            outlined
                            dense
                            :rules="[val => !!val || 'Digite sua senha atual']"
                          >
                            <template v-slot:prepend>
                              <q-icon name="vpn_key" color="primary" />
                            </template>
                          </q-input>
                        </div>

                        <div class="col-12 col-md-6">
                          <q-input
                            v-model="senhaForm.newPassword"
                            label="Nova Senha"
                            type="password"
                            outlined
                            dense
                            :rules="[
                              val => !!val || 'Digite a nova senha',
                              val => val.length >= 6 || 'A senha deve ter no mínimo 6 caracteres'
                            ]"
                          >
                            <template v-slot:prepend>
                              <q-icon name="password" color="primary" />
                            </template>
                          </q-input>
                        </div>

                        <div class="col-12 col-md-6">
                          <q-input
                            v-model="senhaForm.confirmPassword"
                            label="Confirmar Nova Senha"
                            type="password"
                            outlined
                            dense
                            :rules="[
                              val => !!val || 'Confirme a nova senha',
                              val => val === senhaForm.newPassword || 'As senhas não coincidem'
                            ]"
                          >
                            <template v-slot:prepend>
                              <q-icon name="verified" color="primary" />
                            </template>
                          </q-input>
                        </div>

                        <div class="col-12">
                          <q-btn
                            type="submit"
                            color="primary"
                            label="Alterar Senha"
                            icon="save"
                            :loading="loadingSenha"
                            unelevated
                          />
                        </div>
                      </div>
                    </q-form>
                  </q-card-section>
                </q-card>

                <!-- Card de Assinatura -->
                <q-card class="profile-card">
                  <q-card-section>
                    <div class="flex justify-between items-center q-mb-md">
                      <div class="text-subtitle1 text-weight-medium">
                        Assinatura
                      </div>
                      <q-btn
                        flat
                        dense
                        icon="edit"
                        color="primary"
                        label="Editar"
                        @click="editarAssinatura"
                      />
                    </div>

                    <div class="assinatura-container q-pa-md bg-grey-1 rounded-borders"
                         v-html="userAssinatura || 'Nenhuma'">
                    </div>
                  </q-card-section>
                </q-card>

                <!-- Card de Ações -->
                <q-card class="profile-card">
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-medium q-mb-md">
                      Ações
                    </div>

                    <div class="row q-col-gutter-md">

                      <div class="col-12 ">
                        <q-btn
                          outline
                          color="negative"
                          label="Sair do Sistema"
                          icon="logout"
                          class="full-width"
                          @click="logout"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>
        </div>

        <!-- Dialog de Alterar Avatar -->
        <q-dialog v-model="dialogAvatar">
          <q-card style="min-width: 400px">
            <q-card-section class="bg-primary text-white">
              <div class="text-h6">Alterar Avatar</div>
            </q-card-section>

            <q-card-section>
              <div class="text-center q-mb-md">
                <q-avatar size="150px">
                  <img :src="avatarPreview" :alt="userName">
                </q-avatar>
              </div>

              <q-input
                v-model="avatarUrl"
                label="URL do Avatar"
                outlined
                dense
                hint="Use uma URL válida de imagem (ex: https://i.imgur.com/kKIqX11.png)"
              >
                <template v-slot:prepend>
                  <q-icon name="link" color="primary" />
                </template>
              </q-input>


            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="Cancelar" v-close-popup />
              <q-btn color="primary" label="Salvar" @click="salvarAvatar" :loading="loadingAvatar" />
            </q-card-actions>
          </q-card>
        </q-dialog>


        <!-- Dialog de Editar Assinatura -->
        <q-dialog v-model="dialogAssinatura">
          <q-card style="min-width: 500px">
            <q-card-section class="bg-primary text-white">
              <div class="text-h6">Editar Assinatura</div>
            </q-card-section>

            <q-card-section>
              <q-editor
                v-model="assinaturaTexto"
                :toolbar="[
                  ['bold', 'italic', 'underline', 'strike'],
                  ['ordered', 'unordered'],
                  ['link'],
                  ['fullscreen']
                ]"
                min-height="150px"
                placeholder="Digite sua assinatura aqui..."
              />
              <div class="text-caption text-grey-6 q-mt-sm">
                <q-icon name="info" size="12px" />
                Você pode usar formatação HTML básica
              </div>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="Cancelar" v-close-popup />
              <q-btn color="primary" label="Salvar" @click="salvarAssinatura" :loading="loadingAssinatura" />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Dialog de Loading -->
        <q-dialog v-model="loadingDialog" persistent>
          <q-card style="min-width: 200px">
            <q-card-section class="text-center">
              <q-spinner size="40px" color="primary" />
              <div class="q-mt-sm">Carregando...</div>
            </q-card-section>
          </q-card>
        </q-dialog>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

export default {
  name: 'PerfilUsuario',

  setup() {
    const $q = useQuasar()
    const router = useRouter()

    // =========================
    // ESTADOS DE LOADING E CACHE
    // =========================
    const loadingInicial = ref(false)
    const recarregando = ref(false)
    const erroCarregamento = ref('')
    const usandoPolling = ref(false)
    let pollingInterval = null

    // Dados do usuário
    const userName = ref('Carregando...')
    const userEmail = ref('')
    const userAvatar = ref('')
    const userRole = ref('membro')
    const userCreatedAt = ref(null)
    const userLastLogin = ref(null)
    const userViewingPage = ref('')
    const userMinecraftNick = ref('')
    const userAssinatura = ref('')
    const userId = ref(null)
    const userOnline = ref(false)

    // Estatísticas
    const postagensCount = ref(0)
    const seguidoresCount = ref(0)
    const seguindoCount = ref(0)

    // Loading states
    const loading = ref(true)
    const loadingSenha = ref(false)
    const loadingAvatar = ref(false)
    const loadingEmail = ref(false)
    const loadingMinecraft = ref(false)
    const loadingAssinatura = ref(false)
    const loadingDialog = ref(false)

    // Dialogs
    const dialogAvatar = ref(false)
    const dialogEmail = ref(false)
    const dialogMinecraft = ref(false)
    const dialogAssinatura = ref(false)

    // Formulários
    const senhaForm = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    const avatarUrl = ref('')
    const avatarPreview = ref('')
    const novoEmail = ref('')
    const novoMinecraftNick = ref('')
    const assinaturaTexto = ref('')

    // =========================
    // COMPUTEDS
    // =========================
    const isAdmin = computed(() => {
      return ['master', 'gerente', 'admin'].includes(userRole.value)
    })

    const carregarCacheInicial = () => {
  const cachedUser = localStorage.getItem('userData')

  if (cachedUser) {
    try {
      const user = JSON.parse(cachedUser)

      userName.value = user.username || user.name || user.nome || 'Usuário'
      userEmail.value = user.email || user.id || ''
      userAvatar.value = user.avatar || user.foto || ''
      userRole.value = user.role || user.cargo || 'membro'
      userId.value = user.id || user.userId
      userMinecraftNick.value = user.minecraft_nick || user.minecraftNick || ''
      userAssinatura.value = user.assinatura || user.signature || ''
      userCreatedAt.value = user.created_at || user.data_criacao || user.createdAt
      userLastLogin.value = user.last_login || user.ultimo_acesso || user.lastLogin
      userViewingPage.value = user.viewing_page || ''

      // Estatísticas do cache
      postagensCount.value = user.postagens_count || user.posts || 0
      seguidoresCount.value = user.seguidores_count || user.followers || 0
      seguindoCount.value = user.seguindo_count || user.following || 0

    } catch {
  return 'data inválida'
}
  }

    }

    const salvarCache = (userData) => {
      const cacheData = {
        username: userName.value,
        name: userName.value,
        email: userEmail.value,
        avatar: userAvatar.value,
        role: userRole.value,
        id: userId.value,
        minecraft_nick: userMinecraftNick.value,
        assinatura: userAssinatura.value,
        created_at: userCreatedAt.value,
        last_login: userLastLogin.value,
        viewing_page: userViewingPage.value,
        postagens_count: postagensCount.value,
        seguidores_count: seguidoresCount.value,
        seguindo_count: seguindoCount.value,
        ...userData
      }

      localStorage.setItem('userData', JSON.stringify(cacheData))
    }

    // =========================
    // FUNÇÕES AUXILIARES
    // =========================
    const formatRole = (role) => {
      const roles = {
        'master': 'Master',
        'gerente': 'Gerente',
        'admin': 'Administrador',
        'moderador': 'Moderador',
        'ajudante': 'Ajudante',
        'parceiro': 'Parceiro',
        'safira': 'Safira',
        'ruby': 'Ruby',
        'gold': 'Gold',
        'membro': 'Membro'
      }
      return roles[role] || role
    }

    const getRoleColor = (role) => {
      const colors = {
        'master': 'red',
        'gerente': 'purple',
        'admin': 'negative',
        'moderador': 'orange',
        'ajudante': 'teal',
        'parceiro': 'pink',
        'safira': 'blue',
        'ruby': 'red-9',
        'gold': 'amber',
        'membro': 'grey'
      }
      return colors[role] || 'grey'
    }

    const formatDate = (date) => {
      if (!date) return 'data não disponível'
      try {
        const d = new Date(date)
        return d.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })
      } catch {
  return 'data inválida'
}
    }

    const formatRelativeTime = (date) => {
      if (!date) return 'Nunca'
      try {
        const now = new Date()
        const past = new Date(date)
        const diff = now - past
        const minutos = Math.floor(diff / (1000 * 60))
        const horas = Math.floor(diff / (1000 * 60 * 60))
        const dias = Math.floor(diff / (1000 * 60 * 60 * 24))

        if (minutos < 1) return 'agora mesmo'
        if (minutos < 60) return `${minutos} ${minutos === 1 ? 'minuto' : 'minutos'} atrás`
        if (horas < 24) return `${horas} ${horas === 1 ? 'hora' : 'horas'} atrás`
        if (dias < 30) return `${dias} ${dias === 1 ? 'dia' : 'dias'} atrás`
        return formatDate(date)
      } catch {
  return 'data inválida'
}
    }

    const isValidEmail = (email) => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return regex.test(email)
    }

    // =========================
    // CARREGAR PERFIL DO USUÁRIO
    // =========================
    const loadUserProfile = async () => {
      const token = localStorage.getItem('authToken')

      if (!token) {
        $q.notify({
          color: 'warning',
          message: 'Você precisa estar logado para acessar o perfil',
          icon: 'warning'
        })
        router.push('/login')
        return
      }

      try {
        // Tenta buscar da API
        const username = userName.value !== 'Carregando...' ? userName.value : ''
        const response = await fetch(`https://chamados-backend-4efw.onrender.com/api/members/${username}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          const member = data.member || data

          userName.value = member.username || userName.value
          userEmail.value = member.email || member.id || userEmail.value
          userAvatar.value = member.avatar || userAvatar.value
          userRole.value = member.role || userRole.value
          userId.value = member.id || userId.value
          userMinecraftNick.value = member.minecraft_nick || userMinecraftNick.value
          userAssinatura.value = member.assinatura || userAssinatura.value
          userCreatedAt.value = member.created_at || userCreatedAt.value
          userLastLogin.value = member.last_login || userLastLogin.value
          userViewingPage.value = member.viewing_page || ''

          // Estatísticas
          postagensCount.value = member.postagens_count || 0
          seguidoresCount.value = member.seguidores_count || 0
          seguindoCount.value = member.seguindo_count || 0

          // Salva no cache
          salvarCache(member)

          erroCarregamento.value = ''
        } else if (response.status === 404) {
          console.warn('Usuário não encontrado na API, usando apenas cache')
        } else {
          throw new Error(`Erro ${response.status}: ${response.statusText}`)
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)

        // Se já tem cache, não mostra erro
        if (!localStorage.getItem('userData')) {
          erroCarregamento.value = 'Erro ao carregar perfil. Verifique sua conexão.'

          $q.notify({
            color: 'negative',
            message: 'Erro ao carregar perfil',
            icon: 'error'
          })
        }
      } finally {
        loading.value = false
        loadingInicial.value = false
      }
    }

    // =========================
    // POLLING PARA ATUALIZAÇÕES EM TEMPO REAL
    // =========================
    const iniciarPolling = () => {
      if (pollingInterval) clearInterval(pollingInterval)

      // Polling a cada 30 segundos para atualizar dados
      pollingInterval = setInterval(async () => {
        const token = localStorage.getItem('authToken')
        if (!token) return

        try {
          const username = userName.value !== 'Carregando...' ? userName.value : ''
          if (!username || username === 'Carregando...') return

          const response = await fetch(`https://chamados-backend-4efw.onrender.com/api/members/${username}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (response.ok) {
            const data = await response.json()
            const member = data.member || data

            // Atualiza apenas dados que podem mudar com frequência
            userLastLogin.value = member.last_login || userLastLogin.value
            userViewingPage.value = member.viewing_page || ''
            postagensCount.value = member.postagens_count || postagensCount.value
            seguidoresCount.value = member.seguidores_count || seguidoresCount.value
            seguindoCount.value = member.seguindo_count || seguindoCount.value

            // Salva cache atualizado
            salvarCache(member)
          }
        } catch (error) {
          console.error('Erro no polling:', error)
        }
      }, 30000) // 30 segundos
    }

    const pararPolling = () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
        pollingInterval = null
      }
    }

    // =========================
    // RECARREGAR DADOS
    // =========================
    const recarregarDados = async () => {
      recarregando.value = true
      erroCarregamento.value = ''

      await loadUserProfile()

      recarregando.value = false

      $q.notify({
        color: 'info',
        message: 'Dados atualizados!',
        icon: 'refresh',
        position: 'top-right',
        timeout: 1500
      })
    }

    // =========================
    // ALTERAR SENHA
    // =========================
    const alterarSenha = async () => {
      if (senhaForm.value.newPassword !== senhaForm.value.confirmPassword) {
        $q.notify({
          color: 'warning',
          message: 'As senhas não coincidem',
          icon: 'warning'
        })
        return
      }

      loadingSenha.value = true
      const token = localStorage.getItem('authToken')

      try {
        const response = await fetch('https://chamados-backend-4efw.onrender.com/api/auth/change-password', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            currentPassword: senhaForm.value.currentPassword,
            newPassword: senhaForm.value.newPassword
          })
        })

        if (response.ok) {
          $q.notify({
            color: 'positive',
            message: 'Senha alterada com sucesso!',
            icon: 'check'
          })
          senhaForm.value = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          }
        } else {
          const error = await response.json()
          $q.notify({
            color: 'negative',
            message: error.error || error.message || 'Erro ao alterar senha',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('Erro ao alterar senha:', error)
        $q.notify({
          color: 'negative',
          message: 'Erro ao alterar senha',
          icon: 'error'
        })
      } finally {
        loadingSenha.value = false
      }
    }

    // =========================
    // ALTERAR AVATAR
    // =========================
    const abrirDialogAvatar = () => {
      avatarUrl.value = userAvatar.value
      avatarPreview.value = userAvatar.value
      dialogAvatar.value = true
    }

    const salvarAvatar = async () => {
      if (!avatarUrl.value) {
        $q.notify({
          color: 'warning',
          message: 'Digite uma URL para o avatar',
          icon: 'warning'
        })
        return
      }

      loadingAvatar.value = true
      const token = localStorage.getItem('authToken')

      try {
        const response = await fetch('https://chamados-backend-4efw.onrender.com/api/members/avatar', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ avatarUrl: avatarUrl.value })
        })

        if (response.ok) {
          const data = await response.json()
          userAvatar.value = avatarUrl.value
          salvarCache(data.user || { avatar: avatarUrl.value })

          $q.notify({
            color: 'positive',
            message: 'Avatar atualizado com sucesso!',
            icon: 'check'
          })
          dialogAvatar.value = false
        } else {
          const error = await response.json()
          $q.notify({
            color: 'negative',
            message: error.error || 'Erro ao atualizar avatar',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('Erro ao salvar avatar:', error)
        $q.notify({
          color: 'negative',
          message: 'Erro ao salvar avatar',
          icon: 'error'
        })
      } finally {
        loadingAvatar.value = false
      }
    }

    // =========================
    // ALTERAR MINECRAFT NICK
    // =========================
    const abrirDialogMinecraft = () => {
      novoMinecraftNick.value = userMinecraftNick.value
      dialogMinecraft.value = true
    }

    const salvarMinecraftNick = async () => {
      loadingMinecraft.value = true
      const token = localStorage.getItem('authToken')

      try {
        const response = await fetch('https://chamados-backend-4efw.onrender.com/api/members/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ minecraftNick: novoMinecraftNick.value })
        })

        if (response.ok) {
          userMinecraftNick.value = novoMinecraftNick.value
          salvarCache({ minecraft_nick: novoMinecraftNick.value })

          $q.notify({
            color: 'positive',
            message: 'Usuário Minecraft atualizado com sucesso!',
            icon: 'check'
          })
          dialogMinecraft.value = false
        } else {
          const error = await response.json()
          $q.notify({
            color: 'negative',
            message: error.error || 'Erro ao atualizar usuário Minecraft',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('Erro ao salvar usuário Minecraft:', error)
        $q.notify({
          color: 'negative',
          message: 'Erro ao salvar usuário Minecraft',
          icon: 'error'
        })
      } finally {
        loadingMinecraft.value = false
      }
    }

    // =========================
    // EDITAR ASSINATURA
    // =========================
    const editarAssinatura = () => {
      assinaturaTexto.value = userAssinatura.value
      dialogAssinatura.value = true
    }

    const salvarAssinatura = async () => {
      loadingAssinatura.value = true
      const token = localStorage.getItem('authToken')

      try {
        const response = await fetch(`https://chamados-backend-4efw.onrender.com/api/assinatura/new/${userName.value}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ assinatura: assinaturaTexto.value })
        })

        if (response.ok) {
          userAssinatura.value = assinaturaTexto.value
          salvarCache({ assinatura: assinaturaTexto.value })

          $q.notify({
            color: 'positive',
            message: 'Assinatura atualizada com sucesso!',
            icon: 'check'
          })
          dialogAssinatura.value = false
        } else {
          const error = await response.json()
          $q.notify({
            color: 'negative',
            message: error.error || 'Erro ao atualizar assinatura',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('Erro ao salvar assinatura:', error)
        $q.notify({
          color: 'negative',
          message: 'Erro ao salvar assinatura',
          icon: 'error'
        })
      } finally {
        loadingAssinatura.value = false
      }
    }

    // =========================
    // NAVEGAÇÃO
    // =========================
    const seguirAmigos = () => {
      router.push('/seguir')
    }

    const verSeguidores = () => {
      router.push(`/seguidores/${userName.value}`)
    }

    const verMeusTopicos = () => {
      router.push(`/membros/${userName.value}/topicos`)
    }

    const logout = () => {
      $q.dialog({
        title: 'Sair',
        message: 'Deseja realmente sair do sistema?',
        ok: { label: 'Sim', color: 'negative' },
        cancel: { label: 'Cancelar', color: 'grey', flat: true }
      }).onOk(() => {
        pararPolling()
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
        localStorage.removeItem('captcha_expire')
        router.push('/login')
      })
    }

    // =========================
    // CYCLE
    // =========================
    onMounted(() => {
      carregarCacheInicial()
      loadUserProfile()
      iniciarPolling()
      usandoPolling.value = true
    })

    onUnmounted(() => {
      pararPolling()
    })

    return {
      // Dados
      userName,
      userEmail,
      userAvatar,
      userRole,
      userCreatedAt,
      userLastLogin,
      userViewingPage,
      userMinecraftNick,
      userAssinatura,
      userId,
      userOnline,
      postagensCount,
      seguidoresCount,
      seguindoCount,
      isAdmin,

      // Loading
      loading,
      loadingInicial,
      recarregando,
      erroCarregamento,
      usandoPolling,
      loadingSenha,
      loadingAvatar,
      loadingEmail,
      loadingMinecraft,
      loadingAssinatura,
      loadingDialog,

      // Dialogs
      dialogAvatar,
      dialogEmail,
      dialogMinecraft,
      dialogAssinatura,

      // Forms
      senhaForm,
      avatarUrl,
      avatarPreview,
      novoEmail,
      novoMinecraftNick,
      assinaturaTexto,

      // Funções
      formatRole,
      getRoleColor,
      formatDate,
      formatRelativeTime,
      isValidEmail,
      recarregarDados,
      alterarSenha,
      abrirDialogAvatar,
      salvarAvatar,
      abrirDialogMinecraft,
      salvarMinecraftNick,
      editarAssinatura,
      salvarAssinatura,
      seguirAmigos,
      verSeguidores,
      verMeusTopicos,
      logout
    }
  }
}
</script>


<style scoped>
.container {
  max-width: 1400px;
  margin: 0 auto;
}

.avatar-card,
.info-card,
.profile-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.avatar-card {
  position: relative;
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.online-badge {
  bottom: 10px;
  right: 5px;
  border: 2px solid white;
}

.activity-item {
  padding: 8px;
  background: #f5f5f5;
  border-radius: 8px;
}

.assinatura-container {
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  border-left: 3px solid #1976d2;
  font-size: 0.9rem;
  word-wrap: break-word;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0;
  }

  .avatar-card,
  .info-card,
  .profile-card {
    margin-bottom: 16px;
  }
}
</style>
