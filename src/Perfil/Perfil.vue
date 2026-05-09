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

              </div>
            </div>
          </div>

          <div class="row q-col-gutter-xl">
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

                  <!-- Estatísticas do Usuário -->

                </q-card>

                <!-- Card de Informações de Contato -->
                <q-card class="info-card">
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-medium q-mb-md">
                      Informações
                    </div>

                    <q-list dense>
                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="fingerprint" color="primary" size="18px" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label caption>ID </q-item-label>
                          <q-item-label>{{ userEmail }}</q-item-label>
                        </q-item-section>

                      </q-item>

                      <q-item>
                        <q-item-section avatar>
                          <q-icon name="person" color="primary" size="18px" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label caption>Usuário</q-item-label>
                          <q-item-label>{{ userMinecraftNick || 'Não informado' }}</q-item-label>
                        </q-item-section>

                      </q-item>
                    </q-list>
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
                      <div class="col-6">
                        <div class="activity-item">
                          <q-icon name="schedule" size="16px" color="green" class="q-mr-sm" />
                          <span class="text-caption">Última atividade:</span>
                          <div class="text-body2">{{ formatRelativeTime(userLastLogin) }}</div>
                        </div>
                      </div>
                      <div class="col-6">
                        <div class="activity-item">
                          <q-icon name="visibility" size="16px" color="blue" class="q-mr-sm" />
                          <span class="text-caption">Visualizando agora:</span>
                          <div class="text-body2">{{ userViewingPage || 'Nenhuma' }}</div>
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

                    <div class="assinatura-container" v-html="userAssinatura || 'Nenhuma assinatura cadastrada'">
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
                hint="Use uma URL válida de imagem (ex: https://cravatar.eu/helmavatar/username/190.png)"
              >
                <template v-slot:prepend>
                  <q-icon name="link" color="primary" />
                </template>
              </q-input>

              <div class="row q-col-gutter-sm q-mt-md">
                <div class="col-4">
                  <q-btn
                    flat
                    dense
                    no-caps
                    size="sm"
                    label="Cravatar"
                    color="primary"
                    class="full-width"
                    @click="sugerirAvatar('cravatar')"
                  />
                </div>
                <div class="col-4">
                  <q-btn
                    flat
                    dense
                    no-caps
                    size="sm"
                    label="MC-Heads"
                    color="primary"
                    class="full-width"
                    @click="sugerirAvatar('mcheads')"
                  />
                </div>
                <div class="col-4">
                  <q-btn
                    flat
                    dense
                    no-caps
                    size="sm"
                    label="Visage"
                    color="primary"
                    class="full-width"
                    @click="sugerirAvatar('visage')"
                  />
                </div>
              </div>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="Cancelar" v-close-popup />
              <q-btn color="primary" label="Salvar" @click="salvarAvatar" :loading="loadingAvatar" />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Dialog de Alterar E-mail -->
        <q-dialog v-model="dialogEmail">
          <q-card style="min-width: 400px">
            <q-card-section class="bg-primary text-white">
              <div class="text-h6">Alterar E-mail</div>
            </q-card-section>

            <q-card-section>
              <q-input
                v-model="novoEmail"
                label="Novo E-mail"
                type="email"
                outlined
                dense
                :rules="[val => !!val || 'Digite o novo e-mail', val => isValidEmail(val) || 'E-mail inválido']"
              >
                <template v-slot:prepend>
                  <q-icon name="email" color="primary" />
                </template>
              </q-input>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="Cancelar" v-close-popup />
              <q-btn color="primary" label="Salvar" @click="salvarEmail" :loading="loadingEmail" />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Dialog de Alterar Minecraft Nick -->
        <q-dialog v-model="dialogMinecraft">
          <q-card style="min-width: 400px">
            <q-card-section class="bg-primary text-white">
              <div class="text-h6">Alterar usuário</div>
            </q-card-section>

            <q-card-section>
              <q-input
                v-model="novoMinecraftNick"
                label="Usuário"
                outlined
                dense
                hint="Digite seu novo usuário"
              >
                <template v-slot:prepend>
                  <q-icon name="sports_esports" color="primary" />
                </template>
              </q-input>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="Cancelar" v-close-popup />
              <q-btn color="primary" label="Salvar" @click="salvarMinecraftNick" :loading="loadingMinecraft" />
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
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

export default {
  name: 'PerfilUsuario',

  setup() {
    const $q = useQuasar()
    const router = useRouter()

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

    // Computed para verificar se é admin
    const isAdmin = computed(() => {
      return ['master', 'gerente', 'admin'].includes(userRole.value)
    })

    // Funções auxiliares
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
      const d = new Date(date)
      return d.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })
    }

    const formatRelativeTime = (date) => {
      if (!date) return 'Nunca'
      const now = new Date()
      const past = new Date(date)
      const diff = now - past
      const minutos = Math.floor(diff / (1000 * 60))
      const horas = Math.floor(diff / (1000 * 60 * 60))
      const dias = Math.floor(diff / (1000 * 60 * 60 * 24))

      if (minutos < 60) return `${minutos} minutos atrás`
      if (horas < 24) return `${horas} horas atrás`
      return `${dias} dias atrás`
    }

    const isValidEmail = (email) => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return regex.test(email)
    }

    // Carregar perfil do usuário
    const loadUserProfile = async () => {
      loading.value = true
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
        // Tenta pegar do cache primeiro
        const cachedUser = localStorage.getItem('userData')
        if (cachedUser) {
          const user = JSON.parse(cachedUser)
          userName.value = user.username || user.name
          userEmail.value = user.id || ''
          userAvatar.value = user.avatar || ''
          userRole.value = user.role || 'membro'
          userId.value = user.id
          userMinecraftNick.value = user.minecraft_nick || ''
          userAssinatura.value = user.assinatura || ''
          userCreatedAt.value = user.created_at || user.data_criacao
          userLastLogin.value = user.last_login
        }

        // Busca dados atualizados da API
        const response = await fetch(`https://boom-matcky.onrender.com/api/members/${userName.value}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          const member = data.member || data

          userName.value = member.username || userName.value
          userEmail.value = member.id || userEmail.value
          userAvatar.value = member.avatar || userAvatar.value
          userRole.value = member.role || userRole.value
          userId.value = member.id || userId.value
          userMinecraftNick.value = member.minecraft_nick || userMinecraftNick.value
          userAssinatura.value = member.assinatura || userAssinatura.value
          userCreatedAt.value = member.created_at || userCreatedAt.value
          userLastLogin.value = member.last_login || userLastLogin.value
          userViewingPage.value = member.viewing_page || ''

          // Atualiza cache
          localStorage.setItem('userData', JSON.stringify(member))
        }

        // Busca contagem de posts
        await loadPostCount()

        // Busca seguidores/seguindo
        await loadFollowStats()

      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
        $q.notify({
          color: 'negative',
          message: 'Erro ao carregar perfil',
          icon: 'error'
        })
      } finally {
        loading.value = false
      }
    }

    const loadPostCount = async () => {
      try {
        const response = await fetch(`https://boom-matcky.onrender.com/api/members/${userName.value}/posts`)
        if (response.ok) {
          const data = await response.json()
          postagensCount.value = data.postCount || 0
        }
      } catch (error) {
        console.error('Erro ao carregar posts:', error)
      }
    }

    const loadFollowStats = async () => {
      try {
        const token = localStorage.getItem('authToken')
        const response = await fetch(`https://boom-matcky.onrender.com/api/seguir/check/${userName.value}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          const data = await response.json()
          seguidoresCount.value = data.followers || 0
        }
      } catch (error) {
        console.error('Erro ao carregar seguidores:', error)
      }
    }

    // Alterar senha
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
        const response = await fetch('https://boom-matcky.onrender.com/api/auth/change-password', {
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
            message: error.error || 'Erro ao alterar senha',
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

    // Alterar avatar
    const abrirDialogAvatar = () => {
      avatarUrl.value = userAvatar.value
      avatarPreview.value = userAvatar.value
      dialogAvatar.value = true
    }

    const sugerirAvatar = (tipo) => {
      const nick = userName.value
      if (tipo === 'cravatar') {
        avatarUrl.value = `https://cravatar.eu/helmavatar/${nick}/190.png`
      } else if (tipo === 'mcheads') {
        avatarUrl.value = `https://mc-heads.net/avatar/${nick}/190`
      } else if (tipo === 'visage') {
        avatarUrl.value = `https://visage.surgeplay.com/face/190/${nick}`
      }
      avatarPreview.value = avatarUrl.value
    }

    const salvarAvatar = async () => {
      loadingAvatar.value = true
      const token = localStorage.getItem('authToken')

      try {
        const response = await fetch('https://boom-matcky.onrender.com/api/members/avatar', {
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
          localStorage.setItem('userData', JSON.stringify(data.user))
          $q.notify({
            color: 'positive',
            message: 'Avatar atualizado com sucesso!',
            icon: 'check'
          })
          dialogAvatar.value = false
        } else {
          $q.notify({
            color: 'negative',
            message: 'Erro ao atualizar avatar',
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

    // Alterar e-mail
    const abrirDialogEmail = () => {
      novoEmail.value = userEmail.value
      dialogEmail.value = true
    }

    const salvarEmail = async () => {
      if (!isValidEmail(novoEmail.value)) {
        $q.notify({
          color: 'warning',
          message: 'E-mail inválido',
          icon: 'warning'
        })
        return
      }

      loadingEmail.value = true
      const token = localStorage.getItem('authToken')

      try {
        const response = await fetch(`https://boom-matcky.onrender.com/api/members/${userId.value}/email`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: novoEmail.value })
        })

        if (response.ok) {
          userEmail.value = novoEmail.value
          $q.notify({
            color: 'positive',
            message: 'E-mail atualizado com sucesso!',
            icon: 'check'
          })
          dialogEmail.value = false
        } else {
          const error = await response.json()
          $q.notify({
            color: 'negative',
            message: error.error || 'Erro ao atualizar e-mail',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('Erro ao salvar e-mail:', error)
        $q.notify({
          color: 'negative',
          message: 'Erro ao salvar e-mail',
          icon: 'error'
        })
      } finally {
        loadingEmail.value = false
      }
    }

    // Alterar Minecraft nick
    const abrirDialogMinecraft = () => {
      novoMinecraftNick.value = userMinecraftNick.value
      dialogMinecraft.value = true
    }

    const salvarMinecraftNick = async () => {
      loadingMinecraft.value = true
      const token = localStorage.getItem('authToken')

      try {
        const response = await fetch('https://boom-matcky.onrender.com/api/members/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ minecraftNick: novoMinecraftNick.value })
        })

        if (response.ok) {
          userMinecraftNick.value = novoMinecraftNick.value
          $q.notify({
            color: 'positive',
            message: 'Usuário atualizado com sucesso!',
            icon: 'check'
          })
          dialogMinecraft.value = false
        } else {
          $q.notify({
            color: 'negative',
            message: 'Erro ao atualizar Usuário',
            icon: 'error'
          })
        }
      } catch (error) {
        console.error('Erro ao salvar Usuário:', error)
        $q.notify({
          color: 'negative',
          message: 'Erro ao salvar Usuário',
          icon: 'error'
        })
      } finally {
        loadingMinecraft.value = false
      }
    }

    // Editar assinatura
    const editarAssinatura = () => {
      assinaturaTexto.value = userAssinatura.value
      dialogAssinatura.value = true
    }

    const salvarAssinatura = async () => {
      loadingAssinatura.value = true
      const token = localStorage.getItem('authToken')

      try {
        const response = await fetch(`https://boom-matcky.onrender.com/api/assinatura/new/${userName.value}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ assinatura: assinaturaTexto.value })
        })

        if (response.ok) {
          userAssinatura.value = assinaturaTexto.value
          $q.notify({
            color: 'positive',
            message: 'Assinatura atualizada com sucesso!',
            icon: 'check'
          })
          dialogAssinatura.value = false
        } else {
          $q.notify({
            color: 'negative',
            message: 'Erro ao atualizar assinatura',
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

    // Navegação
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
        localStorage.removeItem('authToken')
        localStorage.removeItem('userData')
        localStorage.removeItem('captcha_expire')
        router.push('/login')
      })
    }

    onMounted(() => {
      loadUserProfile()
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
      alterarSenha,
      abrirDialogAvatar,
      sugerirAvatar,
      salvarAvatar,
      abrirDialogEmail,
      salvarEmail,
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
