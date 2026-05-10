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
                    <q-icon name="chat" size="28px" color="negative" class="q-mr-sm" />
                    Chamados (Admin)
                  </div>
                  <div class="text-subtitle2 text-grey-7 q-mt-sm">
                    Acompanhe todos os chamados abertos por você e sua equipe
                  </div>
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
                  label="Buscar chamados"
                  outlined
                  dense
                  clearable
                  placeholder="ID, título ou descrição..."
                >
                  <template v-slot:prepend>
                    <q-icon name="search" color="primary" />
                  </template>
                </q-input>
              </div>
              <div class="col-6 col-md-2">
                <q-select
                  v-model="filtros.status"
                  :options="statusOptions"
                  label="Status"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                />
              </div>
              <div class="col-6 col-md-2">
                <q-select
                  v-model="filtros.prioridade"
                  :options="prioridadeOptions"
                  label="Prioridade"
                  outlined
                  dense
                  clearable
                  emit-value
                  map-options
                />
              </div>
              <div class="col-12 col-md-3">
                <q-select
                  v-model="filtros.categoria"
                  :options="categoriaOptions"
                  label="Categoria"
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
                      <strong>{{ selectedRows.length }}</strong> chamado(s) selecionado(s)
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

            <!-- Tabela de Chamados -->
            <q-card class="table-card">
              <div class="text-subtitle1 text-weight-medium" style="padding: 1em; margin-bottom: -15px;">
                <q-icon name="info" size="20px" color="positive" class="q-mr-xs" />
                Chamados
                <span v-if="ultimaAtualizacao" class="text-caption text-grey-6 q-ml-md">
                  Última atualização: {{ formatarHora(ultimaAtualizacao) }}
                </span>
              </div>
              <q-card-section style="background: none">
                <q-table
                  :rows="chamadosFiltrados"
                  :columns="columns"
                  row-key="id"
                  :loading="loading"
                  :pagination="pagination"
                  @row-click="(evt, row) => !evt.target.closest('.q-btn') && abrirDialog(row)"
                  selection="multiple"
                  v-model:selected="selectedRows"
                  class="chamados-table"
                  binary-state-sort
                  :rows-per-page-options="[5, 10, 25, 50]"
                >
                  <!-- Coluna prioridade customizada -->
                  <template v-slot:body-cell-prioridade="props">
                    <q-td :props="props">
                      <q-chip
                        :color="getPrioridadeCor(props.row.prioridade)"
                        text-color="white"
                        size="sm"
                      >
                        <q-icon :name="getPrioridadeIcone(props.row.prioridade)" size="14px" class="q-mr-xs" />
                        {{ props.row.prioridade }}
                      </q-chip>
                    </q-td>
                  </template>

                  <!-- Coluna status customizada -->
                  <template v-slot:body-cell-status="props">
                    <q-td :props="props">
                      <q-badge :color="getStatusCor(props.row.status)" :label="props.row.status" class="status-badge" />
                    </q-td>
                  </template>

                  <!-- Coluna SLA restante -->
                  <template v-slot:body-cell-slaRestante="props">
                    <q-td :props="props">
                      <div class="flex items-center">
                        <span :class="getSlaTextCor(props.row.slaRestante)">
                          {{ props.row.slaRestante }}
                        </span>
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
                        icon="delete"
                        color="negative"
                        @click.stop="confirmarExclusaoUnica(props.row)"
                        size="sm"
                        class="q-ml-xs"
                      >
                        <q-tooltip>Excluir chamado</q-tooltip>
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
                        Nenhum chamado encontrado
                      </div>
                      <div class="text-caption text-grey-5 q-mt-sm">
                        Tente ajustar os filtros ou crie um novo chamado
                      </div>
                    </div>
                  </template>
                </q-table>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Dialog de Detalhes do Chamado -->
        <q-dialog v-model="dialogVisible" :maximized="false">
          <q-card style="min-width: 700px; max-width: 900px; width: 80%; border-radius: 30px;">
            <q-card-section class="bg-primary text-white row items-center">
              <div class="col-10">
                <div class="text-caption text-white text-weight-medium">
                  CHAMADO #{{ chamadoDetalhe?.id }}
                </div>
                <div class="text-h6 text-weight-medium">
                  {{ chamadoDetalhe?.titulo }}
                </div>
              </div>
              <div class="col-2 text-right">
                <q-btn flat round dense icon="close" v-close-popup class="text-white" />
              </div>
            </q-card-section>

            <q-card-section class="q-pt-md" v-if="chamadoDetalhe">
              <div class="row q-col-gutter-md">
                <!-- Informações principais -->
                <div class="col-12 col-md-6">
                  <q-list separator>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Prioridade</q-item-label>
                        <q-item-label :class="`text-${getPrioridadeCor(chamadoDetalhe.prioridade)}`" class="text-weight-medium">
                          <q-chip
                            :color="getPrioridadeCor(chamadoDetalhe.prioridade)"
                            text-color="white"
                            size="sm"
                          >
                            <q-icon :name="getPrioridadeIcone(chamadoDetalhe.prioridade)" size="13px" class="q-mr-xs" />
                            {{ chamadoDetalhe.prioridade }}
                          </q-chip>
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Status</q-item-label>
                        <q-item-label>
                          <q-badge :color="getStatusCor(chamadoDetalhe.status)" :label="chamadoDetalhe.status" size="md" />
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label caption>INFORMAÇÕES GERAIS</q-item-label>
                        <q-item-label>Categoria: {{ chamadoDetalhe.categoria }}</q-item-label>
                        <q-item-label caption class="text-grey-6">Subcategoria: {{ chamadoDetalhe.subcategoria }}</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label>Aberto por {{ chamadoDetalhe.quemAbre }}</q-item-label>
                        <q-item-label caption class="text-grey-6">{{ formatarDataCompleta(chamadoDetalhe.dataAbertura) }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>

                <!-- Datas e SLA -->
                <div class="col-12 col-md-6">
                  <q-list dense separator>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Data de Abertura</q-item-label>
                        <q-item-label>{{ formatarDataCompleta(chamadoDetalhe.dataAbertura) }}</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item v-if="chamadoDetalhe.dataAtualizacao">
                      <q-item-section>
                        <q-item-label caption>Última Movimentação</q-item-label>
                        <q-item-label>{{ formatarDataCompleta(chamadoDetalhe.dataAtualizacao) }}</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section style="margin-top: 20px;">
                        <q-item-label caption>SLA Restante</q-item-label>
                        <div class="flex items-center">
                          <q-icon
                            :name="getSlaIcone(chamadoDetalhe.slaRestante, chamadoDetalhe.slaProgresso)"
                            :color="getSlaIconeCor(chamadoDetalhe.slaProgresso)"
                            size="20px"
                            class="q-mr-xs"
                          />
                          <span :class="getSlaTextCor(chamadoDetalhe.slaRestante)" class="text-weight-medium">
                            {{ chamadoDetalhe.slaRestante }}
                          </span>
                        </div>
                        <q-linear-progress
                          v-if="chamadoDetalhe.slaProgresso !== undefined"
                          :value="chamadoDetalhe.slaProgresso"
                          :color="getSlaBarCor(chamadoDetalhe.slaProgresso)"
                          size="6px"
                          class="q-mt-sm"
                        />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>

              <!-- Timeline -->
              <div v-if="chamadoDetalhe?.timeline && chamadoDetalhe.timeline.length > 0" class="q-mt-md" style="padding: 1em">
                <div class="text-subtitle2 text-weight-medium q-mb-sm">
                  <q-icon name="timeline" size="18px" color="primary" class="q-mr-xs" />
                  Histórico de Atualizações
                </div>
                <div class="timeline-container">
                  <div v-for="(evento, idx) in chamadoDetalhe.timeline" :key="idx" class="timeline-item">
                    <div class="timeline-icon" :class="`bg-${evento.cor || 'primary'}`">
                      <q-icon :name="evento.icone" size="14px" color="white" />
                    </div>
                    <div class="timeline-content">
                      <div class="flex justify-between items-center">
                        <span class="text-weight-medium">{{ evento.titulo }}</span>
                        <span class="text-caption text-grey-6">{{ formatarDataRelativa(evento.data) }}</span>
                      </div>
                      <div class="text-caption">{{ evento.descricao }}</div>
                      <div class="text-caption text-grey-6" v-if="evento.autor">por {{ evento.autor }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Descrição -->
              <q-separator class="q-my-md" style="margin-top: -10px;"/>
              <div class="text-subtitle2 text-weight-medium q-mb-sm text-grey-8">
                Descrição:
              </div>
              <div>
                <div class="text-body2 text-grey-20" v-html="chamadoDetalhe.descricao" style="padding: 1em; background: #f7f7f7; border-radius: 20px;"></div>
              </div>

              <!-- Anexos -->
              <div v-if="chamadoDetalhe.anexosLista && chamadoDetalhe.anexosLista.length > 0" class="q-mt-md">
                <div class="text-subtitle2 text-weight-medium q-mb-sm">
                  <q-icon name="attach_file" size="18px" color="primary" class="q-mr-xs" />
                  Anexos ({{ chamadoDetalhe.anexosLista.length }})
                </div>
                <div class="row q-col-gutter-sm">
                  <div v-for="(arquivo, idx) in chamadoDetalhe.anexosLista" :key="idx" class="col-6 col-md-4">
                    <q-btn
                      flat
                      dense
                      no-caps
                      align="left"
                      class="full-width"
                      :label="arquivo.nome"
                      :icon="arquivo.icone"
                      color="primary"
                      @click="baixarAnexo(arquivo)"
                    />
                  </div>
                </div>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-actions align="right" class="q-pa-md">
              <q-btn
                v-if="chamadoDetalhe?.status === 'Resolvido' || chamadoDetalhe?.status === 'Fechado'"
                label="Reabrir Chamado"
                icon="refresh"
                outline
                color="orange"
                @click="reabrirChamado"
                v-close-popup
              />
              <q-btn
                label="Excluir Chamado"
                icon="delete"
                outline
                color="negative"
                @click="confirmarExclusaoUnica(chamadoDetalhe)"
                v-close-popup
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
const WS_URL = 'wss://chamados-backend-4efw.onrender.com/ws' // Ajuste para o endpoint WebSocket do seu backend

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default {
  name: 'ChamadosAbertos',

  setup() {
    const $q = useQuasar()

    // =========================
    // ESTADOS
    // =========================
    const loadingInicial = ref(false)
    const loading = ref(false)
    const recarregando = ref(false)
    const erroCarregamento = ref('')

    const selectedRows = ref([])
    const dialogVisible = ref(false)
    const chamadoDetalhe = ref(null)

    // WebSocket
    let ws = null
    const conexaoWebSocket = ref(null) // null = desconhecido, true = conectado, false = desconectado
    const ultimaAtualizacao = ref(null)

    // Filtros
    const filtros = ref({
      busca: '',
      status: null,
      prioridade: null,
      categoria: null
    })

    // Paginação da tabela
    const pagination = ref({
      sortBy: 'dataAbertura',
      descending: true,
      page: 1,
      rowsPerPage: 10
    })

    // Colunas da tabela
    const columns = ref([
      { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true, style: 'width: 80px' },
      { name: 'titulo', label: 'Título', field: 'titulo', align: 'left', sortable: true, style: 'min-width: 250px' },
      { name: 'quemAbre', label: 'Quem Abriu', field: 'quemAbre', align: 'left', sortable: true, style: 'width: 150px' },
      {
        name: 'dataAbertura',
        label: 'Data',
        field: row => formatarData(row.dataAbertura),
        sortable: true,
        style: 'width: 120px'
      },
      {
        name: 'tipo',
        label: 'Tipo',
        field: row => row.tipo ? row.tipo.charAt(0).toUpperCase() + row.tipo.slice(1) : '',
        sortable: true,
        style: 'width: 100px'
      },
      { name: 'status', label: 'Status', field: 'status', align: 'left', sortable: true, style: 'width: 120px' },
      { name: 'prioridade', label: 'Prioridade', field: 'prioridade', align: 'left', sortable: true, style: 'width: 110px' },
      { name: 'slaRestante', label: 'SLA (Resolução)', field: 'slaRestante', align: 'left', sortable: true, style: 'width: 100px' },
      { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center', style: 'width: 100px' }
    ])

    const statusOptions = ref([
      { label: 'Aberto', value: 'Aberto' },
      { label: 'Em Andamento', value: 'Em Andamento' },
      { label: 'Resolvido', value: 'Resolvido' },
      { label: 'Fechado', value: 'Fechado' }
    ])

    const prioridadeOptions = ref([
      { label: 'Crítica', value: 'Crítica' },
      { label: 'Alta', value: 'Alta' },
      { label: 'Média', value: 'Média' },
      { label: 'Baixa', value: 'Baixa' }
    ])

    const categoriaOptions = ref([])

    const chamados = ref([])

    // =========================
    // FUNÇÃO DE CACHE
    // =========================
    const carregarCacheInicial = () => {
      const cacheChamados = localStorage.getItem('cache_chamados')
      const cacheCategorias = localStorage.getItem('cache_categorias_chamados')

      if (cacheChamados) {
        const parsed = JSON.parse(cacheChamados)
        chamados.value = parsed.map(chamado => ({
          ...chamado,
          dataAbertura: chamado.dataAbertura ? new Date(chamado.dataAbertura) : null,
          dataAtualizacao: chamado.dataAtualizacao ? new Date(chamado.dataAtualizacao) : null
        }))
      }

      if (cacheCategorias) {
        categoriaOptions.value = JSON.parse(cacheCategorias)
      }

      // Se não tiver cache, mostra skeleton
      if (!cacheChamados) {
        loadingInicial.value = true
      }
    }

    const salvarCache = () => {
      localStorage.setItem('cache_chamados', JSON.stringify(chamados.value))
      localStorage.setItem('cache_categorias_chamados', JSON.stringify(categoriaOptions.value))
    }

    // =========================
    // WEBHOOK - ATUALIZAÇÕES EM TEMPO REAL
    // =========================
    const conectarWebSocket = () => {
      try {
        ws = new WebSocket(WS_URL)

        ws.onopen = () => {
          console.log('WebSocket conectado')
          conexaoWebSocket.value = true
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
          conexaoWebSocket.value = false
        }

        ws.onclose = () => {
          console.log('WebSocket desconectado, tentando reconectar em 5 segundos...')
          conexaoWebSocket.value = false
          setTimeout(conectarWebSocket, 5000)
        }
      } catch (error) {
        console.error('Erro ao conectar WebSocket:', error)
        conexaoWebSocket.value = false
        setTimeout(conectarWebSocket, 5000)
      }
    }

    const processarMensagemWebSocket = (mensagem) => {
      // Estrutura esperada da mensagem WebSocket
      // { event: 'chamado_criado', data: {...} }
      // { event: 'chamado_atualizado', data: {...} }
      // { event: 'chamado_excluido', data: { id: 123 } }

      switch (mensagem.event) {
        case 'chamado_criado':
          adicionarChamadoViaWebSocket(mensagem.data)
          break
        case 'chamado_atualizado':
          atualizarChamadoViaWebSocket(mensagem.data)
          break
        case 'chamado_excluido':
          removerChamadoViaWebSocket(mensagem.data.id)
          break
        default:
          console.log('websocket rodando:', mensagem.event)
      }
    }

    const adicionarChamadoViaWebSocket = (chamadoData) => {
      const novoChamado = formatarChamado(chamadoData)

      // Verifica se já existe
      const existe = chamados.value.some(c => c.id === novoChamado.id)
      if (!existe) {
        chamados.value.unshift(novoChamado)
        salvarCache()

        $q.notify({
          color: 'info',
          message: `Novo chamado #${novoChamado.id} adicionado: ${novoChamado.titulo}`,
          icon: 'add_circle',
          position: 'top-right',
          timeout: 3000
        })
      }
    }

    const atualizarChamadoViaWebSocket = (chamadoData) => {
      const index = chamados.value.findIndex(c => c.id === chamadoData.id)
      if (index !== -1) {
        const chamadoAntigo = chamados.value[index]
        const chamadoAtualizado = {
          ...chamadoAntigo,
          ...formatarChamado(chamadoData),
          dataAtualizacao: new Date()
        }

        chamados.value[index] = chamadoAtualizado
        salvarCache()

        // Atualiza o detalhe se estiver aberto
        if (chamadoDetalhe.value && chamadoDetalhe.value.id === chamadoAtualizado.id) {
          chamadoDetalhe.value = chamadoAtualizado
        }

        $q.notify({
          color: 'warning',
          message: `Chamado #${chamadoAtualizado.id} foi atualizado: ${chamadoAtualizado.status}`,
          icon: 'update',
          position: 'top-right',
          timeout: 3000
        })
      }
    }

    const removerChamadoViaWebSocket = (id) => {
      const index = chamados.value.findIndex(c => c.id === id)
      if (index !== -1) {
        const chamadoRemovido = chamados.value[index]
        chamados.value.splice(index, 1)
        salvarCache()

        // Fecha dialog se estiver aberto
        if (chamadoDetalhe.value && chamadoDetalhe.value.id === id) {
          dialogVisible.value = false
          chamadoDetalhe.value = null
        }

        $q.notify({
          color: 'negative',
          message: `Chamado #${id} foi removido: ${chamadoRemovido.titulo}`,
          icon: 'delete',
          position: 'top-right',
          timeout: 3000
        })
      }
    }

    const formatarChamado = (chamado) => ({
      id: chamado.id,
      titulo: chamado.titulo,
      descricaoResumida: chamado.descricao?.replace(/<[^>]*>/g, '')?.substring(0, 120) + '...',
      descricao: chamado.descricao || '',
      prioridade: chamado.prioridade ? chamado.prioridade.charAt(0).toUpperCase() + chamado.prioridade.slice(1) : 'Baixa',
      status: chamado.status ? chamado.status.charAt(0).toUpperCase() + chamado.status.slice(1) : 'Aberto',
      categoria: chamado.categoria || '',
      subcategoria: chamado.subcategoria || '',
      solicitante: chamado.nome_usuario || '',
      quemAbre: chamado.nome_usuario || '',
      departamento: chamado.departamento_usuario || '',
      sla_resposta: chamado.sla_resposta || '',
      dataAbertura: chamado.data_criacao ? new Date(chamado.data_criacao) : null,
      dataAtualizacao: chamado.data_atualizacao ? new Date(chamado.data_atualizacao) : null,
      tipo: chamado.tipo || '',
      anexos: chamado.anexos ? JSON.parse(chamado.anexos).length : 0,
      anexosLista: chamado.anexos ? JSON.parse(chamado.anexos) : [],
      slaRestante: chamado.sla_resolucao || 'N/A',
      slaProgresso: 0.3,
      timeline: [
        {
          titulo: 'Chamado aberto',
          descricao: 'Chamado registrado no sistema',
          data: chamado.data_criacao ? new Date(chamado.data_criacao) : null,
          icone: 'add_circle',
          autor: chamado.nome_usuario || 'Sistema',
          cor: 'positive'
        }
      ]
    })

    // =========================
    // CARREGAR DADOS INICIAIS
    // =========================
    const carregarDadosIniciais = async () => {
      try {
        const response = await api.get('/chamados')

        if (response.data.success) {
          chamados.value = response.data.data.map(chamado => formatarChamado(chamado))
          salvarCache()
          erroCarregamento.value = ''
        } else {
          throw new Error(response.data.message || 'Erro ao carregar chamados')
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        erroCarregamento.value = 'Erro ao carregar chamados. Verifique sua conexão.'

        $q.notify({
          color: 'negative',
          message: erroCarregamento.value,
          icon: 'error',
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
    // ESTATÍSTICAS
    // =========================
    const estatisticas = computed(() => [
      { label: 'Total de Chamados', valor: chamados.value.length, icone: 'chat', cor: 'primary' },
      { label: 'Em Andamento', valor: chamados.value.filter(c => c.status === 'Em Andamento').length, icone: 'autorenew', cor: 'warning' },
      { label: 'Resolvidos', valor: chamados.value.filter(c => c.status === 'Resolvido').length, icone: 'check_circle', cor: 'positive' },
      { label: 'Críticos', valor: chamados.value.filter(c => c.prioridade === 'Crítica' && c.status !== 'Resolvido' && c.status !== 'Fechado').length, icone: 'error', cor: 'red' }
    ])

    // Chamados filtrados
    const chamadosFiltrados = computed(() => {
      let resultado = [...chamados.value]

      if (filtros.value.busca) {
        const buscaLower = filtros.value.busca.toLowerCase()
        resultado = resultado.filter(c =>
          c.id.toString().toLowerCase().includes(buscaLower) ||
          c.titulo.toLowerCase().includes(buscaLower) ||
          c.descricaoResumida?.toLowerCase().includes(buscaLower)
        )
      }

      if (filtros.value.status) {
        resultado = resultado.filter(c => c.status === filtros.value.status)
      }

      if (filtros.value.prioridade) {
        resultado = resultado.filter(c => c.prioridade === filtros.value.prioridade)
      }

      if (filtros.value.categoria) {
        resultado = resultado.filter(c => c.categoria === filtros.value.categoria)
      }

      resultado.sort((a, b) => b.dataAbertura - a.dataAbertura)

      return resultado
    })

    // =========================
    // CRUD OPERATIONS
    // =========================
    const excluirChamado = async (chamadoOuIds) => {
      try {
        loading.value = true

        let idsParaExcluir = []
        if (Array.isArray(chamadoOuIds)) {
          idsParaExcluir = chamadoOuIds
        } else {
          idsParaExcluir = [chamadoOuIds.id]
        }

        await Promise.all(
          idsParaExcluir.map(id => api.delete(`/chamados/${id}`))
        )

        chamados.value = chamados.value.filter(c => !idsParaExcluir.includes(c.id))
        selectedRows.value = []
        salvarCache()

        if (chamadoDetalhe.value && idsParaExcluir.includes(chamadoDetalhe.value.id)) {
          dialogVisible.value = false
          chamadoDetalhe.value = null
        }

        $q.notify({
          color: 'positive',
          message: idsParaExcluir.length > 1
            ? `${idsParaExcluir.length} chamados excluídos com sucesso!`
            : `Chamado #${idsParaExcluir[0]} excluído com sucesso!`,
          icon: 'check_circle',
          position: 'top-right'
        })

      } catch (error) {
        console.error('Erro ao excluir chamado:', error)
        $q.notify({
          color: 'negative',
          message: 'Erro ao excluir chamado',
          icon: 'error',
          position: 'top-right'
        })
      } finally {
        loading.value = false
      }
    }

    const confirmarExclusaoUnica = (chamado) => {
      $q.dialog({
        title: 'Excluir Chamado',
        message: `Deseja realmente excluir o chamado #${chamado.id}?`,
        ok: { label: 'Excluir', color: 'negative' },
        cancel: { label: 'Cancelar', flat: true },
        persistent: true
      }).onOk(async () => {
        await excluirChamado(chamado)
      })
    }

    const confirmarExclusaoMultipla = () => {
      const ids = selectedRows.value.map(row => row.id)
      $q.dialog({
        title: 'Excluir Chamados',
        message: `Deseja realmente excluir ${ids.length} chamado(s)?`,
        ok: { label: 'Excluir', color: 'negative' },
        cancel: { label: 'Cancelar', flat: true },
        persistent: true
      }).onOk(async () => {
        await excluirChamado(ids)
      })
    }

    const limparSelecao = () => {
      selectedRows.value = []
    }

    const reabrirChamado = () => {
      $q.dialog({
        title: 'Reabrir Chamado',
        message: 'Deseja realmente reabrir este chamado?',
        ok: { label: 'Sim, Reabrir', color: 'primary' },
        cancel: { label: 'Cancelar', color: 'grey', flat: true }
      }).onOk(() => {
        if (chamadoDetalhe.value) {
          chamadoDetalhe.value.status = 'Em Andamento'
          chamadoDetalhe.value.slaRestante = '4h 0min'
          chamadoDetalhe.value.slaProgresso = 0.3

          const novoEvento = {
            titulo: 'Chamado reaberto',
            descricao: 'Chamado reaberto pelo solicitante',
            data: new Date(),
            icone: 'refresh',
            autor: 'Usuário Atual',
            cor: 'warning'
          }

          chamadoDetalhe.value.timeline.unshift(novoEvento)
          chamadoDetalhe.value.dataAtualizacao = new Date()
          salvarCache()

          $q.notify({
            color: 'info',
            message: `Chamado #${chamadoDetalhe.value.id} reaberto com sucesso!`,
            icon: 'refresh',
            position: 'top-right'
          })
        }
      })
    }

    // =========================
    // FUNÇÕES AUXILIARES
    // =========================
    const formatarData = (data) => {
      if (!data) return ''
      return data.toLocaleDateString('pt-BR')
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
        minute: '2-digit'
      })
    }

    const formatarDataRelativa = (data) => {
      if (!data) return ''
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

    const getPrioridadeIcone = (prioridade) => {
      const p = prioridade?.toLowerCase()
      const icones = {
        crítica: 'error',
        alta: 'warning',
        média: 'info',
        baixa: 'arrow_downward'
      }
      return icones[p] || 'flag'
    }

    const getPrioridadeCor = (prioridade) => {
      const p = prioridade?.toLowerCase()
      const cores = {
        crítica: 'red',
        alta: 'orange',
        média: 'blue',
        baixa: 'green'
      }
      return cores[p] || 'grey'
    }

    const getStatusCor = (status) => {
      const s = status?.toLowerCase()
      const cores = {
        aberto: 'orange',
        'em andamento': 'primary',
        resolvido: 'green',
        fechado: 'grey'
      }
      return cores[s] || 'grey'
    }

    const getSlaTextCor = (slaRestante) => {
      if (slaRestante === 'Resolvido' || slaRestante === 'Fechado') return 'text-positive'
      if (slaRestante && slaRestante.toLowerCase().includes('min') && parseInt(slaRestante) < 60) return 'text-negative'
      return 'text-warning'
    }

    const getSlaIcone = (slaRestante, progresso) => {
      if (slaRestante === 'Resolvido' || slaRestante === 'Fechado') return 'check_circle'
      if (progresso >= 0.9) return 'warning'
      if (progresso >= 0.7) return 'schedule'
      return 'timer'
    }

    const getSlaIconeCor = (progresso) => {
      if (progresso >= 0.9) return 'negative'
      if (progresso >= 0.7) return 'warning'
      return 'positive'
    }

    const getSlaBarCor = (progresso) => {
      if (progresso >= 0.9) return 'negative'
      if (progresso >= 0.7) return 'warning'
      return 'positive'
    }

    const abrirDialog = (chamado) => {
      chamadoDetalhe.value = chamado
      dialogVisible.value = true
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

    const baixarAnexo = (arquivo) => {
      $q.notify({
        color: 'info',
        message: `Baixando ${arquivo.nome}...`,
        icon: 'download',
        position: 'top-right',
        timeout: 2000
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
      selectedRows,
      dialogVisible,
      chamadoDetalhe,
      pagination,
      columns,
      statusOptions,
      prioridadeOptions,
      categoriaOptions,
      chamados,
      conexaoWebSocket,
      ultimaAtualizacao,

      // Computed
      estatisticas,
      chamadosFiltrados,

      // Funções
      formatarData,
      formatarHora,
      formatarDataCompleta,
      formatarDataRelativa,
      getPrioridadeIcone,
      getPrioridadeCor,
      getStatusCor,
      getSlaTextCor,
      getSlaIcone,
      getSlaIconeCor,
      getSlaBarCor,
      abrirDialog,
      aplicarFiltros,
      reabrirChamado,
      baixarAnexo,
      confirmarExclusaoUnica,
      confirmarExclusaoMultipla,
      limparSelecao,
      recarregarDados,
      carregarChamados: carregarDadosIniciais
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

.status-badge {
  font-weight: 500;
  padding: 4px 8px;
}

/* Estilos da tabela */
.chamados-table :deep(.q-table__top) {
  padding: 12px 16px;
}

.chamados-table :deep(.q-table__title) {
  font-size: 1rem;
  font-weight: 500;
}

.chamados-table :deep(th) {
  font-weight: 600;
  background-color: #f5f5f5;
}

.chamados-table :deep(tr) {
  cursor: pointer;
  transition: all 0.2s ease;
}

.chamados-table :deep(tr:hover) {
  background-color: rgba(25, 118, 210, 0.04);
}

/* Timeline no dialog */
.timeline-container {
  max-height: 300px;
  overflow-y: auto;
  padding: 8px 0;
}

.timeline-item {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  position: relative;
}

.timeline-item:not(:last-child):before {
  content: '';
  position: absolute;
  left: 15px;
  top: 28px;
  bottom: -20px;
  width: 2px;
  background: #e0e0e0;
}

.timeline-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 1;
}

.timeline-content {
  flex: 1;
  padding-bottom: 8px;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0;
  }

  :deep(.q-table__card) {
    overflow-x: auto;
  }
}
</style>
