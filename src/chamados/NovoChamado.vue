<template>
  <q-layout view="hHh Lpr fFf">


    <q-page-container>
      <q-page class="q-pa-lg">
        <div class="container">
          <div class="row q-col-gutter-xl">
            <!-- Coluna Esquerda (70%) - Formulário Principal -->
<!-- Coluna Esquerda (70%) - Formulário Principal -->
<div class="col-12" style="max-width: 1020px; margin: 0 auto;">
              <q-card class="form-card">
                <q-card-section>
                  <div class="text-h6 text-weight-medium q-mb-lg">
                    <q-icon name="add_circle" size="24px" color="primary" class="q-mr-sm" />
                     Novo Chamado
                  </div>

                  <!-- Tipo de Chamado -->
                  <div class="q-mb-lg">
                    <div class="text-subtitle2 text-weight-medium q-mb-sm">
                      Tipo de Chamado:
                    </div>
                    <div class="row q-col-gutter-sm">
                      <div class="col-6 col-md-3" v-for="tipo in tiposChamado" :key="tipo.value">
                        <q-card
                          flat

                          class="tipo-card cursor-pointer"
                          :class="{ 'tipo-selecionado': form.tipo === tipo.value }"
                          @click="form.tipo = tipo.value"
                        >
                          <q-card-section class="text-center q-pa-sm" style="background: #f1f1f1;">
                            <q-icon :name="tipo.icone" size="24px" :color="form.tipo === tipo.value ? 'primary' : 'grey-6'" />
                            <div class="text-caption q-mt-xs" :class="{ 'text-primary text-weight-medium': form.tipo === tipo.value }">
                              {{ tipo.label }}
                            </div>
                          </q-card-section>
                        </q-card>
                      </div>
                    </div>
                  </div>

                  <!-- Categoria e Subcategoria -->
                  <div class="row q-col-gutter-md q-mb-lg">
                    <div class="col-12 col-md-6">
                      <q-select
                        v-model="form.categoria"
                        :options="categorias"
                        label="Categoria"
                        outlined
                        dense
                        option-label="label"
                        option-value="value"
                        emit-value
                        map-options
                      >
                        <template v-slot:prepend>
                          <q-icon name="folder" color="primary" />
                        </template>
                      </q-select>
                    </div>
                    <div class="col-12 col-md-6">
                      <q-select
                        v-model="form.subcategoria"
                        :options="subcategoriasFiltradas"
                        label="Subcategoria"
                        outlined
                        dense
                        option-label="label"
                        option-value="value"
                        emit-value
                        map-options
                        :disable="!form.categoria"
                      >
                        <template v-slot:prepend>
                          <q-icon name="subdirectory_arrow_right" color="primary" />
                        </template>
                      </q-select>
                    </div>
                  </div>

                  <!-- Título e Prioridade -->
                  <div class="row q-col-gutter-md q-mb-lg">
                    <div class="col-12 col-md-8">
                      <q-input
                        v-model="form.titulo"
                        label="Título do Chamado"
                        outlined
                        dense
                        counter
                        maxlength="100"
                        hint="Descreva o problema em poucas palavras"
                      >
                        <template v-slot:prepend>
                          <q-icon name="title" color="primary" />
                        </template>
                      </q-input>
                    </div>
                    <div class="col-12 col-md-4">
                      <q-select
                        v-model="form.prioridade"
                        :options="prioridades"
                        label="Prioridade"
                        outlined
                        dense
                        option-label="label"
                        option-value="value"
                        emit-value
                        map-options
                      >
                        <template v-slot:prepend>
                          <q-icon name="flag" :color="getPrioridadeColor(form.prioridade)" />
                        </template>
                        <template v-slot:option="scope">
                          <q-item v-bind="scope.itemProps">
                            <q-item-section avatar>
                              <q-icon :name="scope.opt.icone" :color="scope.opt.cor" />
                            </q-item-section>
                            <q-item-section>
                              <q-item-label>{{ scope.opt.label }}</q-item-label>
                              <q-item-label caption>SLA: {{ scope.opt.sla }}</q-item-label>
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </div>
                  </div>

                  <!-- Descrição Detalhada -->
                  <div class="q-mb-lg">
                    <div class="text-subtitle2 text-weight-medium q-mb-sm">
                      Descrição
                    </div>
                    <q-editor
                      v-model="form.descricao"
                      :toolbar="[
                        ['bold', 'italic', 'strike', 'underline'],
                        ['ordered', 'unordered'],
                        ['fullscreen']
                      ]"
                      min-height="200px"

                    />
                  </div>

                  <!-- Anexos -->
                  <div class="q-mb-lg">
                    <div class="text-subtitle2 text-weight-medium q-mb-sm">
                      <q-icon name="attach_file" size="16px" color="primary" class="q-mr-xs" />
                      Anexos (prints, logs, documentos)
                    </div>
                    <q-file
                      v-model="form.anexos"
                      outlined
                      dense
                      multiple
                      counter
                      max-files="5"
                      max-total-size="10485760"
                      accept=".jpg,.png,.pdf,.doc,.docx,.txt,.log"
                      hint="Formatos aceitos: JPG, PNG, PDF, DOC, TXT, LOG • Máx: 10MB"
                    >
                      <template v-slot:prepend>
                        <q-icon name="cloud_upload" color="primary" />
                      </template>
                      <template v-slot:file="{ index, file }">
                        <q-chip
                          removable
                          dense
                          @remove="removerAnexo(index)"
                          :label="file.name"
                          color="primary"
                          text-color="white"
                          size="sm"
                        >
                          <q-avatar icon="insert_drive_file" color="white" text-color="primary" size="20px" />
                        </q-chip>
                      </template>
                    </q-file>
                  </div>

                  <!-- Botões de Ação -->
                  <div class="row justify-end q-gutter-sm">

                    <q-btn
                      label="Abrir Chamado"
                      color="primary"
                      icon="add"
                      @click="abrirChamado"
                      :disable="!formValido"
                    />
                  </div>
                </q-card-section>
              </q-card>
            </div>


          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'

export default {
  name: 'AbrirChamado',

  setup() {
    const $q = useQuasar()

    // Form
    const form = ref({
      tipo: '',
      categoria: '',
      subcategoria: '',
      titulo: '',
      prioridade: '',
      descricao: '',
      anexos: []
    })

    // Usuário logado (mock)
    const usuarioLogado = ref({
      nome: 'João Silva',
      email: 'joao.silva@empresa.com.br',
      departamento: 'Financeiro',
      iniciais: 'JS'
    })

    // Tipos de Chamado
    const tiposChamado = ref([
      { value: 'incidente', label: 'Incidente', icone: 'warning' },
      { value: 'requisicao', label: 'Requisição', icone: 'task' },
      { value: 'duvida', label: 'Dúvida', icone: 'help' },
      { value: 'problema', label: 'Problema', icone: 'bug_report' }
    ])

    // Categorias
    const categorias = ref([
      { label: 'Hardware', value: 'hardware' },
      { label: 'Software', value: 'software' },
      { label: 'Rede', value: 'rede' },
      { label: 'E-mail', value: 'email' },
      { label: 'Impressora', value: 'impressora' },
      { label: 'Acesso/Senha', value: 'acesso' },
      { label: 'Telefonia', value: 'telefonia' },
      { label: 'Outros', value: 'outros' }
    ])

    // Subcategorias
    const subcategorias = ref([
      { label: 'Computador não liga', value: 'pc_nao_liga', categoria: 'hardware' },
      { label: 'Monitor com defeito', value: 'monitor_defeito', categoria: 'hardware' },
      { label: 'Teclado/Mouse quebrado', value: 'perifericos', categoria: 'hardware' },
      { label: 'Instalação de software', value: 'instalacao', categoria: 'software' },
      { label: 'Erro no sistema', value: 'erro_sistema', categoria: 'software' },
      { label: 'Atualização pendente', value: 'atualizacao', categoria: 'software' },
      { label: 'Internet lenta', value: 'internet_lenta', categoria: 'rede' },
      { label: 'Sem conexão', value: 'sem_conexao', categoria: 'rede' },
      { label: 'VPN não conecta', value: 'vpn', categoria: 'rede' },
      { label: 'Caixa cheia', value: 'caixa_cheia', categoria: 'email' },
      { label: 'Não recebe e-mails', value: 'nao_recebe', categoria: 'email' },
      { label: 'Configuração de assinatura', value: 'assinatura', categoria: 'email' },
      { label: 'Atolamento de papel', value: 'atolamento', categoria: 'impressora' },
      { label: 'Sem toner/tinta', value: 'sem_toner', categoria: 'impressora' },
      { label: 'Troca de senha', value: 'troca_senha', categoria: 'acesso' },
      { label: 'Criação de usuário', value: 'criar_usuario', categoria: 'acesso' },
      { label: 'Ramal com problema', value: 'ramal', categoria: 'telefonia' },
      { label: 'Headset quebrado', value: 'headset', categoria: 'telefonia' },
      { label: 'Outro', value: 'outro', categoria: 'outros' }
    ])

    // Prioridades
    const prioridades = ref([
      { label: 'Crítica', value: 'critica', icone: 'error', cor: 'red', sla: 'Resposta: 30 min • Resolução: 2h' },
      { label: 'Alta', value: 'alta', icone: 'warning', cor: 'orange', sla: 'Resposta: 1h • Resolução: 4h' },
      { label: 'Média', value: 'media', icone: 'info', cor: 'blue', sla: 'Resposta: 2h • Resolução: 8h' },
      { label: 'Baixa', value: 'baixa', icone: 'arrow_downward', cor: 'green', sla: 'Resposta: 4h • Resolução: 24h' }
    ])

    // SLAs
    const slas = ref([
      { prioridade: 'Crítica', icone: 'error', cor: 'red', resposta: '30 minutos', resolucao: '2h' },
      { prioridade: 'Alta', icone: 'warning', cor: 'orange', resposta: '1 hora', resolucao: '4h' },
      { prioridade: 'Média', icone: 'info', cor: 'blue', resposta: '2 horas', resolucao: '8h' },
      { prioridade: 'Baixa', icone: 'arrow_downward', cor: 'green', resposta: '4 horas', resolucao: '24h' }
    ])

    // Últimos chamados (mock)
    const ultimosChamados = ref([
      { id: 1245, titulo: 'Erro ao acessar sistema financeiro', data: '05/05/2026', status: 'Em Andamento' },
      { id: 1238, titulo: 'Troca de teclado com defeito', data: '28/04/2026', status: 'Resolvido' },
      { id: 1230, titulo: 'Instalação de software de BI', data: '15/04/2026', status: 'Resolvido' }
    ])

    // Computed
    const subcategoriasFiltradas = computed(() => {
      if (!form.value.categoria) return []
      return subcategorias.value.filter(s => s.categoria === form.value.categoria)
    })

    const formValido = computed(() => {
      return form.value.tipo &&
             form.value.categoria &&
             form.value.subcategoria &&
             form.value.titulo &&
             form.value.prioridade &&
             form.value.descricao
    })

    // Methods
    const getPrioridadeColor = (prioridade) => {
      const colors = { 'critica': 'red', 'alta': 'orange', 'media': 'blue', 'baixa': 'green' }
      return colors[prioridade] || 'grey'
    }

    const getStatusColor = (status) => {
      const colors = { 'Aberto': 'orange', 'Em Andamento': 'primary', 'Resolvido': 'green' }
      return colors[status] || 'grey'
    }

    const removerAnexo = (index) => {
      form.value.anexos.splice(index, 1)
    }

    const salvarRascunho = () => {
      $q.notify({
        color: 'info',
        message: 'Rascunho salvo com sucesso!',
        icon: 'save',
        position: 'top-right'
      })
    }

    const abrirChamado = () => {
      if (!formValido.value) {
        $q.notify({
          color: 'warning',
          message: 'Preencha todos os campos obrigatórios',
          icon: 'warning',
          position: 'top-right'
        })
        return
      }

      $q.dialog({
        title: 'Confirmar Abertura de Chamado',
        message: `Deseja realmente abrir este chamado?`,
        ok: { label: 'Sim, Abrir', color: 'primary' },
        cancel: { label: 'Cancelar', color: 'grey', flat: true }
      }).onOk(() => {
        // Simular abertura
        setTimeout(() => {
          $q.notify({
            color: 'positive',
            message: `Chamado #${Math.floor(Math.random() * 1000) + 1257} aberto com sucesso!`,
            icon: 'check',
            position: 'top-right',
            actions: [
              { label: 'Acompanhar', color: 'white', handler: () => { /* navegar */ } }
            ]
          })

          // Limpar formulário
          form.value = {
            tipo: '',
            categoria: '',
            subcategoria: '',
            titulo: '',
            prioridade: '',
            descricao: '',
            anexos: []
          }
        }, 1000)
      })
    }

    return {
      form,
      usuarioLogado,
      tiposChamado,
      categorias,
      subcategorias,
      prioridades,
      slas,
      ultimosChamados,
      subcategoriasFiltradas,
      formValido,
      getPrioridadeColor,
      getStatusColor,
      removerAnexo,
      salvarRascunho,
      abrirChamado
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 1400px;
  margin: 0 auto;
}

.form-card,
.info-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.tipo-card {
  border-radius: 12px;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.tipo-card:hover {
  background: rgba(25, 118, 210, 0.02);
  transform: translateY(-2px);
}

.tipo-selecionado {
  border-color: #1976d2;
  background: rgba(25, 118, 210, 0.05);
}

.bg-primary-soft {
  background: rgba(25, 118, 210, 0.05);
}

.cursor-pointer {
  cursor: pointer;
}

/* Estilos para inputs */
:deep(.q-field__native) {
  font-size: 0.9rem;
}

:deep(.q-field__label) {
  font-size: 0.85rem;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0;
  }

  .form-card,
  .info-card {
    margin-bottom: 16px;
  }
}
</style>
