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
                    <q-icon name="receipt_long" size="28px" color="negative" class="q-mr-sm" />
                    Logs do Sistema
                  </div>
                  <div class="text-subtitle2 text-grey-7 q-mt-sm">
                    Monitore todas as atividades e eventos do sistema em tempo real
                  </div>
                </div>
                <div>
                  <q-btn
                    color="primary"
                    icon="refresh"
                    label="Atualizar"
                    unelevated
                    @click="recarregarDados"
                    :loading="recarregando"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Loading com Skeleton -->
          <div v-if="loadingInicial" class="q-pa-md">
            <!-- Skeleton para estatísticas -->
            <div class="row q-col-gutter-md q-mb-lg">
              <div class="col-12 col-sm-6 col-md-3" v-for="i in 4" :key="i">
                <q-skeleton type="rect" height="100px" animation="wave" />
              </div>
            </div>

            <!-- Skeleton para filtros -->
            <div class="row q-col-gutter-md q-mb-lg">
              <div class="col-12 col-md-3">
                <q-skeleton type="rect" height="56px" animation="wave" />
              </div>
              <div class="col-12 col-md-2">
                <q-skeleton type="rect" height="56px" animation="wave" />
              </div>
              <div class="col-12 col-md-2">
                <q-skeleton type="rect" height="56px" animation="wave" />
              </div>
              <div class="col-12 col-md-3">
                <q-skeleton type="rect" height="56px" animation="wave" />
              </div>
              <div class="col-12 col-md-2">
                <q-skeleton type="rect" height="56px" animation="wave" />
              </div>
            </div>

            <!-- Skeleton para tabela -->
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
              <div class="col-12 col-md-3">
                <q-input
                  v-model="filtros.busca"
                  label="Buscar logs"
                  outlined
                  dense
                  clearable
                  placeholder="Mensagem, usuário, IP..."
                >
                  <template v-slot:prepend>
                    <q-icon name="search" color="primary" />
                  </template>
                </q-input>
              </div>
              <div class="col-6 col-md-2">
                <q-select
                  v-model="filtros.nivel"
                  :options="nivelOptions"
                  label="Nível"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                />
              </div>
              <div class="col-6 col-md-2">
                <q-select
                  v-model="filtros.tipo"
                  :options="tipoOptions"
                  label="Tipo de Evento"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                />
              </div>
              <div class="col-12 col-md-3">
                <q-select
                  v-model="filtros.modulo"
                  :options="moduloOptions"
                  label="Módulo"
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

            <!-- Tabela de Logs -->
            <q-card class="table-card">
              <div class="text-subtitle1 text-weight-medium" style="padding: 1em; margin-bottom: -15px;">
                <q-icon name="list_alt" size="20px" color="positive" class="q-mr-xs" />
                Registros de Log
                <span v-if="ultimaAtualizacao" class="text-caption text-grey-6 q-ml-md">
                  Última atualização: {{ formatarHora(ultimaAtualizacao) }}
                </span>
                <q-badge
                  v-if="conexaoWebSocket"
                  color="positive"
                  label="Tempo Real"
                  class="q-ml-sm"
                />
              </div>
              <q-card-section style="background: none">
                <q-table
                  :rows="logsFiltrados"
                  :columns="columns"
                  row-key="id"
                  :loading="loading"
                  :pagination="pagination"
                  @row-click="(evt, row) => !evt.target.closest('.q-btn') && abrirDialog(row)"
                  class="logs-table"
                  binary-state-sort
                  :rows-per-page-options="[10, 25, 50, 100]"
                >
                  <!-- Coluna nível customizada -->
                  <template v-slot:body-cell-nivel="props">
                    <q-td :props="props">
                      <q-badge
                        :color="getNivelCor(props.row.nivel)"
                        :label="props.row.nivel"
                        class="nivel-badge"
                      />
                    </q-td>
                  </template>

                  <!-- Coluna tipo customizada -->
                  <template v-slot:body-cell-tipo="props">
                    <q-td :props="props">
                      <q-chip
                        :color="getTipoCor(props.row.tipo)"
                        text-color="white"
                        size="sm"
                        :icon="getTipoIcone(props.row.tipo)"
                      >
                        {{ props.row.tipo }}
                      </q-chip>
                    </q-td>
                  </template>

                  <!-- Coluna mensagem customizada -->
                  <template v-slot:body-cell-mensagem="props">
                    <q-td :props="props">
                      <div class="ellipsis-2-lines" style="max-width: 400px;">
                        {{ props.row.mensagem }}
                      </div>
                    </q-td>
                  </template>

                  <!-- Coluna ações -->
                  <template v-slot:body-cell-acoes="props">
                    <q-td :props="props">
                      <q-btn
                        flat
                        round
                        dense
                        icon="visibility"
                        color="primary"
                        @click.stop="abrirDialog(props.row)"
                        size="sm"
                      >
                        <q-tooltip>Visualizar detalhes</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        round
                        dense
                        icon="content_copy"
                        color="grey"
                        @click.stop="copiarLog(props.row)"
                        size="sm"
                        class="q-ml-xs"
                      >
                        <q-tooltip>Copiar log</q-tooltip>
                      </q-btn>
                    </q-td>
                  </template>

                  <!-- Loading -->
                  <template v-slot:loading>
                    <q-inner-loading showing color="primary" />
                  </template>

                  <!-- Nenhum resultado -->
                  <template v-slot:no-data>
                    <div class="text-center justify-center q-pa-xl" style="margin: 0 auto">
                      <q-icon name="inbox" size="48px" color="grey-4" />
                      <div class="text-subtitle1 text-grey-6 q-mt-md">
                        Nenhum log encontrado
                      </div>
                      <div class="text-caption text-grey-5 q-mt-sm">
                        Tente ajustar os filtros ou aguarde novos eventos
                      </div>
                    </div>
                  </template>
                </q-table>
              </q-card-section>
            </q-card>

            <!-- Resumo de Logs por Hora -->
            <q-card class="q-mt-lg table-card">
              <q-card-section>
                <div class="text-subtitle1 text-weight-medium q-mb-md">
                  <q-icon name="bar_chart" size="20px" color="primary" class="q-mr-xs" />
                  Atividade nas Últimas 24 Horas
                </div>
                <div class="row q-col-gutter-md">
                  <div class="col-12">
                    <div class="chart-placeholder">
                      <!-- Placeholder para gráfico - substituir por Chart.js ou similar -->
                      <div class="row items-center justify-center" style="min-height: 250px;">
                        <q-icon name="analytics" size="64px" color="grey-4" />
                        <div class="text-caption text-grey-5 q-ml-md">
                          Gráfico de atividade será exibido aqui
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Dialog de Detalhes do Log -->
        <q-dialog v-model="dialogVisible" :maximized="false">
          <q-card style="min-width: 700px; max-width: 900px; width: 80%; border-radius: 30px;">
            <q-card-section class="bg-primary text-white row items-center">
              <div class="col-10">
                <div class="text-caption text-white text-weight-medium">
                  LOG #{{ logDetalhe?.id }}
                </div>
                <div class="text-h6 text-weight-medium">
                  {{ logDetalhe?.tipo }} - {{ logDetalhe?.modulo }}
                </div>
              </div>
              <div class="col-2 text-right">
                <q-btn flat round dense icon="close" v-close-popup class="text-white" />
              </div>
            </q-card-section>

            <q-card-section class="q-pt-md" v-if="logDetalhe">
              <div class="row q-col-gutter-md">
                <!-- Informações principais -->
                <div class="col-12 col-md-6">
                  <q-list separator>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Nível</q-item-label>
                        <q-item-label>
                          <q-badge
                            :color="getNivelCor(logDetalhe.nivel)"
                            :label="logDetalhe.nivel"
                            size="md"
                          />
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Tipo de Evento</q-item-label>
                        <q-item-label class="text-weight-medium">
                          <q-icon :name="getTipoIcone(logDetalhe.tipo)" size="18px" class="q-mr-xs" />
                          {{ logDetalhe.tipo }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Módulo</q-item-label>
                        <q-item-label>{{ logDetalhe.modulo }}</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Usuário</q-item-label>
                        <q-item-label>
                          <q-icon name="person" size="16px" class="q-mr-xs" />
                          {{ logDetalhe.usuario || 'Sistema' }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>

                <!-- Informações técnicas -->
                <div class="col-12 col-md-6">
                  <q-list dense separator>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Data/Hora</q-item-label>
                        <q-item-label>{{ formatarDataCompleta(logDetalhe.data) }}</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Endereço IP</q-item-label>
                        <q-item-label>
                          <q-icon name="language" size="16px" class="q-mr-xs" />
                          {{ logDetalhe.ip || 'N/A' }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Navegador/SO</q-item-label>
                        <q-item-label class="text-caption">
                          {{ logDetalhe.userAgent || 'N/A' }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label caption>ID da Sessão</q-item-label>
                        <q-item-label class="text-caption text-mono">
                          {{ logDetalhe.sessionId || 'N/A' }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>

              <!-- Mensagem Completa -->
              <q-separator class="q-my-md" />
              <div class="text-subtitle2 text-weight-medium q-mb-sm text-grey-8">
                Mensagem:
              </div>
              <div class="text-body2 bg-grey-2 q-pa-md" style="border-radius: 20px; font-family: monospace;">
                {{ logDetalhe.mensagem }}
              </div>

              <!-- Dados Adicionais (JSON) -->
              <div v-if="logDetalhe.dadosAdicionais" class="q-mt-md">
                <div class="text-subtitle2 text-weight-medium q-mb-sm text-grey-8">
                  Dados Adicionais:
                </div>
                <pre class="json-viewer bg-grey-2 q-pa-md" style="border-radius: 20px; overflow-x: auto;">{{ formatarJSON(logDetalhe.dadosAdicionais) }}</pre>
              </div>

              <!-- Stack Trace (apenas para erros) -->
              <div v-if="logDetalhe.stackTrace && logDetalhe.nivel === 'Erro'" class="q-mt-md">
                <div class="text-subtitle2 text-weight-medium q-mb-sm text-negative">
                  <q-icon name="bug_report" size="18px" class="q-mr-xs" />
                  Stack Trace:
                </div>
                <pre class="stack-trace bg-negative-1 q-pa-md" style="border-radius: 20px; overflow-x: auto; font-size: 12px;">{{ logDetalhe.stackTrace }}</pre>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-actions align="right" class="q-pa-md">
              <q-btn
                label="Copiar Log"
                icon="content_copy"
                color="primary"
                @click="copiarLog(logDetalhe)"
              />
              <q-btn label="Fechar" color="grey" v-close-popup />
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
  name: 'LogsSistema',

  setup() {
    const $q = useQuasar()

    // =========================
    // ESTADOS
    // =========================
    const loadingInicial = ref(false)
    const loading = ref(false)
    const recarregando = ref(false)
    const erroCarregamento = ref('')

    const dialogVisible = ref(false)
    const logDetalhe = ref(null)

    // WebSocket
    let ws = null
    const conexaoWebSocket = ref(null)
    const ultimaAtualizacao = ref(null)

    // Filtros
    const filtros = ref({
      busca: '',
      nivel: null,
      tipo: null,
      modulo: null
    })

    // Paginação da tabela
    const pagination = ref({
      sortBy: 'data',
      descending: true,
      page: 1,
      rowsPerPage: 25
    })

    // Colunas da tabela
    const columns = ref([
      { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true, style: 'width: 70px' },
      { name: 'nivel', label: 'Nível', field: 'nivel', align: 'left', sortable: true, style: 'width: 100px' },
      { name: 'tipo', label: 'Tipo', field: 'tipo', align: 'left', sortable: true, style: 'width: 100px' },
      { name: 'modulo', label: 'Módulo', field: 'modulo', align: 'left', sortable: true, style: 'width: 120px' },
      { name: 'mensagem', label: 'Mensagem', field: 'mensagem', align: 'left', sortable: false, style: 'min-width: 300px' },
      { name: 'usuario', label: 'Usuário', field: 'usuario', align: 'left', sortable: true, style: 'width: 120px' },
      {
        name: 'data',
        label: 'Data/Hora',
        field: row => formatarDataHora(row.data),
        sortable: true,
        style: 'width: 140px'
      },
      { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center', style: 'width: 100px' }
    ])

    const nivelOptions = ref([
      { label: 'Info', value: 'Info' },
      { label: 'Aviso', value: 'Aviso' },
      { label: 'Erro', value: 'Erro' },
      { label: 'Debug', value: 'Debug' }
    ])

    const tipoOptions = ref([
      { label: 'Autenticação', value: 'Autenticação' },
      { label: 'CRUD', value: 'CRUD' },
      { label: 'Sistema', value: 'Sistema' },
      { label: 'Segurança', value: 'Segurança' },
      { label: 'Performance', value: 'Performance' }
    ])

    const moduloOptions = ref([
      { label: 'Chamados', value: 'Chamados' },
      { label: 'Usuários', value: 'Usuários' },
      { label: 'Dashboard', value: 'Dashboard' },
      { label: 'Logs', value: 'Logs' },
      { label: 'Configurações', value: 'Configurações' }
    ])

    const logs = ref([])

    // =========================
    // FUNÇÃO DE CACHE
    // =========================
    const carregarCacheInicial = () => {
      const cacheLogs = localStorage.getItem('cache_logs_sistema')
      const cacheOpcoes = localStorage.getItem('cache_logs_opcoes')

      if (cacheLogs) {
        const parsed = JSON.parse(cacheLogs)
        logs.value = parsed.map(log => ({
          ...log,
          data: log.data ? new Date(log.data) : null
        }))
      }

      if (cacheOpcoes) {
        const opcoes = JSON.parse(cacheOpcoes)
        tipoOptions.value = opcoes.tipos || tipoOptions.value
        moduloOptions.value = opcoes.modulos || moduloOptions.value
      }

      // Se não tiver cache, mostra skeleton
      if (!cacheLogs) {
        loadingInicial.value = true
      }
    }

    const salvarCache = () => {
      localStorage.setItem('cache_logs_sistema', JSON.stringify(logs.value))
      localStorage.setItem('cache_logs_opcoes', JSON.stringify({
        tipos: tipoOptions.value,
        modulos: moduloOptions.value
      }))
    }

    // =========================
    // WEBHOOK - ATUALIZAÇÕES EM TEMPO REAL
    // =========================
    const conectarWebSocket = () => {
      try {
        ws = new WebSocket(WS_URL)

        ws.onopen = () => {
          console.log('WebSocket de Logs conectado')
          conexaoWebSocket.value = true
        }

        ws.onmessage = (event) => {
          try {
            const dados = JSON.parse(event.data)

            // Processa apenas eventos de log
            if (dados.event && dados.event.startsWith('log_')) {
              processarMensagemWebSocket(dados)
              ultimaAtualizacao.value = new Date()
            }
          } catch (error) {
            console.error('Erro ao processar mensagem WebSocket de log:', error)
          }
        }

        ws.onerror = (error) => {
          console.error('WebSocket de Logs error:', error)
          conexaoWebSocket.value = false
        }

        ws.onclose = () => {
          console.log('WebSocket de Logs desconectado, tentando reconectar em 5 segundos...')
          conexaoWebSocket.value = false
          setTimeout(conectarWebSocket, 5000)
        }
      } catch (error) {
        console.error('Erro ao conectar WebSocket de Logs:', error)
        conexaoWebSocket.value = false
        setTimeout(conectarWebSocket, 5000)
      }
    }

    const processarMensagemWebSocket = (mensagem) => {
      // Estrutura esperada da mensagem WebSocket
      // { event: 'log_novo', data: {...} }
      // { event: 'log_atualizado', data: {...} }

      switch (mensagem.event) {
        case 'log_novo':
          adicionarLogViaWebSocket(mensagem.data)
          break
        case 'log_atualizado':
          atualizarLogViaWebSocket(mensagem.data)
          break
        default:
          console.log('Evento de log não processado:', mensagem.event)
      }
    }

    const adicionarLogViaWebSocket = (logData) => {
      const novoLog = formatarLog(logData)

      // Verifica se já existe
      const existe = logs.value.some(l => l.id === novoLog.id)
      if (!existe) {
        logs.value.unshift(novoLog)
        salvarCache()

        // Notificação apenas para erros
        if (novoLog.nivel === 'Erro') {
          $q.notify({
            color: 'negative',
            message: `Erro detectado: ${novoLog.mensagem.substring(0, 100)}`,
            icon: 'error',
            position: 'top-right',
            timeout: 5000,
            actions: [{ label: 'Ver', color: 'white', handler: () => abrirDialog(novoLog) }]
          })
        }
      }
    }

    const atualizarLogViaWebSocket = (logData) => {
      const index = logs.value.findIndex(l => l.id === logData.id)
      if (index !== -1) {
        const logAtualizado = {
          ...logs.value[index],
          ...formatarLog(logData)
        }

        logs.value[index] = logAtualizado
        salvarCache()

        // Atualiza o detalhe se estiver aberto
        if (logDetalhe.value && logDetalhe.value.id === logAtualizado.id) {
          logDetalhe.value = logAtualizado
        }
      }
    }

    const formatarLog = (log) => ({
      id: log.id,
      nivel: log.nivel || 'Info',
      tipo: log.tipo || 'Sistema',
      modulo: log.modulo || 'Geral',
      mensagem: log.mensagem || '',
      usuario: log.usuario || 'Sistema',
      ip: log.ip || null,
      userAgent: log.user_agent || null,
      sessionId: log.session_id || null,
      dadosAdicionais: log.dados_adicionais ?
        (typeof log.dados_adicionais === 'string' ? JSON.parse(log.dados_adicionais) : log.dados_adicionais)
        : null,
      stackTrace: log.stack_trace || null,
      data: log.data_criacao ? new Date(log.data_criacao) : new Date()
    })

    // =========================
    // CARREGAR DADOS INICIAIS
    // =========================
    const carregarDadosIniciais = async () => {
      try {
        const response = await api.get('/logs')

        if (response.data.success) {
          logs.value = response.data.data.map(log => formatarLog(log))
          salvarCache()
          erroCarregamento.value = ''
        } else {
          throw new Error(response.data.message || 'Erro ao carregar logs')
        }
      } catch (error) {
        console.error('Erro ao carregar logs:', error)

        // Se não conseguir carregar, usa dados mockados para demonstração
        if (logs.value.length === 0) {
          logs.value = gerarLogsMockados()
          salvarCache()
        }

        erroCarregamento.value = 'Erro ao carregar logs.'

        $q.notify({
          color: 'warning',
          message: erroCarregamento.value,
          icon: 'warning',
          position: 'top-right'
        })
      } finally {
        loadingInicial.value = false
        loading.value = false
      }
    }

    const recarregarDados = async () => {
      recarregando.value = true
      erroCarregamento.value = ''
      loadingInicial.value = true

      await carregarDadosIniciais()

      recarregando.value = false
    }

    // =========================
    // DADOS MOCKADOS
    // =========================
    const gerarLogsMockados = () => {
      const logsMock = []
      const niveis = ['Info', 'Aviso', 'Erro', 'Debug']
      const tipos = ['Autenticação', 'CRUD', 'Sistema', 'Segurança', 'Performance']
      const modulos = ['Chamados', 'Usuários', 'Dashboard', 'Logs', 'Configurações']
      const mensagens = {
        'Autenticação': [
          'Login bem-sucedido',
          'Logout realizado',
          'Tentativa de login falhou',
          'Senha alterada com sucesso',
          'Token de acesso renovado'
        ],
        'CRUD': [
          'Registro criado com sucesso',
          'Registro atualizado',
          'Registro excluído',
          'Consulta realizada',
          'Operação em lote executada'
        ],
        'Sistema': [
          'Sistema iniciado',
          'Backup automático concluído',
          'Limpeza de cache realizada',
          'Scheduler executado',
          'Manutenção programada iniciada'
        ],
        'Segurança': [
          'Acesso não autorizado detectado',
          'IP bloqueado temporariamente',
          'Varredura de segurança concluída',
          'Certificado SSL renovado',
          'Política de senha atualizada'
        ],
        'Performance': [
          'Tempo de resposta elevado',
          'Uso de memória acima do normal',
          'Conexões simultâneas: 150',
          'Cache hit rate: 85%',
          'Otimização de queries aplicada'
        ]
      }
      const usuarios = ['Sistema', 'admin@email.com', 'suporte@email.com', 'dev@email.com', 'monitor@email.com']
      const ips = ['192.168.1.100', '10.0.0.1', '172.16.0.50', '8.8.8.8', '127.0.0.1']

      for (let i = 1000; i > 0; i--) {
        const tipo = tipos[Math.floor(Math.random() * tipos.length)]
        const nivel = niveis[Math.floor(Math.random() * niveis.length)]
        const modulo = modulos[Math.floor(Math.random() * modulos.length)]
        const mensagensTipo = mensagens[tipo]
        const mensagem = mensagensTipo[Math.floor(Math.random() * mensagensTipo.length)]

        logsMock.push({
          id: i,
          nivel,
          tipo,
          modulo,
          mensagem: `${mensagem} - ID: ${Math.random().toString(36).substring(7)}`,
          usuario: usuarios[Math.floor(Math.random() * usuarios.length)],
          ip: ips[Math.floor(Math.random() * ips.length)],
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          sessionId: `session_${Math.random().toString(36).substring(7)}`,
          dadosAdicionais: nivel === 'Erro' ? { error_code: 500, endpoint: '/api/endpoint' } : null,
          stackTrace: nivel === 'Erro' ? 'Error: Something went wrong\n    at processRequest (server.js:125)\n    at handleRoute (router.js:89)' : null,
          data: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000))
        })
      }

      return logsMock.sort((a, b) => b.data - a.data)
    }

    // =========================
    // ESTATÍSTICAS
    // =========================
    const estatisticas = computed(() => [
      { label: 'Total de Logs', valor: logs.value.length, icone: 'receipt_long', cor: 'primary' },
      { label: 'Erros', valor: logs.value.filter(l => l.nivel === 'Erro').length, icone: 'error', cor: 'negative' },
      { label: 'Avisos', valor: logs.value.filter(l => l.nivel === 'Aviso').length, icone: 'warning', cor: 'warning' },
      { label: 'Info/Debug', valor: logs.value.filter(l => l.nivel === 'Info' || l.nivel === 'Debug').length, icone: 'info', cor: 'info' }
    ])

    // Logs filtrados
    const logsFiltrados = computed(() => {
      let resultado = [...logs.value]

      if (filtros.value.busca) {
        const buscaLower = filtros.value.busca.toLowerCase()
        resultado = resultado.filter(l =>
          l.mensagem.toLowerCase().includes(buscaLower) ||
          l.usuario.toLowerCase().includes(buscaLower) ||
          l.ip?.toLowerCase().includes(buscaLower)
        )
      }

      if (filtros.value.nivel) {
        resultado = resultado.filter(l => l.nivel === filtros.value.nivel)
      }

      if (filtros.value.tipo) {
        resultado = resultado.filter(l => l.tipo === filtros.value.tipo)
      }

      if (filtros.value.modulo) {
        resultado = resultado.filter(l => l.modulo === filtros.value.modulo)
      }

      resultado.sort((a, b) => b.data - a.data)

      return resultado
    })

    // =========================
    // FUNÇÕES AUXILIARES
    // =========================
    const formatarDataHora = (data) => {
      if (!data) return ''
      return data.toLocaleString('pt-BR')
    }

    const formatarHora = (data) => {
      if (!data) return ''
      return data.toLocaleTimeString('pt-BR')
    }

    const formatarDataCompleta = (data) => {
      if (!data) return ''
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }

    const formatarJSON = (json) => {
      try {
        if (typeof json === 'string') {
          json = JSON.parse(json)
        }
        return JSON.stringify(json, null, 2)
      } catch {
        return json
      }
    }

    const getNivelCor = (nivel) => {
      const n = nivel?.toLowerCase()
      const cores = {
        info: 'info',
        aviso: 'warning',
        erro: 'negative',
        debug: 'grey'
      }
      return cores[n] || 'grey'
    }

    const getTipoCor = (tipo) => {
      const t = tipo?.toLowerCase()
      const cores = {
        autenticação: 'primary',
        crud: 'positive',
        sistema: 'purple',
        segurança: 'orange',
        performance: 'teal'
      }
      return cores[t] || 'grey'
    }

    const getTipoIcone = (tipo) => {
      const t = tipo?.toLowerCase()
      const icones = {
        autenticação: 'login',
        crud: 'edit',
        sistema: 'settings',
        segurança: 'security',
        performance: 'speed'
      }
      return icones[t] || 'receipt_long'
    }

    const abrirDialog = (log) => {
      logDetalhe.value = log
      dialogVisible.value = true
    }

    const copiarLog = (log) => {
      const texto = `[${formatarDataCompleta(log.data)}] [${log.nivel}] [${log.tipo}] ${log.mensagem}`

      navigator.clipboard.writeText(texto).then(() => {
        $q.notify({
          color: 'positive',
          message: 'Log copiado para a área de transferência!',
          icon: 'check_circle',
          position: 'top-right',
          timeout: 2000
        })
      }).catch(() => {
        $q.notify({
          color: 'negative',
          message: 'Erro ao copiar log',
          icon: 'error',
          position: 'top-right'
        })
      })
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
      await carregarDadosIniciais()
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
      dialogVisible,
      logDetalhe,
      pagination,
      columns,
      nivelOptions,
      tipoOptions,
      moduloOptions,
      logs,
      conexaoWebSocket,
      ultimaAtualizacao,

      // Computed
      estatisticas,
      logsFiltrados,

      // Funções
      formatarDataHora,
      formatarHora,
      formatarDataCompleta,
      formatarJSON,
      getNivelCor,
      getTipoCor,
      getTipoIcone,
      abrirDialog,
      copiarLog,
      aplicarFiltros,
      recarregarDados,
      carregarLogs: carregarDadosIniciais
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1400px;
  margin: 0 auto;
}

.q-list--separator > .q-item-type + .q-item-type,
.q-list--separator > .q-virtual-scroll__content > .q-item-type + .q-item-type {
  border-top: none;
}

.table-card,
.stat-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.stat-card {
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.nivel-badge {
  font-weight: 500;
  padding: 4px 8px;
  min-width: 60px;
  text-align: center;
}

/* Estilos da tabela */
.logs-table :deep(.q-table__top) {
  padding: 12px 16px;
}

.logs-table :deep(.q-table__title) {
  font-size: 1rem;
  font-weight: 500;
}

.logs-table :deep(th) {
  font-weight: 600;
  background-color: #f5f5f5;
}

.logs-table :deep(tr) {
  cursor: pointer;
  transition: all 0.2s ease;
}

.logs-table :deep(tr:hover) {
  background-color: rgba(25, 118, 210, 0.04);
}

/* Ellipsis para mensagens longas */
.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* JSON Viewer */
.json-viewer {
  font-size: 13px;
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}

/* Stack Trace */
.stack-trace {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
}

/* Chart Placeholder */
.chart-placeholder {
  background: #fafafa;
  border-radius: 12px;
  border: 2px dashed #e0e0e0;
}

/* Monospace text */
.text-mono {
  font-family: 'Courier New', monospace;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0;
  }

  .logs-table :deep(.q-table__card) {
    overflow-x: auto;
  }
}
</style>
