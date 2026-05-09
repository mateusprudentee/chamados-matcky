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
                    <q-icon name="delete_sweep" size="28px" color="negative" class="q-mr-sm" />
                    Chamados Excluídos
                  </div>
                  <div class="text-subtitle2 text-grey-7 q-mt-sm">
                    Historico de chamados removidos do sistema
                  </div>
                </div>
                <div>
                  <q-btn
                    color="primary"
                    icon="arrow_back"
                    label="Voltar para Chamados"
                    unelevated
                    @click="$router.push('/chamados')"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Estatísticas -->
          <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-6 col-md-3">
              <q-card class="stat-card">
                <q-card-section class="text-center">
                  <q-icon name="delete_forever" size="32px" color="negative" />
                  <div class="text-h5 text-weight-medium q-mt-sm">{{ chamadosExcluidos.length }}</div>
                  <div class="text-caption text-grey-7">Total Excluídos</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-6 col-md-3">
              <q-card class="stat-card">
                <q-card-section class="text-center">
                  <q-icon name="restore_from_trash" size="32px" color="primary" />
                  <div class="text-h5 text-weight-medium q-mt-sm">{{ ultimos7Dias }}</div>
                  <div class="text-caption text-grey-7">Últimos 7 dias</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-6 col-md-3">
              <q-card class="stat-card">
                <q-card-section class="text-center">
                  <q-icon name="warning" size="32px" color="orange" />
                  <div class="text-h5 text-weight-medium q-mt-sm">{{ excluidosMesAtual }}</div>
                  <div class="text-caption text-grey-7">Este mês</div>
                </q-card-section>
              </q-card>
            </div>
            <div class="col-6 col-md-3">
              <q-card class="stat-card">
                <q-card-section class="text-center">
                  <q-icon name="person" size="32px" color="green" />
                  <div class="text-h5 text-weight-medium q-mt-sm">{{ excluidosPorMim }}</div>
                  <div class="text-caption text-grey-7">Excluídos por mim</div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Filtros -->
          <q-card class="filter-card q-mb-lg">
            <q-card-section>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-3">
                  <q-input
                    v-model="filtros.busca"
                    label="Buscar chamados excluídos"
                    outlined
                    dense
                    clearable
                    placeholder="ID, título ou descrição..."
                  >
                    <template v-slot:prepend>
                      <q-icon name="search" color="negative" />
                    </template>
                  </q-input>
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
                <div class="col-6 col-md-2">
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
                <div class="col-12 col-md-3">
                  <q-input
                    v-model="filtros.dataExclusao"
                    label="Data de exclusão"
                    outlined
                    dense
                    type="date"
                    clearable
                  >
                    <template v-slot:prepend>
                      <q-icon name="event" color="negative" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-2">
                  <q-btn
                    color="negative"
                    label="Filtrar"
                    unelevated
                    class="full-width"
                    icon="filter_list"
                    @click="aplicarFiltros"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Tabela de Chamados Excluídos -->
          <q-card class="table-card">
            <q-card-section>
              <div class="flex justify-between items-center q-mb-md">
                <div class="text-subtitle1 text-weight-medium">
                  <q-icon name="delete" size="20px" color="negative" class="q-mr-xs" />
                  Lista de Chamados Excluídos
                </div>
                <div>
                  <q-btn
                    v-if="chamadosExcluidosFiltrados.length > 0"
                    color="negative"
                    icon="delete_sweep"
                    label="Limpar Histórico"
                    outline
                    size="sm"
                    @click="limparHistorico"
                  />
                </div>
              </div>

              <q-table
                :rows="chamadosExcluidosFiltrados"
                :columns="columns"
                row-key="id"
                :loading="loading"
                :pagination="pagination"
                @row-click="(evt, row) => abrirDialog(row)"
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
                      dense
                    >
                      <q-icon :name="getPrioridadeIcone(props.row.prioridade)" size="14px" class="q-mr-xs" />
                      {{ props.row.prioridade }}
                    </q-chip>
                  </q-td>
                </template>

                <!-- Coluna status (excluído) -->
                <template v-slot:body-cell-status="props">
                  <q-td :props="props">
                    <q-badge color="negative" label="EXCLUÍDO" class="status-badge" />
                  </q-td>
                </template>

                <!-- Coluna quemExcluiu -->
                <template v-slot:body-cell-quemExcluiu="props">
                  <q-td :props="props">
                    <div class="flex items-center">
                      <q-icon name="person" size="14px" class="q-mr-xs text-grey-6" />
                      {{ props.row.quemExcluiu }}
                    </div>
                  </q-td>
                </template>

                <!-- Coluna dataExclusao -->
                <template v-slot:body-cell-dataExclusao="props">
                  <q-td :props="props">
                    <div class="flex items-center">
                      {{ formatarDataCompleta(props.row.dataExclusao) }}
                    </div>
                  </q-td>
                </template>

                <!-- Coluna motivoExclusao -->
                <template v-slot:body-cell-motivoExclusao="props">
                  <q-td :props="props">
                    <q-chip size="sm" dense color="grey-3" text-color="grey-8">
                      <q-icon name="info" size="12px" class="q-mr-xs" />
                      {{ props.row.motivoExclusao || 'Não informado' }}
                    </q-chip>
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
                      icon="restore"
                      color="positive"
                      @click.stop="confirmarRestauracao(props.row)"
                      size="sm"
                      class="q-ml-xs"
                    >
                      <q-tooltip>Restaurar chamado</q-tooltip>
                    </q-btn>
                  </q-td>
                </template>

                <!-- Loading -->
                <template v-slot:loading>
                  <q-inner-loading showing color="negative" />
                </template>

                <!-- Nenhum resultado -->
                <template v-slot:no-data>
                  <div class="text-center q-pa-xl">
                    <q-icon name="delete_sweep" size="64px" color="grey-4" />
                    <div class="text-subtitle1 text-grey-6 q-mt-md">
                      Nenhum chamado excluído encontrado
                    </div>
                    <div class="text-caption text-grey-5 q-mt-sm">
                      Os chamados excluídos aparecerão aqui
                    </div>
                  </div>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </div>

        <!-- Dialog de Detalhes do Chamado Excluído -->
        <q-dialog v-model="dialogVisible" :maximized="false">
          <q-card style="min-width: 700px; max-width: 900px; width: 80%; border-radius: 30px;">
            <q-card-section class="bg-negative text-white row items-center">
              <div class="col-10">
                <div class="text-caption text-white text-weight-medium">
                  CHAMADO EXCLUÍDO #{{ chamadoDetalhe?.id }}
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
                        <q-item-label>
                          <q-chip
                            :color="getPrioridadeCor(chamadoDetalhe.prioridade)"
                            text-color="white"
                            size="sm"
                            dense
                          >
                            <q-icon :name="getPrioridadeIcone(chamadoDetalhe.prioridade)" size="14px" class="q-mr-xs" />
                            {{ chamadoDetalhe.prioridade }}
                          </q-chip>
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Status Original</q-item-label>
                        <q-item-label>
                          <q-badge :color="getStatusCor(chamadoDetalhe.statusOriginal)" :label="chamadoDetalhe.statusOriginal" size="md" />
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Categoria</q-item-label>
                        <q-item-label>{{ chamadoDetalhe.categoria }}</q-item-label>
                        <q-item-label caption class="text-grey-6">{{ chamadoDetalhe.subcategoria }}</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Solicitante</q-item-label>
                        <q-item-label>{{ chamadoDetalhe.solicitante }}</q-item-label>
                        <q-item-label caption class="text-grey-6">{{ chamadoDetalhe.departamento }}</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Quem Abriu</q-item-label>
                        <q-item-label>{{ chamadoDetalhe.quemAbre }}</q-item-label>
                        <q-item-label caption class="text-grey-6">{{ formatarDataCompleta(chamadoDetalhe.dataAbertura) }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>

                <!-- Informações de Exclusão -->
                <div class="col-12 col-md-6">
                  <q-list dense separator>
                    <q-item>
                      <q-item-section>
                        <q-item-label caption class="text-negative text-weight-medium">
                          <q-icon name="delete" size="14px" class="q-mr-xs" />
                          INFORMAÇÕES DE EXCLUSÃO
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Excluído por</q-item-label>
                        <q-item-label class="text-weight-medium">
                          <q-icon name="person" size="14px" class="q-mr-xs text-grey-6" />
                          {{ chamadoDetalhe.quemExcluiu }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Data de Exclusão</q-item-label>
                        <q-item-label>
                          <q-icon name="event" size="14px" class="q-mr-xs text-negative" />
                          {{ formatarDataCompleta(chamadoDetalhe.dataExclusao) }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Motivo da Exclusão</q-item-label>
                        <q-item-label class="text-grey-7">
                          {{ chamadoDetalhe.motivoExclusao || 'Não informado' }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-separator class="q-my-sm" />

                    <q-item>
                      <q-item-section>
                        <q-item-label caption>Data de Abertura Original</q-item-label>
                        <q-item-label>{{ formatarDataCompleta(chamadoDetalhe.dataAbertura) }}</q-item-label>
                      </q-item-section>
                    </q-item>

                    <q-item v-if="chamadoDetalhe.dataAtualizacao">
                      <q-item-section>
                        <q-item-label caption>Última Movimentação</q-item-label>
                        <q-item-label>{{ formatarDataCompleta(chamadoDetalhe.dataAtualizacao) }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>

              <!-- Descrição -->
              <q-separator class="q-my-md" />
              <div>
                <div class="text-subtitle2 text-weight-medium q-mb-sm">
                  <q-icon name="description" size="18px" color="negative" class="q-mr-xs" />
                  Descrição do Problema
                </div>
                <div class="text-body2 text-grey-8" v-html="chamadoDetalhe.descricao"></div>
              </div>

              <!-- Anexos -->
              <div v-if="chamadoDetalhe.anexosLista && chamadoDetalhe.anexosLista.length > 0" class="q-mt-md">
                <div class="text-subtitle2 text-weight-medium q-mb-sm">
                  <q-icon name="attach_file" size="18px" color="negative" class="q-mr-xs" />
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
                      color="negative"
                      @click="baixarAnexo(arquivo)"
                    />
                  </div>
                </div>
              </div>
            </q-card-section>

            <q-separator />

            <q-card-actions align="right" class="q-pa-md">
              <q-btn
                label="Restaurar Chamado"
                icon="restore"
                color="positive"
                @click="confirmarRestauracao(chamadoDetalhe)"
                v-close-popup
              />
              <q-btn
                label="Excluir Permanentemente"
                icon="delete_forever"
                color="negative"
                outline
                @click="confirmarExclusaoPermanente(chamadoDetalhe)"
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
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

export default {
  name: 'ChamadosExcluidos',

  setup() {
    const $q = useQuasar()

    // Filtros
    const filtros = ref({
      busca: '',
      prioridade: null,
      categoria: null,
      dataExclusao: null
    })

    const loading = ref(false)
    const dialogVisible = ref(false)
    const chamadoDetalhe = ref(null)

    // Paginação da tabela
    const pagination = ref({
      sortBy: 'dataExclusao',
      descending: true,
      page: 1,
      rowsPerPage: 10
    })

    // Colunas da tabela
    const columns = ref([
      { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true, style: 'width: 120px' },
      { name: 'titulo', label: 'Título', field: 'titulo', align: 'left', sortable: true, style: 'min-width: 250px' },
      { name: 'solicitante', label: 'Solicitante', field: 'solicitante', align: 'left', sortable: true, style: 'width: 150px' },
      { name: 'quemExcluiu', label: 'Excluído por', field: 'quemExcluiu', align: 'left', sortable: true, style: 'width: 150px' },
      { name: 'dataExclusao', label: 'Data Exclusão', field: 'dataExclusao', align: 'left', sortable: true, style: 'width: 150px' },
      { name: 'prioridade', label: 'Prioridade', field: 'prioridade', align: 'left', sortable: true, style: 'width: 110px' },
      { name: 'status', label: 'Status', field: 'status', align: 'left', sortable: true, style: 'width: 100px' },
      { name: 'motivoExclusao', label: 'Motivo', field: 'motivoExclusao', align: 'left', sortable: true, style: 'width: 150px' },
      { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center', style: 'width: 100px' }
    ])

    // Opções para filtros
    const prioridadeOptions = ref([
      { label: 'Crítica', value: 'Crítica' },
      { label: 'Alta', value: 'Alta' },
      { label: 'Média', value: 'Média' },
      { label: 'Baixa', value: 'Baixa' }
    ])

    const categoriaOptions = ref([
      { label: 'Hardware', value: 'Hardware' },
      { label: 'Software', value: 'Software' },
      { label: 'Rede', value: 'Rede' },
      { label: 'E-mail', value: 'E-mail' },
      { label: 'Impressora', value: 'Impressora' },
      { label: 'Acesso/Senha', value: 'Acesso/Senha' }
    ])

    // Dados mockados dos chamados excluídos
    const chamadosExcluidos = ref([
      {
        id: 'CH-2025-089',
        titulo: 'Problema com acesso ao sistema ERP',
        descricao: '<p>Usuário não consegue acessar o sistema ERP após atualização.</p>',
        descricaoResumida: 'Usuário não consegue acessar o sistema ERP após atualização.',
        prioridade: 'Média',
        statusOriginal: 'Resolvido',
        status: 'EXCLUÍDO',
        categoria: 'Software',
        subcategoria: 'Erro no sistema',
        solicitante: 'Roberto Alves',
        quemAbre: 'Roberto Alves',
        departamento: 'Comercial',
        dataAbertura: new Date(2025, 10, 15, 9, 0),
        dataAtualizacao: new Date(2025, 10, 20, 14, 30),
        dataExclusao: new Date(2026, 1, 10, 11, 23),
        quemExcluiu: 'Admin TI',
        motivoExclusao: 'Chamado duplicado',
        anexosLista: [],
        anexos: 0,
        slaRestante: 'Excluído',
        slaProgresso: 1
      },
      {
        id: 'CH-2025-092',
        titulo: 'Troca de mouse sem fio',
        descricao: '<p>Solicitação de troca do mouse do posto de trabalho.</p>',
        descricaoResumida: 'Solicitação de troca do mouse do posto de trabalho.',
        prioridade: 'Baixa',
        statusOriginal: 'Resolvido',
        status: 'EXCLUÍDO',
        categoria: 'Hardware',
        subcategoria: 'Periféricos',
        solicitante: 'Carla Mendes',
        quemAbre: 'Carla Mendes',
        departamento: 'Administrativo',
        dataAbertura: new Date(2025, 10, 18, 10, 15),
        dataAtualizacao: new Date(2025, 10, 19, 16, 45),
        dataExclusao: new Date(2026, 1, 15, 9, 45),
        quemExcluiu: 'Carla Mendes',
        motivoExclusao: 'Solicitação do usuário',
        anexosLista: [],
        anexos: 0,
        slaRestante: 'Excluído',
        slaProgresso: 1
      },
      {
        id: 'CH-2025-095',
        titulo: 'Erro ao imprimir relatórios',
        descricao: '<p>Impressora não reconhece o formato do papel para relatórios financeiros.</p>',
        descricaoResumida: 'Impressora não reconhece o formato do papel para relatórios financeiros.',
        prioridade: 'Alta',
        statusOriginal: 'Aberto',
        status: 'EXCLUÍDO',
        categoria: 'Impressora',
        subcategoria: 'Configuração',
        solicitante: 'José Silva',
        quemAbre: 'José Silva',
        departamento: 'Financeiro',
        dataAbertura: new Date(2025, 10, 20, 11, 0),
        dataAtualizacao: new Date(2025, 10, 20, 11, 0),
        dataExclusao: new Date(2026, 1, 18, 14, 0),
        quemExcluiu: 'Suporte TI',
        motivoExclusao: 'Chamado resolvido por outro canal',
        anexosLista: [],
        anexos: 0,
        slaRestante: 'Excluído',
        slaProgresso: 1
      },
      {
        id: 'CH-2025-101',
        titulo: 'VPN não conecta (teste)',
        descricao: '<p>Chamado de teste para validação do sistema.</p>',
        descricaoResumida: 'Chamado de teste para validação do sistema.',
        prioridade: 'Baixa',
        statusOriginal: 'Fechado',
        status: 'EXCLUÍDO',
        categoria: 'Rede',
        subcategoria: 'VPN',
        solicitante: 'Equipe TI',
        quemAbre: 'Equipe TI',
        departamento: 'Tecnologia',
        dataAbertura: new Date(2025, 11, 5, 8, 0),
        dataAtualizacao: new Date(2025, 11, 5, 17, 0),
        dataExclusao: new Date(2026, 2, 1, 10, 30),
        quemExcluiu: 'Sistema',
        motivoExclusao: 'Limpeza automática',
        anexosLista: [],
        anexos: 0,
        slaRestante: 'Excluído',
        slaProgresso: 1
      },
      {
        id: 'CH-2026-010',
        titulo: 'Solicitação de acesso ao BI',
        descricao: '<p>Usuário precisa de acesso ao módulo de BI para criar dashboards.</p>',
        descricaoResumida: 'Usuário precisa de acesso ao módulo de BI para criar dashboards.',
        prioridade: 'Média',
        statusOriginal: 'Em Andamento',
        status: 'EXCLUÍDO',
        categoria: 'Software',
        subcategoria: 'Instalação',
        solicitante: 'Mariana Costa',
        quemAbre: 'Mariana Costa',
        departamento: 'Comercial',
        dataAbertura: new Date(2026, 0, 15, 15, 30),
        dataAtualizacao: new Date(2026, 0, 16, 9, 0),
        dataExclusao: new Date(2026, 2, 10, 16, 20),
        quemExcluiu: 'Mariana Costa',
        motivoExclusao: 'Solicitação cancelada',
        anexosLista: [],
        anexos: 0,
        slaRestante: 'Excluído',
        slaProgresso: 1
      }
    ])

    // Estatísticas
    const ultimos7Dias = computed(() => {
      const hoje = new Date()
      const limite = new Date()
      limite.setDate(hoje.getDate() - 7)
      return chamadosExcluidos.value.filter(c => c.dataExclusao >= limite).length
    })

    const excluidosMesAtual = computed(() => {
      const hoje = new Date()
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      return chamadosExcluidos.value.filter(c => c.dataExclusao >= inicioMes).length
    })

    const excluidosPorMim = computed(() => {
      return chamadosExcluidos.value.filter(c => c.quemExcluiu === 'Usuário Atual').length
    })

    // Chamados filtrados
    const chamadosExcluidosFiltrados = computed(() => {
      let resultado = [...chamadosExcluidos.value]

      if (filtros.value.busca) {
        const buscaLower = filtros.value.busca.toLowerCase()
        resultado = resultado.filter(c =>
          c.id.toLowerCase().includes(buscaLower) ||
          c.titulo.toLowerCase().includes(buscaLower) ||
          c.descricaoResumida.toLowerCase().includes(buscaLower)
        )
      }

      if (filtros.value.prioridade) {
        resultado = resultado.filter(c => c.prioridade === filtros.value.prioridade)
      }

      if (filtros.value.categoria) {
        resultado = resultado.filter(c => c.categoria === filtros.value.categoria)
      }

      if (filtros.value.dataExclusao) {
        const dataFiltro = new Date(filtros.value.dataExclusao)
        resultado = resultado.filter(c =>
          c.dataExclusao.toDateString() === dataFiltro.toDateString()
        )
      }

      resultado.sort((a, b) => b.dataExclusao - a.dataExclusao)

      return resultado
    })

    // Funções auxiliares
    const formatarData = (data) => {
      if (!data) return ''
      return data.toLocaleDateString('pt-BR')
    }

    const formatarDataCompleta = (data) => {
      if (!data) return ''
      return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }

    const getPrioridadeIcone = (prioridade) => {
      const icones = { 'Crítica': 'error', 'Alta': 'warning', 'Média': 'info', 'Baixa': 'arrow_downward' }
      return icones[prioridade] || 'flag'
    }

    const getPrioridadeCor = (prioridade) => {
      const cores = { 'Crítica': 'red', 'Alta': 'orange', 'Média': 'blue', 'Baixa': 'green' }
      return cores[prioridade] || 'grey'
    }

    const getStatusCor = (status) => {
      const cores = { 'Aberto': 'orange', 'Em Andamento': 'primary', 'Resolvido': 'green', 'Fechado': 'grey' }
      return cores[status] || 'grey'
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

    const confirmarRestauracao = (chamado) => {
      $q.dialog({
        title: 'Restaurar Chamado',
        message: `Deseja restaurar o chamado #${chamado.id}? Ele voltará para a lista de chamados ativos.`,
        ok: { label: 'Sim, Restaurar', color: 'positive' },
        cancel: { label: 'Cancelar', color: 'grey', flat: true }
      }).onOk(() => {
        restaurarChamado(chamado)
      })
    }

    const restaurarChamado = (chamado) => {
      // Remover da lista de excluídos
      const index = chamadosExcluidos.value.findIndex(c => c.id === chamado.id)
      if (index !== -1) {
        chamadosExcluidos.value.splice(index, 1)
      }

      $q.notify({
        color: 'positive',
        message: `Chamado ${chamado.id} restaurado com sucesso!`,
        icon: 'restore',
        position: 'top-right',
        actions: [
          { label: 'Ver Chamados', color: 'white', handler: () => {
            // Navegar para página de chamados
          } }
        ]
      })
    }

    const confirmarExclusaoPermanente = (chamado) => {
      $q.dialog({
        title: 'Exclusão Permanente',
        message: `Tem certeza que deseja excluir permanentemente o chamado #${chamado.id}? Esta ação não poderá ser desfeita e os dados serão removidos definitivamente.`,
        ok: { label: 'Sim, Excluir Permanentemente', color: 'negative' },
        cancel: { label: 'Cancelar', color: 'grey', flat: true }
      }).onOk(() => {
        excluirPermanentemente(chamado)
      })
    }

    const excluirPermanentemente = (chamado) => {
      const index = chamadosExcluidos.value.findIndex(c => c.id === chamado.id)
      if (index !== -1) {
        chamadosExcluidos.value.splice(index, 1)
      }

      $q.notify({
        color: 'negative',
        message: `Chamado ${chamado.id} excluído permanentemente!`,
        icon: 'delete_forever',
        position: 'top-right'
      })
    }

    const limparHistorico = () => {
      $q.dialog({
        title: 'Limpar Histórico',
        message: 'Tem certeza que deseja limpar todo o histórico de chamados excluídos? Esta ação não poderá ser desfeita.',
        ok: { label: 'Sim, Limpar Histórico', color: 'negative' },
        cancel: { label: 'Cancelar', color: 'grey', flat: true }
      }).onOk(() => {
        chamadosExcluidos.value = []
        $q.notify({
          color: 'negative',
          message: 'Histórico de chamados excluídos limpo com sucesso!',
          icon: 'delete_sweep',
          position: 'top-right'
        })
      })
    }

    return {
      filtros,
      loading,
      dialogVisible,
      chamadoDetalhe,
      pagination,
      columns,
      prioridadeOptions,
      categoriaOptions,
      chamadosExcluidos,
      chamadosExcluidosFiltrados,
      ultimos7Dias,
      excluidosMesAtual,
      excluidosPorMim,
      formatarData,
      formatarDataCompleta,
      getPrioridadeIcone,
      getPrioridadeCor,
      getStatusCor,
      abrirDialog,
      aplicarFiltros,
      baixarAnexo,
      confirmarRestauracao,
      confirmarExclusaoPermanente,
      limparHistorico
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1400px;
  margin: 0 auto;
}
.q-list--separator > .q-item-type + .q-item-type, .q-list--separator > .q-virtual-scroll__content > .q-item-type + .q-item-type {
    border-top: none;
}
.filter-card,
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
  background-color: rgba(255, 0, 0, 0.04);
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
