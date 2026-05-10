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
                    <q-icon name="people" size="28px" color="primary" class="q-mr-sm" />
                    Gerenciar Usuários
                  </div>
                  <div class="text-subtitle2 text-grey-7 q-mt-sm">
                    Gerencie todos os membros registrados no sistema
                  </div>
                </div>
                <div>
                  <q-btn
                    color="primary"
                    icon="person_add"
                    label="Novo Usuário"
                    unelevated
                    @click="abrirDialogNovoUsuario"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Loading com Skeleton -->
          <div v-if="loadingInicial" class="q-pa-md">
            <div class="row q-col-gutter-md q-mb-lg">
              <div class="col-12 col-sm-6 col-md-3" v-for="i in 4" :key="i">
                <q-skeleton type="rect" height="100px" animation="wave" />
              </div>
            </div>
            <div class="row q-col-gutter-md q-mb-lg">
              <div class="col-12 col-md-4">
                <q-skeleton type="rect" height="56px" animation="wave" />
              </div>
              <div class="col-6 col-md-3">
                <q-skeleton type="rect" height="56px" animation="wave" />
              </div>
              <div class="col-6 col-md-3">
                <q-skeleton type="rect" height="56px" animation="wave" />
              </div>
              <div class="col-12 col-md-2">
                <q-skeleton type="rect" height="56px" animation="wave" />
              </div>
            </div>
            <q-skeleton type="rect" height="400px" animation="wave" />
          </div>

          <!-- Mensagem de Erro na API -->
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
          <div v-else>
            <!-- Filtros -->
            <div class="row q-col-gutter-md q-mb-lg">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="filtros.busca"
                  label="Buscar usuários"
                  outlined
                  dense
                  clearable
                  placeholder="Nome de usuário ou email..."
                >
                  <template v-slot:prepend>
                    <q-icon name="search" color="primary" />
                  </template>
                </q-input>
              </div>
              <div class="col-6 col-md-3">
                <q-select
                  v-model="filtros.cargo"
                  :options="cargoOptions"
                  label="Cargo"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                />
              </div>
              <div class="col-6 col-md-3">
                <q-select
                  v-model="filtros.status"
                  :options="statusUsuarioOptions"
                  label="Status"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                />
              </div>
              <div class="col-12 col-md-2">
                <q-btn
                  color="primary"
                  label="Filtrar"
                  unelevated
                  class="full-width"
                  icon="filter_list"
                  @click="aplicarFiltros"
                />
              </div>
            </div>

            <!-- Estatísticas Rápidas -->
            <div class="row q-col-gutter-md q-mb-lg">
              <div class="col-6 col-md-3" v-for="stat in estatisticas" :key="stat.label">
                <q-card class="stat-card">
                  <q-card-section class="text-center">
                    <q-icon :name="stat.icone" size="32px" :color="stat.cor" />
                    <div class="text-h5 text-weight-medium q-mt-sm">{{ stat.valor }}</div>
                    <div class="text-caption text-grey-7">{{ stat.label }}</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- Seleção em massa -->
            <div v-if="selectedRows.length > 0" class="row q-mb-md">
              <div class="col-12">
                <q-banner class="bg-grey-2 rounded-borders">
                  <template v-slot:avatar>
                    <q-icon name="check_circle" color="primary" />
                  </template>
                  <div class="flex justify-between items-center full-width">
                    <div>
                      <strong>{{ selectedRows.length }}</strong> usuário(s) selecionado(s)
                    </div>
                    <div>
                      <q-btn
                        color="negative"
                        icon="delete"
                        label="Excluir Selecionados"
                        unelevated
                        size="sm"
                        @click="confirmarExclusaoMultipla"
                      />
                      <q-btn
                        flat
                        label="Cancelar"
                        size="sm"
                        class="q-ml-sm"
                        @click="limparSelecao"
                      />
                    </div>
                  </div>
                </q-banner>
              </div>
            </div>

            <!-- Tabela de Usuários -->
            <q-card class="table-card">
              <div class="text-subtitle1 text-weight-medium" style="padding: 1em; margin-bottom: -15px;">
                <q-icon name="people" size="20px" color="positive" class="q-mr-xs" />
                Usuários Cadastrados
                <span v-if="ultimaAtualizacao" class="text-caption text-grey-6 q-ml-md">
                  Última atualização: {{ formatarHora(ultimaAtualizacao) }}
                </span>
              </div>
              <q-card-section style="background: none">
                <q-table
                  :rows="usuariosFiltrados"
                  :columns="columns"
                  row-key="id"
                  :loading="loading"
                  :pagination="pagination"
                  @row-click="(evt, row) => !evt.target.closest('.q-btn') && abrirDialogEdicao(row)"
                  selection="multiple"
                  v-model:selected="selectedRows"
                  class="usuarios-table"
                  binary-state-sort
                  :rows-per-page-options="[5, 10, 25, 50]"
                >
                  <template v-slot:body-cell-avatar="props">
                    <q-td :props="props">
                      <q-avatar size="40px">
                        <img :src="props.row.avatar || `https://cravatar.eu/helmavatar/${props.row.username}/190.png`" />
                      </q-avatar>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-role="props">
                    <q-td :props="props">
                      <q-chip
                        :color="getCargoCor(props.row.role)"
                        text-color="white"
                        size="sm"
                      >
                        <q-icon :name="getCargoIcone(props.row.role)" size="14px" class="q-mr-xs" />
                        {{ formatarCargo(props.row.role) }}
                      </q-chip>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-status="props">
                    <q-td :props="props">
                      <q-badge
                        :color="props.row.online ? 'positive' : 'grey'"
                        :label="props.row.online ? 'Online' : 'Offline'"
                        class="status-badge"
                      />
                    </q-td>
                  </template>

                  <template v-slot:body-cell-seguidores="props">
                    <q-td :props="props">
                      <div class="flex items-center">
                        <q-icon name="people" size="16px" color="primary" class="q-mr-xs" />
                        <span>{{ props.row.seguidores || 0 }}</span>
                      </div>
                    </q-td>
                  </template>

                  <template v-slot:body-cell-acoes="props">
                    <q-td :props="props">
                      <q-btn
                        flat
                        round
                        dense
                        icon="edit"
                        color="primary"
                        @click.stop="abrirDialogEdicao(props.row)"
                        size="sm"
                      >
                        <q-tooltip>Editar usuário</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        round
                        dense
                        icon="shield"
                        color="warning"
                        @click.stop="abrirDialogCargo(props.row)"
                        size="sm"
                        class="q-ml-xs"
                      >
                        <q-tooltip>Alterar cargo</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        round
                        dense
                        icon="email"
                        color="info"
                        @click.stop="abrirDialogEmail(props.row)"
                        size="sm"
                        class="q-ml-xs"
                      >
                        <q-tooltip>Alterar email</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        round
                        dense
                        icon="delete"
                        color="negative"
                        @click.stop="confirmarExclusaoUnica(props.row)"
                        size="sm"
                        class="q-ml-xs"
                      >
                        <q-tooltip>Excluir usuário</q-tooltip>
                      </q-btn>
                    </q-td>
                  </template>

                  <template v-slot:loading>
                    <q-inner-loading showing color="primary" />
                  </template>

                  <template v-slot:no-data>
                    <div class="text-center justify-center q-pa-xl" style="margin: 0 auto">
                      <q-icon name="person_off" size="48px" color="grey-4" />
                      <div class="text-subtitle1 text-grey-6 q-mt-md">
                        Nenhum usuário encontrado
                      </div>
                      <div class="text-caption text-grey-5 q-mt-sm">
                        Tente ajustar os filtros ou crie um novo usuário
                      </div>
                    </div>
                  </template>
                </q-table>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Dialog de Novo Usuário -->
        <q-dialog v-model="dialogNovoUsuario" persistent>
          <q-card style="min-width: 500px; max-width: 600px; width: 90%; border-radius: 20px;">
            <q-card-section class="bg-primary text-white">
              <div class="text-h6">Novo Usuário</div>
              <div class="text-caption">Preencha os dados para criar um novo usuário</div>
            </q-card-section>

            <q-card-section class="q-pt-md">
              <q-form @submit="criarNovoUsuario" ref="novoUsuarioForm">
                <q-input
                  v-model="novoUsuarioData.username"
                  label="Usuário *"
                  outlined

                  :rules="[val => !!val || 'Usuário é obrigatório', val => val.length >= 3 || 'Mínimo 3 caracteres']"
                  class="q-mb-md"
                />

                <q-input
                  v-model="novoUsuarioData.email"
                  label="Email *"
                  type="email"
                  outlined

                  :rules="[val => !!val || 'Email é obrigatório', val => /.+@.+\..+/.test(val) || 'Email inválido']"
                  class="q-mb-md"
                />

                <q-select
                  v-model="novoUsuarioData.role"
                  :options="cargoOptions"
                  label="Cargo *"
                  outlined

                  emit-value
                  map-options
                  :rules="[val => !!val || 'Selecione um cargo']"
                  class="q-mb-md"
                />

                <q-input
                  v-model="novoUsuarioData.password"
                  label="Senha *"
                  type="password"
                  outlined

                  :rules="[val => !!val || 'Senha é obrigatória', val => val.length >= 6 || 'Mínimo 6 caracteres']"
                  class="q-mb-md"
                />

                <q-input
                  v-model="novoUsuarioData.confirmPassword"
                  label="Confirmar Senha *"
                  type="password"
                  outlined

                  :rules="[val => val === novoUsuarioData.password || 'As senhas não coincidem']"
                />

                <q-input
  v-model="novoUsuarioData.assinatura"
  label="Assinatura"
  type="textarea"
  outlined
  autogrow
  class="q-mt-md"
  hint="Opcional - Assinatura do usuário"
  input-style="min-height: 100px"
/>
              </q-form>
            </q-card-section>

            <q-card-actions align="right" class="q-pa-md">
              <q-btn flat label="Cancelar" color="grey" v-close-popup @click="limparFormularioNovoUsuario" />
              <q-btn
                label="Criar Usuário"
                color="primary"
                @click="criarNovoUsuario"
                :loading="criandoUsuario"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Dialog de Edição de Usuário -->
        <q-dialog v-model="dialogEdicao" :maximized="false">
          <q-card style="min-width: 600px; max-width: 800px; width: 70%; border-radius: 30px;">
            <q-card-section class="bg-primary text-white row items-center">
              <div class="col-10">
                <div class="text-caption text-white text-weight-medium">
                  EDITAR USUÁRIO
                </div>
                <div class="text-h6 text-weight-medium">
                  {{ usuarioEditando?.username }}
                </div>
              </div>
              <div class="col-2 text-right">
                <q-btn flat round dense icon="close" v-close-popup class="text-white" />
              </div>
            </q-card-section>

            <q-card-section class="q-pt-md" v-if="usuarioEditando">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4 text-center">
                  <q-avatar size="120px" class="q-mb-md">
                    <img :src="usuarioEditando.avatar || `https://cravatar.eu/helmavatar/${usuarioEditando.username}/190.png`" />
                  </q-avatar>
                  <div class="text-h6 text-weight-medium">{{ usuarioEditando.username }}</div>
                  <q-chip
                    :color="getCargoCor(usuarioEditando.role)"
                    text-color="white"
                    size="sm"
                    class="q-mt-sm"
                  >
                    {{ formatarCargo(usuarioEditando.role) }}
                  </q-chip>
                </div>

                <div class="col-12 col-md-8">
                  <q-list separator>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Email</q-item-label>
                        <q-item-label>{{ usuarioEditando.email }}</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Data de Criação</q-item-label>
                        <q-item-label>{{ formatarDataCompleta(usuarioEditando.data_criacao) }}</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Último Login</q-item-label>
                        <q-item-label>{{ usuarioEditando.last_login ? formatarDataRelativa(new Date(usuarioEditando.last_login)) : 'Nunca' }}</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Estatísticas</q-item-label>
                        <div class="row q-col-gutter-sm q-mt-xs">
                          <div class="col-4">
                            <q-chip icon="people" color="primary" text-color="white" size="sm">
                              {{ usuarioEditando.seguidores || 0 }} seguidores
                            </q-chip>
                          </div>
                          <div class="col-4">
                            <q-chip icon="chat" color="info" text-color="white" size="sm">
                              {{ usuarioEditando.postagens || 0 }} posts
                            </q-chip>
                          </div>
                          <div class="col-4">
                            <q-chip icon="favorite" color="red" text-color="white" size="sm">
                              {{ usuarioEditando.curtidas || 0 }} curtidas
                            </q-chip>
                          </div>
                        </div>
                      </q-item-section>
                    </q-item>

                    <q-item v-if="usuarioEditando.assinatura">
                      <q-item-section>
                        <q-item-label caption>Assinatura</q-item-label>
                        <q-item-label class="text-caption">{{ usuarioEditando.assinatura }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-actions align="right" class="q-pa-md">
              <q-btn
                label="Alterar Cargo"
                icon="shield"
                color="warning"
                @click="abrirDialogCargo(usuarioEditando)"
              />
              <q-btn
                label="Alterar Email"
                icon="email"
                color="info"
                @click="abrirDialogEmail(usuarioEditando)"
              />
              <q-btn label="Fechar" color="grey" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Dialog de Alteração de Cargo -->
        <q-dialog v-model="dialogCargo" persistent>
          <q-card style="min-width: 400px; border-radius: 20px;">
            <q-card-section class="bg-warning text-white">
              <div class="text-h6">Alterar Cargo</div>
              <div class="text-caption">Usuário: {{ usuarioParaCargo?.username }}</div>
            </q-card-section>

            <q-card-section>
              <q-select
                v-model="novoCargo"
                :options="cargoOptions"
                label="Selecione o novo cargo"
                outlined
                dense
                emit-value
                map-options
              />
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="Cancelar" color="grey" v-close-popup />
              <q-btn
                label="Salvar"
                color="warning"
                @click="salvarCargo"
                :loading="salvandoCargo"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Dialog de Alteração de Email -->
        <q-dialog v-model="dialogEmail" persistent>
          <q-card style="min-width: 400px; border-radius: 20px;">
            <q-card-section class="bg-info text-white">
              <div class="text-h6">Alterar Email</div>
              <div class="text-caption">Usuário: {{ usuarioParaEmail?.username }}</div>
            </q-card-section>

            <q-card-section>
              <q-input
                v-model="novoEmail"
                label="Novo email"
                type="email"
                outlined
                dense
                :rules="[val => !!val || 'Email é obrigatório', val => /.+@.+\..+/.test(val) || 'Email inválido']"
              />
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="Cancelar" color="grey" v-close-popup />
              <q-btn
                label="Salvar"
                color="info"
                @click="salvarEmail"
                :loading="salvandoEmail"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'

const API_URL = 'https://chamados-backend-4efw.onrender.com/api'
const WS_URL = 'wss://chamados-backend-4efw.onrender.com/ws'

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default {
  name: 'GerenciarUsuarios',

  setup() {
    const $q = useQuasar()

    // =========================
    // ESTADOS
    // =========================
    const loadingInicial = ref(true)
    const loading = ref(false)
    const recarregando = ref(false)
    const erroCarregamento = ref('')

    const selectedRows = ref([])
    const dialogEdicao = ref(false)
    const dialogCargo = ref(false)
    const dialogEmail = ref(false)
    const dialogNovoUsuario = ref(false)
    const usuarioEditando = ref(null)
    const usuarioParaCargo = ref(null)
    const usuarioParaEmail = ref(null)

    const novoCargo = ref(null)
    const novoEmail = ref('')
    const salvandoCargo = ref(false)
    const salvandoEmail = ref(false)
    const criandoUsuario = ref(false)

    const ultimaAtualizacao = ref(null)

    // Dados do novo usuário
    const novoUsuarioData = ref({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'membro',
      assinatura: ''
    })

    // WebSocket
    let ws = null

    // Filtros
    const filtros = ref({
      busca: '',
      cargo: null,
      status: null
    })

    // Paginação da tabela
    const pagination = ref({
      sortBy: 'data_criacao',
      descending: true,
      page: 1,
      rowsPerPage: 10
    })

    // Colunas da tabela
    const columns = ref([
      { name: 'avatar', label: 'Avatar', field: 'avatar', align: 'center', style: 'width: 70px' },
      { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true, style: 'width: 70px' },
      { name: 'username', label: 'Usuário', field: 'username', align: 'left', sortable: true, style: 'min-width: 150px' },
      { name: 'email', label: 'Email', field: 'email', align: 'left', sortable: true, style: 'min-width: 200px' },
      { name: 'role', label: 'Cargo', field: 'role', align: 'left', sortable: true, style: 'width: 120px' },
      { name: 'status', label: 'Status', field: 'online', align: 'center', sortable: true, style: 'width: 100px' },
      { name: 'seguidores', label: 'Seguidores', field: 'seguidores', align: 'center', sortable: true, style: 'width: 100px' },
      {
        name: 'data_criacao',
        label: 'Criação',
        field: row => formatarData(row.data_criacao),
        sortable: true,
        style: 'width: 120px'
      },
      { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center', style: 'width: 160px' }
    ])

    const cargoOptions = ref([
      { label: 'Master', value: 'master' },
      { label: 'Gerente', value: 'gerente' },
      { label: 'Admin', value: 'admin' },
      { label: 'Moderador', value: 'moderador' },
      { label: 'Ajudante', value: 'ajudante' },
      { label: 'Parceiro', value: 'parceiro' },
      { label: 'Safira', value: 'safira' },
      { label: 'Ruby', value: 'ruby' },
      { label: 'Gold', value: 'gold' },
      { label: 'Membro', value: 'membro' }
    ])

    const statusUsuarioOptions = ref([
      { label: 'Online', value: true },
      { label: 'Offline', value: false }
    ])

    const usuarios = ref([])

    // =========================
    // FUNÇÃO DE CACHE
    // =========================
    const carregarCacheInicial = () => {
      const cacheUsuarios = localStorage.getItem('cache_usuarios')
      const cacheTimestamp = localStorage.getItem('cache_usuarios_timestamp')

      if (cacheUsuarios) {
        const parsed = JSON.parse(cacheUsuarios)
        usuarios.value = parsed.map(usuario => ({
          ...usuario,
          data_criacao: usuario.data_criacao ? new Date(usuario.data_criacao) : null,
          online: isUsuarioOnline(usuario.last_login)
        }))

        // Se o cache tem menos de 5 minutos, não mostra skeleton
        if (cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < 300000) {
          loadingInicial.value = false
        }
      }
    }

    const salvarCache = () => {
      localStorage.setItem('cache_usuarios', JSON.stringify(usuarios.value))
      localStorage.setItem('cache_usuarios_timestamp', Date.now().toString())
    }

    // =========================
    // WEBHOOK - ATUALIZAÇÕES EM TEMPO REAL
    // =========================
    const conectarWebSocket = () => {
      try {
        ws = new WebSocket(WS_URL)

        ws.onopen = () => {
          console.log('WebSocket conectado - Usuários')
        }

        ws.onmessage = (event) => {
          try {
            const dados = JSON.parse(event.data)
            processarMensagemWebSocket(dados)
            ultimaAtualizacao.value = new Date()
          } catch (error) {
            console.error('Erro ao processar mensagem WebSocket:', error)
          }
        }

        ws.onerror = (error) => {
          console.error('WebSocket error:', error)
        }

        ws.onclose = () => {
          console.log('WebSocket desconectado, tentando reconectar em 5 segundos...')
          setTimeout(conectarWebSocket, 5000)
        }
      } catch (error) {
        console.error('Erro ao conectar WebSocket:', error)
        setTimeout(conectarWebSocket, 5000)
      }
    }

    const processarMensagemWebSocket = (mensagem) => {
      switch (mensagem.event) {
        case 'usuario_criado':
          adicionarUsuarioViaWebSocket(mensagem.data)
          break
        case 'usuario_atualizado':
          atualizarUsuarioViaWebSocket(mensagem.data)
          break
        case 'usuario_excluido':
          removerUsuarioViaWebSocket(mensagem.data.id)
          break
        case 'usuario_cargo_alterado':
          atualizarUsuarioViaWebSocket(mensagem.data)
          break
        case 'usuario_online':
          atualizarStatusUsuario(mensagem.data.id, true)
          break
        case 'usuario_offline':
          atualizarStatusUsuario(mensagem.data.id, false)
          break
        default:
          console.log('Mensagem WebSocket recebida:', mensagem.event)
      }
    }

    const adicionarUsuarioViaWebSocket = (usuarioData) => {
      const novoUsuario = formatarUsuario(usuarioData)
      const existe = usuarios.value.some(u => u.id === novoUsuario.id)

      if (!existe) {
        usuarios.value.unshift(novoUsuario)
        salvarCache()

        $q.notify({
          color: 'info',
          message: `Novo usuário adicionado: ${novoUsuario.username}`,
          icon: 'person_add',
          position: 'top-right',
          timeout: 3000
        })
      }
    }

    const atualizarUsuarioViaWebSocket = (usuarioData) => {
      const index = usuarios.value.findIndex(u => u.id === usuarioData.id)
      if (index !== -1) {
        const usuarioAntigo = usuarios.value[index]
        const usuarioAtualizado = {
          ...usuarioAntigo,
          ...formatarUsuario(usuarioData),
          online: isUsuarioOnline(usuarioData.last_login || usuarioAntigo.last_login)
        }

        usuarios.value[index] = usuarioAtualizado
        salvarCache()

        if (usuarioEditando.value && usuarioEditando.value.id === usuarioAtualizado.id) {
          usuarioEditando.value = usuarioAtualizado
        }

        $q.notify({
          color: 'warning',
          message: `Usuário ${usuarioAtualizado.username} foi atualizado`,
          icon: 'update',
          position: 'top-right',
          timeout: 3000
        })
      }
    }

    const removerUsuarioViaWebSocket = (id) => {
      const index = usuarios.value.findIndex(u => u.id === id)
      if (index !== -1) {
        const usuarioRemovido = usuarios.value[index]
        usuarios.value.splice(index, 1)
        salvarCache()

        if (usuarioEditando.value && usuarioEditando.value.id === id) {
          dialogEdicao.value = false
          usuarioEditando.value = null
        }

        $q.notify({
          color: 'negative',
          message: `Usuário ${usuarioRemovido.username} foi removido`,
          icon: 'delete',
          position: 'top-right',
          timeout: 3000
        })
      }
    }

    const atualizarStatusUsuario = (id, online) => {
      const index = usuarios.value.findIndex(u => u.id === id)
      if (index !== -1) {
        usuarios.value[index].online = online
        salvarCache()
      }
    }

    const formatarUsuario = (usuario) => ({
      id: usuario.id,
      username: usuario.username || usuario.name,
      email: usuario.email,
      role: usuario.role || 'membro',
      data_criacao: usuario.created_at || usuario.data_criacao ? new Date(usuario.created_at || usuario.data_criacao) : new Date(),
      last_login: usuario.last_login || null,
      avatar: usuario.avatar || `https://cravatar.eu/helmavatar/${usuario.username || usuario.name}/190.png`,
      seguidores: usuario.seguidores || 0,
      postagens: usuario.postagens || 0,
      curtidas: usuario.curtidas || 0,
      assinatura: usuario.assinatura || '',
      online: isUsuarioOnline(usuario.last_login)
    })

    // =========================
    // CARREGAR DADOS INICIAIS
    // =========================
    const carregarUsuarios = async () => {
      try {
        loading.value = true
        const response = await api.get('/members')

        if (response.data) {
          usuarios.value = response.data.map(usuario => formatarUsuario(usuario))
          salvarCache()
          erroCarregamento.value = ''
        }
      } catch (error) {
        console.error('Erro ao carregar usuários:', error)
        erroCarregamento.value = 'Erro ao carregar usuários. Verifique sua conexão.'

        // Se não conseguiu carregar da API e não tem cache, mostra erro
        if (usuarios.value.length === 0) {
          $q.notify({
            color: 'negative',
            message: erroCarregamento.value,
            icon: 'error',
            position: 'top-right'
          })
        }
      } finally {
        loadingInicial.value = false
        loading.value = false
      }
    }

    const recarregarDados = async () => {
      recarregando.value = true
      erroCarregamento.value = ''
      loadingInicial.value = true
      await carregarUsuarios()
      recarregando.value = false
    }

    // =========================
    // VERIFICAÇÃO ONLINE
    // =========================
    const isUsuarioOnline = (lastLogin) => {
      if (!lastLogin) return false
      const ultimoLogin = new Date(lastLogin)
      const agora = new Date()
      const diffMinutos = (agora - ultimoLogin) / (1000 * 60)
      return diffMinutos <= 15
    }

    // =========================
    // ESTATÍSTICAS
    // =========================
    const estatisticas = computed(() => [
      {
        label: 'Total de Usuários',
        valor: usuarios.value.length,
        icone: 'people',
        cor: 'primary'
      },
      {
        label: 'Online Agora',
        valor: usuarios.value.filter(u => u.online).length,
        icone: 'circle',
        cor: 'positive'
      },
      {
        label: 'Offline Agora',
        valor: usuarios.value.filter(u => !u.online).length,
        icone: 'circle',
        cor: 'negative'
      },
      {
        label: 'Cargos Distintos',
        valor: new Set(usuarios.value.map(u => u.role)).size,
        icone: 'badge',
        cor: 'info'
      }
    ])

    // Usuários filtrados
    const usuariosFiltrados = computed(() => {
      let resultado = [...usuarios.value]

      if (filtros.value.busca) {
        const buscaLower = filtros.value.busca.toLowerCase()
        resultado = resultado.filter(u =>
          u.username?.toLowerCase().includes(buscaLower) ||
          u.email?.toLowerCase().includes(buscaLower)
        )
      }

      if (filtros.value.cargo) {
        resultado = resultado.filter(u => u.role === filtros.value.cargo)
      }

      if (filtros.value.status !== null) {
        resultado = resultado.filter(u => u.online === filtros.value.status)
      }

      return resultado
    })

    // =========================
    // FUNÇÕES DE GESTÃO
    // =========================
    const abrirDialogNovoUsuario = () => {
      dialogNovoUsuario.value = true
    }

    const criarNovoUsuario = async () => {
      if (!novoUsuarioData.value.username || !novoUsuarioData.value.email || !novoUsuarioData.value.password) {
        $q.notify({
          color: 'warning',
          message: 'Preencha todos os campos obrigatórios',
          icon: 'warning',
          position: 'top-right'
        })
        return
      }

      if (novoUsuarioData.value.password !== novoUsuarioData.value.confirmPassword) {
        $q.notify({
          color: 'warning',
          message: 'As senhas não coincidem',
          icon: 'warning',
          position: 'top-right'
        })
        return
      }

      if (novoUsuarioData.value.password.length < 6) {
        $q.notify({
          color: 'warning',
          message: 'A senha deve ter pelo menos 6 caracteres',
          icon: 'warning',
          position: 'top-right'
        })
        return
      }

      try {
        criandoUsuario.value = true

        // Usando o mesmo formato da página de register que funciona
        const userData = {
          username: novoUsuarioData.value.username,
          email: novoUsuarioData.value.email,
          password: novoUsuarioData.value.password,
          role: novoUsuarioData.value.role,
          assinatura: novoUsuarioData.value.assinatura || '',
          // valores padrão
          avatar: '',
          seguidores: 0,
          seguindo: 0,
          curtidas: 0,
          postagens: 0,
          verified: false,
          viewing_page: ''
        }

        const response = await fetch(`${API_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Erro ao criar usuário')
        }

        // Formata o usuário retornado
        const novoUsuario = formatarUsuario(data)
        usuarios.value.unshift(novoUsuario)
        salvarCache()

        $q.notify({
          color: 'positive',
          message: `Usuário ${novoUsuarioData.value.username} criado com sucesso!`,
          icon: 'check_circle',
          position: 'top-right'
        })

        limparFormularioNovoUsuario()
        dialogNovoUsuario.value = false

      } catch (error) {
        console.error('Erro ao criar usuário:', error)
        $q.notify({
          color: 'negative',
          message: error.message || 'Erro ao criar usuário',
          icon: 'error',
          position: 'top-right'
        })
      } finally {
        criandoUsuario.value = false
      }
    }

    const limparFormularioNovoUsuario = () => {
      novoUsuarioData.value = {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'membro',
        assinatura: ''
      }
    }

    const abrirDialogEdicao = (usuario) => {
      usuarioEditando.value = { ...usuario }
      dialogEdicao.value = true
    }

    const abrirDialogCargo = (usuario) => {
      usuarioParaCargo.value = usuario
      novoCargo.value = usuario.role
      dialogCargo.value = true
    }

    const abrirDialogEmail = (usuario) => {
      usuarioParaEmail.value = usuario
      novoEmail.value = usuario.email
      dialogEmail.value = true
    }

    const salvarCargo = async () => {
      if (!novoCargo.value || !usuarioParaCargo.value) return

      try {
        salvandoCargo.value = true

        const response = await fetch(`${API_URL}/members/novo-role/${usuarioParaCargo.value.id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ role: novoCargo.value })
        })

        if (!response.ok) {
          throw new Error('Erro ao alterar cargo')
        }

        const index = usuarios.value.findIndex(u => u.id === usuarioParaCargo.value.id)
        if (index !== -1) {
          usuarios.value[index].role = novoCargo.value
          salvarCache()
        }

        if (usuarioEditando.value && usuarioEditando.value.id === usuarioParaCargo.value.id) {
          usuarioEditando.value.role = novoCargo.value
        }

        $q.notify({
          color: 'positive',
          message: `Cargo de ${usuarioParaCargo.value.username} alterado para ${formatarCargo(novoCargo.value)}`,
          icon: 'check_circle',
          position: 'top-right'
        })

        dialogCargo.value = false
      } catch (error) {
        console.error('Erro ao alterar cargo:', error)
        $q.notify({
          color: 'negative',
          message: 'Erro ao alterar cargo do usuário',
          icon: 'error',
          position: 'top-right'
        })
      } finally {
        salvandoCargo.value = false
      }
    }

    const salvarEmail = async () => {
      if (!novoEmail.value || !usuarioParaEmail.value) return

      try {
        salvandoEmail.value = true

        const response = await fetch(`${API_URL}/members/${usuarioParaEmail.value.id}/email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: novoEmail.value })
        })

        if (!response.ok) {
          throw new Error('Erro ao alterar email')
        }

        const index = usuarios.value.findIndex(u => u.id === usuarioParaEmail.value.id)
        if (index !== -1) {
          usuarios.value[index].email = novoEmail.value
          salvarCache()
        }

        if (usuarioEditando.value && usuarioEditando.value.id === usuarioParaEmail.value.id) {
          usuarioEditando.value.email = novoEmail.value
        }

        $q.notify({
          color: 'positive',
          message: `Email de ${usuarioParaEmail.value.username} alterado com sucesso`,
          icon: 'check_circle',
          position: 'top-right'
        })

        dialogEmail.value = false
      } catch (error) {
        console.error('Erro ao alterar email:', error)
        $q.notify({
          color: 'negative',
          message: 'Erro ao alterar email do usuário',
          icon: 'error',
          position: 'top-right'
        })
      } finally {
        salvandoEmail.value = false
      }
    }

    const confirmarExclusaoUnica = (usuario) => {
      $q.dialog({
        title: 'Excluir Usuário',
        message: `Deseja realmente excluir o usuário ${usuario.username}? Esta ação não pode ser desfeita.`,
        ok: { label: 'Excluir', color: 'negative' },
        cancel: { label: 'Cancelar', flat: true },
        persistent: true
      }).onOk(async () => {
        await excluirUsuario(usuario.id)
      })
    }

    const confirmarExclusaoMultipla = () => {
      const ids = selectedRows.value.map(row => row.id)
      $q.dialog({
        title: 'Excluir Usuários',
        message: `Deseja realmente excluir ${ids.length} usuário(s)? Esta ação não pode ser desfeita.`,
        ok: { label: 'Excluir', color: 'negative' },
        cancel: { label: 'Cancelar', flat: true },
        persistent: true
      }).onOk(async () => {
        let sucessos = 0
        for (const id of ids) {
          const sucesso = await excluirUsuario(id, false)
          if (sucesso) sucessos++
        }

        if (sucessos > 0) {
          $q.notify({
            color: 'positive',
            message: `${sucessos} usuário(s) excluído(s) com sucesso!`,
            icon: 'check_circle',
            position: 'top-right'
          })
        }
        selectedRows.value = []
      })
    }

    const excluirUsuario = async (id, mostrarNotificacao = true) => {
      try {
        const response = await fetch(`${API_URL}/members/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error('Erro ao excluir usuário')
        }

        usuarios.value = usuarios.value.filter(u => u.id !== id)
        salvarCache()

        if (usuarioEditando.value && usuarioEditando.value.id === id) {
          dialogEdicao.value = false
          usuarioEditando.value = null
        }

        if (mostrarNotificacao) {
          $q.notify({
            color: 'positive',
            message: 'Usuário excluído com sucesso!',
            icon: 'check_circle',
            position: 'top-right'
          })
        }

        return true
      } catch (error) {
        console.error('Erro ao excluir usuário:', error)
        if (mostrarNotificacao) {
          $q.notify({
            color: 'negative',
            message: 'Erro ao excluir usuário',
            icon: 'error',
            position: 'top-right'
          })
        }
        return false
      }
    }

    const limparSelecao = () => {
      selectedRows.value = []
    }

    // =========================
    // FUNÇÕES AUXILIARES
    // =========================
    const formatarData = (data) => {
      if (!data) return ''
      return new Date(data).toLocaleDateString('pt-BR')
    }

    const formatarHora = (data) => {
      if (!data) return ''
      return data.toLocaleTimeString('pt-BR')
    }

    const formatarDataCompleta = (data) => {
      if (!data) return ''
      return new Date(data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatarDataRelativa = (data) => {
      if (!data) return 'Nunca'
      const agora = new Date()
      const diff = agora - data
      const dias = Math.floor(diff / (1000 * 60 * 60 * 24))
      const horas = Math.floor(diff / (1000 * 60 * 60))
      const minutos = Math.floor(diff / (1000 * 60))

      if (dias > 0) return `${dias} dia(s) atrás`
      if (horas > 0) return `${horas} hora(s) atrás`
      if (minutos > 0) return `${minutos} minuto(s) atrás`
      return 'agora mesmo'
    }

    const formatarCargo = (cargo) => {
      if (!cargo) return 'Membro'
      return cargo.charAt(0).toUpperCase() + cargo.slice(1)
    }

    const getCargoIcone = (cargo) => {
      const icones = {
        master: 'stars',
        gerente: 'admin_panel_settings',
        admin: 'shield',
        moderador: 'gavel',
        ajudante: 'support',
        parceiro: 'handshake',
        safira: 'diamond',
        ruby: 'diamond',
        gold: 'star',
        membro: 'person'
      }
      return icones[cargo] || 'person'
    }

    const getCargoCor = (cargo) => {
      const cores = {
        master: 'red-10',
        gerente: 'red-8',
        admin: 'orange-8',
        moderador: 'green-7',
        ajudante: 'blue-6',
        parceiro: 'purple-6',
        safira: 'blue-8',
        ruby: 'red-5',
        gold: 'amber-6',
        membro: 'grey-6'
      }
      return cores[cargo] || 'grey-6'
    }

    const aplicarFiltros = () => {
      $q.notify({
        color: 'info',
        message: 'Filtros aplicados',
        icon: 'filter_list',
        position: 'top-right',
        timeout: 1500
      })
    }

    // =========================
    // CYCLE
    // =========================
    onMounted(async () => {
      carregarCacheInicial()
      await carregarUsuarios()
      conectarWebSocket()
    })

    onUnmounted(() => {
      if (ws) {
        ws.close()
      }
    })

    return {
      // Estados
      filtros,
      loading,
      loadingInicial,
      recarregando,
      erroCarregamento,
      selectedRows,
      dialogEdicao,
      dialogCargo,
      dialogEmail,
      dialogNovoUsuario,
      usuarioEditando,
      usuarioParaCargo,
      usuarioParaEmail,
      novoCargo,
      novoEmail,
      salvandoCargo,
      salvandoEmail,
      criandoUsuario,
      novoUsuarioData,
      pagination,
      columns,
      cargoOptions,
      statusUsuarioOptions,
      usuarios,
      ultimaAtualizacao,

      // Computed
      estatisticas,
      usuariosFiltrados,

      // Funções
      formatarData,
      formatarHora,
      formatarDataCompleta,
      formatarDataRelativa,
      formatarCargo,
      getCargoIcone,
      getCargoCor,
      abrirDialogNovoUsuario,
      criarNovoUsuario,
      limparFormularioNovoUsuario,
      abrirDialogEdicao,
      abrirDialogCargo,
      abrirDialogEmail,
      salvarCargo,
      salvarEmail,
      confirmarExclusaoUnica,
      confirmarExclusaoMultipla,
      limparSelecao,
      aplicarFiltros,
      recarregarDados
    }
  }
}
</script>

<style scoped>
.stat-card {
  transition: transform 0.2s;
   background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.table-card {
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.status-badge {
  font-size: 11px;
  padding: 4px 8px;
}

@media (max-width: 600px) {
  .q-page {
    padding: 16px !important;
  }
}
</style>
