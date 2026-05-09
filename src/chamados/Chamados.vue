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
                    <q-icon name="chat" size="28px" color="primary" class="q-mr-sm" />
                    Meus Chamados
                  </div>
                  <div class="text-subtitle2 text-grey-7 q-mt-sm">
                    Acompanhe todos os chamados abertos por você e sua equipe
                  </div>
                </div>
                <div>
                  <q-btn
                    color="primary"
                    icon="add"
                    label="Novo Chamado"
                    unelevated
                    @click="$router.push('/novo')"
                  />
                </div>
              </div>
            </div>
          </div>

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
          <q-card class="table-card" >
            <div class="text-subtitle1 text-weight-medium" style="padding: 1em; margin-bottom: -15px;">
                  <q-icon name="info" size="20px" color="positive" class="q-mr-xs" />
                  Chamados
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
                      dense
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
                  <div class="text-center q-pa-xl">
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
                        <q-item-label caption>Status</q-item-label>
                        <q-item-label>
                          <q-badge :color="getStatusCor(chamadoDetalhe.status)" :label="chamadoDetalhe.status" size="md" />
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
                      <q-item-section>
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

              <!-- Descrição -->
              <q-separator class="q-my-md" />
              <div>
                <div class="text-subtitle2 text-weight-medium q-mb-sm">
                  <q-icon name="description" size="18px" color="primary" class="q-mr-xs" />
                  Descrição do Problema
                </div>
                <div class="text-body2 text-grey-8" v-html="chamadoDetalhe.descricao"></div>
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

              <!-- Timeline -->
              <div v-if="chamadoDetalhe?.timeline && chamadoDetalhe.timeline.length > 0" class="q-mt-md">
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
            </q-card-section>

            <q-separator />

            <q-card-actions align="right" class="q-pa-md">
              <q-btn
                label="Adicionar Comentário"
                icon="chat"
                outline
                color="primary"
                @click="adicionarComentario"
                v-close-popup
              />
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

        <!-- Modal de Comentário -->
        <q-dialog v-model="modalComentario">
          <q-card style="min-width: 500px">
            <q-card-section class="bg-primary text-white">
              <div class="text-h6">Adicionar Comentário</div>
            </q-card-section>

            <q-card-section>
              <q-editor
                v-model="novoComentario"
                :toolbar="[['bold', 'italic', 'underline'], ['ordered', 'unordered']]"
                min-height="150px"
                placeholder="Digite seu comentário aqui..."
              />
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="Cancelar" v-close-popup />
              <q-btn color="primary" label="Enviar" @click="enviarComentario" />
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
  name: 'ChamadosAbertos',

  setup() {
    const $q = useQuasar()

    // Filtros
    const filtros = ref({
      busca: '',
      status: null,
      prioridade: null,
      categoria: null
    })

    const loading = ref(false)
    const selectedRows = ref([])
    const dialogVisible = ref(false)
    const chamadoDetalhe = ref(null)
    const modalComentario = ref(false)
    const novoComentario = ref('')
    const chamadoParaComentario = ref(null)

    // Paginação da tabela
    const pagination = ref({
      sortBy: 'dataAbertura',
      descending: true,
      page: 1,
      rowsPerPage: 10
    })

    // Colunas da tabela
    const columns = ref([
      { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true, style: 'width: 120px' },
      { name: 'titulo', label: 'Título', field: 'titulo', align: 'left', sortable: true, style: 'min-width: 250px' },
      { name: 'quemAbre', label: 'Quem Abriu', field: 'quemAbre', align: 'left', sortable: true, style: 'width: 150px' },
      { name: 'dataAbertura', label: 'Data', field: 'dataAbertura', align: 'left', sortable: true, style: 'width: 120px' },
      { name: 'dataAtualizacao', label: 'Última Mov.', field: 'dataAtualizacao', align: 'left', sortable: true, style: 'width: 120px' },
      { name: 'status', label: 'Status', field: 'status', align: 'left', sortable: true, style: 'width: 120px' },
      { name: 'prioridade', label: 'Prioridade', field: 'prioridade', align: 'left', sortable: true, style: 'width: 110px' },
      { name: 'slaRestante', label: 'SLA Restante', field: 'slaRestante', align: 'left', sortable: true, style: 'width: 120px' },
      { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center', style: 'width: 100px' }
    ])

    // Opções para filtros
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

    const categoriaOptions = ref([
      { label: 'Hardware', value: 'Hardware' },
      { label: 'Software', value: 'Software' },
      { label: 'Rede', value: 'Rede' },
      { label: 'E-mail', value: 'E-mail' },
      { label: 'Impressora', value: 'Impressora' },
      { label: 'Acesso/Senha', value: 'Acesso/Senha' }
    ])

    // Dados mockados dos chamados
    const chamados = ref([
      {
        id: 'CH-2026-001',
        titulo: 'ERP Financeiro está lento e travando com frequência',
        descricaoResumida: 'Sistema demora mais de 2 minutos para carregar telas...',
        descricao: '<p>O sistema ERP está extremamente lento desde ontem. As telas demoram mais de 2 minutos para carregar, e estamos tendo dificuldades para fechar o fechamento mensal.</p><p><strong>Impacto:</strong> Time financeiro paralisado, não conseguimos concluir as atividades do dia.</p>',
        prioridade: 'Crítica',
        status: 'Em Andamento',
        categoria: 'Software',
        subcategoria: 'Erro no sistema',
        solicitante: 'João Silva',
        quemAbre: 'João Silva',
        departamento: 'Financeiro',
        dataAbertura: new Date(2026, 4, 8, 9, 30),
        dataAtualizacao: new Date(2026, 4, 9, 10, 15),
        anexos: 3,
        anexosLista: [
          { nome: 'erro_erp.png', icone: 'image', url: '#' },
          { nome: 'logs_sistema.log', icone: 'description', url: '#' },
          { nome: 'print_tela_lento.png', icone: 'image', url: '#' }
        ],
        slaRestante: '1h 30min',
        slaProgresso: 0.75,
        timeline: [
          { titulo: 'Chamado aberto', descricao: 'Chamado registrado no sistema', data: new Date(2026, 4, 8, 9, 30), icone: 'add_circle', autor: 'João Silva', cor: 'positive' },
          { titulo: 'Atribuído ao time de infra', descricao: 'Chamado atribuído ao analista Carlos Mendes', data: new Date(2026, 4, 8, 10, 0), icone: 'assignment_ind', autor: 'Sistema', cor: 'info' },
          { titulo: 'Em análise', descricao: 'Estamos verificando os logs e monitorando o servidor', data: new Date(2026, 4, 9, 10, 15), icone: 'analytics', autor: 'Carlos Mendes', cor: 'warning' }
        ]
      },
      {
        id: 'CH-2026-002',
        titulo: 'Impressora do setor comercial não imprime',
        descricaoResumida: 'Impressora HP LaserJet apresenta erro de atolamento...',
        descricao: '<p>A impressora do setor comercial parou de funcionar hoje pela manhã. O painel indica erro de atolamento, mas após inspeção não há papel preso.</p>',
        prioridade: 'Alta',
        status: 'Aberto',
        categoria: 'Impressora',
        subcategoria: 'Atolamento de papel',
        solicitante: 'Maria Souza',
        quemAbre: 'Maria Souza',
        departamento: 'Comercial',
        dataAbertura: new Date(2026, 4, 9, 8, 45),
        dataAtualizacao: new Date(2026, 4, 9, 8, 45),
        anexos: 2,
        anexosLista: [
          { nome: 'erro_impressora.jpg', icone: 'image', url: '#' },
          { nome: 'video_erro.mp4', icone: 'theaters', url: '#' }
        ],
        slaRestante: '2h 15min',
        slaProgresso: 0.45,
        timeline: [
          { titulo: 'Chamado aberto', descricao: 'Chamado registrado no sistema', data: new Date(2026, 4, 9, 8, 45), icone: 'add_circle', autor: 'Maria Souza', cor: 'positive' }
        ]
      },
      {
        id: 'CH-2026-003',
        titulo: 'Acesso ao sistema de RH bloqueado',
        descricaoResumida: 'Usuário com perfil de RH perdeu acesso ao módulo...',
        descricao: '<p>Após a atualização do sistema na última sexta, perdi acesso ao módulo de folha de pagamento. Já tentei reiniciar o sistema e limpar cache.</p>',
        prioridade: 'Média',
        status: 'Resolvido',
        categoria: 'Acesso/Senha',
        subcategoria: 'Troca de senha',
        solicitante: 'Ana Paula',
        quemAbre: 'Ana Paula',
        departamento: 'Recursos Humanos',
        dataAbertura: new Date(2026, 4, 5, 14, 20),
        dataAtualizacao: new Date(2026, 4, 8, 16, 0),
        anexos: 1,
        anexosLista: [
          { nome: 'acesso_bloqueado.png', icone: 'image', url: '#' }
        ],
        slaRestante: 'Resolvido',
        slaProgresso: 1,
        timeline: [
          { titulo: 'Chamado aberto', descricao: 'Chamado registrado no sistema', data: new Date(2026, 4, 5, 14, 20), icone: 'add_circle', autor: 'Ana Paula', cor: 'positive' },
          { titulo: 'Resolução', descricao: 'Permissões ajustadas no sistema. Usuário consegue acessar normalmente.', data: new Date(2026, 4, 8, 16, 0), icone: 'check_circle', autor: 'TI Support', cor: 'positive' }
        ]
      },
      {
        id: 'CH-2026-004',
        titulo: 'VPN não conecta para acesso remoto',
        descricaoResumida: 'Funcionário em home office não consegue acessar VPN...',
        descricao: '<p>Estou tentando conectar na VPN para trabalhar remotamente, mas está dando erro de autenticação. Já verifiquei usuário e senha.</p>',
        prioridade: 'Alta',
        status: 'Em Andamento',
        categoria: 'Rede',
        subcategoria: 'VPN não conecta',
        solicitante: 'Pedro Santos',
        quemAbre: 'Pedro Santos',
        departamento: 'Vendas',
        dataAbertura: new Date(2026, 4, 9, 11, 0),
        dataAtualizacao: new Date(2026, 4, 9, 12, 30),
        anexos: 0,
        anexosLista: [],
        slaRestante: '3h 20min',
        slaProgresso: 0.2,
        timeline: [
          { titulo: 'Chamado aberto', descricao: 'Chamado registrado no sistema', data: new Date(2026, 4, 9, 11, 0), icone: 'add_circle', autor: 'Pedro Santos', cor: 'positive' },
          { titulo: 'Em análise', descricao: 'Verificando configurações de VPN', data: new Date(2026, 4, 9, 12, 30), icone: 'analytics', autor: 'Rede TI', cor: 'warning' }
        ]
      },
      {
        id: 'CH-2026-005',
        titulo: 'Monitor do atendimento não liga',
        descricaoResumida: 'A tela do monitor do posto de atendimento não liga...',
        descricao: '<p>O monitor da recepção está com a luz de standby acesa mas não inicia. Já testei com outro cabo de força.</p>',
        prioridade: 'Baixa',
        status: 'Aberto',
        categoria: 'Hardware',
        subcategoria: 'Monitor com defeito',
        solicitante: 'Carlos André',
        quemAbre: 'Carlos André',
        departamento: 'Atendimento',
        dataAbertura: new Date(2026, 4, 10, 8, 0),
        dataAtualizacao: new Date(2026, 4, 10, 8, 0),
        anexos: 1,
        anexosLista: [
          { nome: 'monitor_desligado.jpg', icone: 'image', url: '#' }
        ],
        slaRestante: '4h 50min',
        slaProgresso: 0.05,
        timeline: [
          { titulo: 'Chamado aberto', descricao: 'Chamado registrado no sistema', data: new Date(2026, 4, 10, 8, 0), icone: 'add_circle', autor: 'Carlos André', cor: 'positive' }
        ]
      }
    ])

    // Estatísticas
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
          c.id.toLowerCase().includes(buscaLower) ||
          c.titulo.toLowerCase().includes(buscaLower) ||
          c.descricaoResumida.toLowerCase().includes(buscaLower)
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

    // Função para excluir chamado
    const excluirChamado = (chamadoOuIds) => {
      let idsParaExcluir = []
      let nomesParaNotificacao = []

      if (Array.isArray(chamadoOuIds)) {
        idsParaExcluir = chamadoOuIds
        nomesParaNotificacao = idsParaExcluir.map(id => id)
      } else {
        idsParaExcluir = [chamadoOuIds.id]
        nomesParaNotificacao = [chamadoOuIds.id]
      }

      // Filtrar os chamados removendo os selecionados
      chamados.value = chamados.value.filter(c => !idsParaExcluir.includes(c.id))

      // Limpar seleção
      selectedRows.value = []

      // Fechar dialog se o chamado excluído estiver aberto
      if (chamadoDetalhe.value && idsParaExcluir.includes(chamadoDetalhe.value.id)) {
        dialogVisible.value = false
        chamadoDetalhe.value = null
      }

      // Notificação
      if (nomesParaNotificacao.length === 1) {
        $q.notify({
          color: 'positive',
          message: `Chamado ${nomesParaNotificacao[0]} excluído com sucesso!`,
          icon: 'check',
          position: 'top-right'
        })
      } else {
        $q.notify({
          color: 'positive',
          message: `${nomesParaNotificacao.length} chamados excluídos com sucesso!`,
          icon: 'check',
          position: 'top-right'
        })
      }
    }

    const confirmarExclusaoUnica = (chamado) => {
      $q.dialog({
        title: 'Confirmar Exclusão',
        message: `Tem certeza que deseja excluir o chamado #${chamado.id}? Esta ação não poderá ser desfeita.`,
        ok: { label: 'Sim, Excluir', color: 'negative' },
        cancel: { label: 'Cancelar', color: 'grey', flat: true }
      }).onOk(() => {
        excluirChamado(chamado)
      })
    }

    const confirmarExclusaoMultipla = () => {
      const ids = selectedRows.value.map(row => row.id)
      const plural = ids.length > 1 ? 's' : ''

      $q.dialog({
        title: 'Confirmar Exclusão em Massa',
        message: `Tem certeza que deseja excluir ${ids.length} chamado${plural}? Esta ação não poderá ser desfeita.`,
        ok: { label: `Sim, Excluir ${ids.length} Chamado${plural}`, color: 'negative' },
        cancel: { label: 'Cancelar', color: 'grey', flat: true }
      }).onOk(() => {
        excluirChamado(ids)
      })
    }

    const limparSelecao = () => {
      selectedRows.value = []
    }

    // Funções auxiliares
    const formatarData = (data) => {
      if (!data) return ''
      return data.toLocaleDateString('pt-BR')
    }

    const formatarDataCompleta = (data) => {
      if (!data) return ''
      return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
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

    const adicionarComentario = () => {
      chamadoParaComentario.value = chamadoDetalhe.value
      modalComentario.value = true
    }

    const enviarComentario = () => {
      if (novoComentario.value.trim()) {
        if (chamadoParaComentario.value) {
          const novoEvento = {
            titulo: 'Comentário adicionado',
            descricao: novoComentario.value,
            data: new Date(),
            icone: 'chat',
            autor: 'Usuário Atual',
            cor: 'info'
          }
          if (!chamadoParaComentario.value.timeline) {
            chamadoParaComentario.value.timeline = []
          }
          chamadoParaComentario.value.timeline.unshift(novoEvento)
          chamadoParaComentario.value.dataAtualizacao = new Date()

          if (chamadoDetalhe.value && chamadoDetalhe.value.id === chamadoParaComentario.value.id) {
            chamadoDetalhe.value = { ...chamadoDetalhe.value }
          }
        }

        $q.notify({
          color: 'positive',
          message: 'Comentário adicionado com sucesso!',
          icon: 'chat',
          position: 'top-right'
        })
        novoComentario.value = ''
        modalComentario.value = false
      }
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

          $q.notify({
            color: 'info',
            message: `Chamado #${chamadoDetalhe.value.id} reaberto com sucesso!`,
            icon: 'refresh',
            position: 'top-right'
          })
        }
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

    return {
      filtros,
      loading,
      selectedRows,
      dialogVisible,
      chamadoDetalhe,
      modalComentario,
      novoComentario,
      pagination,
      columns,
      statusOptions,
      prioridadeOptions,
      categoriaOptions,
      chamados,
      estatisticas,
      chamadosFiltrados,
      formatarData,
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
      adicionarComentario,
      enviarComentario,
      reabrirChamado,
      baixarAnexo,
      confirmarExclusaoUnica,
      confirmarExclusaoMultipla,
      limparSelecao
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
