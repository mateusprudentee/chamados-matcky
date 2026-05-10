<template>
  <q-layout view="hHh Lpr fFf">
    <q-page-container>
      <q-page class="q-pa-lg">
        <div class="container">
          <div class="row q-col-gutter-xl">
            <div class="col-12" style="max-width: 1020px; margin: 0 auto;">
              <q-card class="form-card">
                <q-card-section>
                  <div class="text-h6 text-weight-medium q-mb-lg">
                    <q-icon name="add_circle" size="24px" color="primary" class="q-mr-sm" />
                    Novo Chamado
                  </div>

                  <!-- Loading com Skeleton -->
                  <div v-if="loadingInicial" class="q-pa-md">
                    <!-- Skeleton para Tipo de Chamado -->
                    <div class="q-mb-lg">
                      <div class="text-subtitle2 text-weight-medium q-mb-sm">
                        <q-skeleton type="text" width="150px" />
                      </div>
                      <div class="row q-col-gutter-sm">
                        <div class="col-6 col-md-3" v-for="i in 4" :key="i">
                          <q-card flat class="tipo-card">
                            <q-card-section class="text-center q-pa-sm" style="background: #f1f1f1;">
                              <q-skeleton type="circle" size="24px" animation="wave" />
                              <q-skeleton type="text" width="60px" class="q-mt-xs" animation="wave" />
                            </q-card-section>
                          </q-card>
                        </div>
                      </div>
                    </div>

                    <!-- Skeleton para Categoria e Subcategoria -->
                    <div class="row q-col-gutter-md q-mb-lg">
                      <div class="col-12 col-md-6">
                        <q-skeleton type="rect" height="56px" animation="wave" />
                      </div>
                      <div class="col-12 col-md-6">
                        <q-skeleton type="rect" height="56px" animation="wave" />
                      </div>
                    </div>

                    <!-- Skeleton para Título e Prioridade -->
                    <div class="row q-col-gutter-md q-mb-lg">
                      <div class="col-12 col-md-8">
                        <q-skeleton type="rect" height="56px" animation="wave" />
                      </div>
                      <div class="col-12 col-md-4">
                        <q-skeleton type="rect" height="56px" animation="wave" />
                      </div>
                    </div>

                    <!-- Skeleton para Descrição -->
                    <div class="q-mb-lg">
                      <q-skeleton type="rect" height="200px" animation="wave" />
                    </div>

                    <!-- Skeleton para Anexos -->
                    <div class="q-mb-lg">
                      <q-skeleton type="rect" height="56px" animation="wave" />
                    </div>

                    <!-- Skeleton para Botão -->
                    <div class="row justify-end">
                      <q-skeleton type="rect" width="120px" height="36px" animation="wave" />
                    </div>
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
                          @update:model-value="carregarSubcategorias"
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
                          :loading="loadingSubcategorias"
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
                        :disable="!formValido || loadingEnvio"
                        :loading="loadingEnvio"
                      />
                    </div>
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
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import axios from 'axios'

const API_URL = 'https://chamados-backend-4efw.onrender.com/api'

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Aumentei o timeout para 30 segundos
  headers: {
    'Content-Type': 'application/json'
  }
})

export default {
  name: 'AbrirChamado',

  setup() {
    const $q = useQuasar()

    // Estados
    const loadingInicial = ref(true)
    const loadingSubcategorias = ref(false)
    const loadingEnvio = ref(false)
    const recarregando = ref(false)
    const erroCarregamento = ref('')

    const tiposChamado = ref([])
    const categorias = ref([])
    const subcategorias = ref([])
    const prioridades = ref([])

    const form = ref({
      tipo: '',
      categoria: '',
      subcategoria: '',
      titulo: '',
      prioridade: '',
      descricao: '',
      anexos: []
    })

    const usuarioLogado = ref({
      nome: 'João Silva',
      email: 'joao.silva@empresa.com.br',
      departamento: 'Financeiro',
      iniciais: 'JS'
    })

    // Computed
    const subcategoriasFiltradas = computed(() => {
      if (!form.value.categoria) return []
      return subcategorias.value.filter(s => s.categoria_value === form.value.categoria)
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

    const removerAnexo = (index) => {
      form.value.anexos.splice(index, 1)
    }

    // Carregar dados iniciais da API com timeout e retry
    const carregarDadosIniciais = async (tentativa = 1) => {
      const maxTentativas = 3

      try {
        // Usar Promise.race para timeout global
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout na conexão com o servidor')), 30000)
        })

        const requestPromise = Promise.all([
          api.get('/catalogo/tipos'),
          api.get('/catalogo/categorias'),
          api.get('/catalogo/prioridades')
        ])

        const [tiposRes, catRes, priorRes] = await Promise.race([requestPromise, timeoutPromise])

        if (tiposRes.data.success) tiposChamado.value = tiposRes.data.data
        if (catRes.data.success) categorias.value = catRes.data.data
        if (priorRes.data.success) prioridades.value = priorRes.data.data

        // Limpar erro se existir
        erroCarregamento.value = ''

      } catch (error) {
        console.error(`Erro ao carregar dados iniciais (tentativa ${tentativa}/${maxTentativas}):`, error)

        if (tentativa < maxTentativas) {
          // Aguardar antes de tentar novamente
          await new Promise(resolve => setTimeout(resolve, 1))
          return carregarDadosIniciais(tentativa + 1)
        }

        // Verificar tipo de erro
        let mensagemErro = ''
        if (error.message === 'Timeout na conexão com o servidor') {
          mensagemErro = 'Servidor demorou muito para responder. Verifique sua conexão.'
        } else if (error.code === 'ECONNABORTED') {
          mensagemErro = 'Conexão com o servidor expirou. Tente novamente.'
        } else if (error.message === 'Network Error') {
          mensagemErro = 'Erro de rede. Verifique sua conexão com a internet.'
        } else {
          mensagemErro = 'Não conseguimos retornar os dados.'
        }

        erroCarregamento.value = mensagemErro


      } finally {
        loadingInicial.value = false
      }
    }

    // Recarregar dados
    const recarregarDados = async () => {
      recarregando.value = true
      erroCarregamento.value = ''
      loadingInicial.value = true
      await carregarDadosIniciais()
      recarregando.value = false
    }

    // Carregar subcategorias quando categoria mudar
    const carregarSubcategorias = async () => {
      if (!form.value.categoria) {
        subcategorias.value = []
        form.value.subcategoria = ''
        return
      }

      loadingSubcategorias.value = true
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout ao carregar subcategorias')), 15000)
        })

        const requestPromise = api.get(`/catalogo/subcategorias?categoria=${form.value.categoria}`)
        const response = await Promise.race([requestPromise, timeoutPromise])

        if (response.data.success) {
          subcategorias.value = response.data.data
          form.value.subcategoria = ''
        }
      } catch (error) {
        console.error('Erro ao carregar subcategorias:', error)
        $q.notify({
          color: 'negative',
          message: 'Erro ao carregar subcategorias. Tente selecionar outra categoria.',
          icon: 'error',
          position: 'top-right',
          timeout: 4000
        })
      } finally {
        loadingSubcategorias.value = false
      }
    }

    // Converter arquivos para base64
    const converterAnexosParaBase64 = async (files) => {
      const anexosConvertidos = []
      for (const file of files) {
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
        anexosConvertidos.push({
          nome: file.name,
          tipo: file.type,
          tamanho: file.size,
          dados: base64
        })
      }
      return anexosConvertidos
    }

    // Abrir chamado
    const abrirChamado = async () => {
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
        message: 'Deseja realmente abrir este chamado?',
        ok: { label: 'Sim, Abrir', color: 'primary' },
        cancel: { label: 'Cancelar', color: 'grey', flat: true }
      }).onOk(async () => {
        loadingEnvio.value = true

        try {
          const tipoSelecionado = tiposChamado.value.find(t => t.value === form.value.tipo)
          const prioridadeSelecionada = prioridades.value.find(p => p.value === form.value.prioridade)

          const anexosConvertidos = form.value.anexos.length > 0
            ? await converterAnexosParaBase64(form.value.anexos)
            : []

          const dadosChamado = {
            tipo: form.value.tipo,
            icone_tipo: tipoSelecionado?.icone || '',
            categoria: form.value.categoria,
            subcategoria: form.value.subcategoria,
            titulo: form.value.titulo,
            prioridade: form.value.prioridade,
            descricao: form.value.descricao,
            anexos: anexosConvertidos,
            nome_usuario: usuarioLogado.value.nome,
            email_usuario: usuarioLogado.value.email,
            departamento_usuario: usuarioLogado.value.departamento,
            sla_resposta: prioridadeSelecionada?.sla_resposta || '',
            sla_resolucao: prioridadeSelecionada?.sla_resolucao || ''
          }

          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout ao enviar chamado')), 30000)
          })

          const requestPromise = api.post('/chamados', dadosChamado)
          const response = await Promise.race([requestPromise, timeoutPromise])

          if (response.data.success) {
            const numeroChamado = response.data.chamado.id

            $q.notify({
              color: 'positive',
              message: `Chamado #${numeroChamado} aberto com sucesso!`,
              icon: 'check',
              position: 'top-right',
              timeout: 5000,
              actions: [
                {
                  label: 'Acompanhar',
                  color: 'white',
                  handler: () => {
                    console.log('Acompanhar chamado:', numeroChamado)
                  }
                }
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
          }
        } catch (error) {
          console.error('Erro ao abrir chamado:', error)

          let mensagemErro = 'Erro ao abrir chamado. Tente novamente.'

          if (error.message === 'Timeout ao enviar chamado') {
            mensagemErro = 'Tempo limite excedido. O servidor pode estar lento.'
          } else if (error.response) {
            mensagemErro = error.response.data.message || mensagemErro
          } else if (error.request) {
            mensagemErro = 'Erro de conexão com o servidor. Verifique sua internet.'
          }

          $q.notify({
            color: 'negative',
            message: mensagemErro,
            icon: 'error',
            position: 'top-right',
            timeout: 5000
          })
        } finally {
          loadingEnvio.value = false
        }
      })
    }

    onMounted(() => {
      carregarDadosIniciais()
    })

    return {
      form,
      usuarioLogado,
      tiposChamado,
      categorias,
      subcategorias,
      prioridades,
      subcategoriasFiltradas,
      formValido,
      loadingInicial,
      loadingSubcategorias,
      loadingEnvio,
      recarregando,
      erroCarregamento,
      getPrioridadeColor,
      removerAnexo,
      carregarSubcategorias,
      abrirChamado,
      recarregarDados
    }
  }
}
</script>

<style scoped>
.tipo-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.tipo-card:hover {
  transform: translateY(-2px);
}

.tipo-selecionado {
  border-color: #1976d2;
  background-color: #f5f5f5;
}
</style>
<style scoped>
.container {
  max-width: 1400px;
  margin: 0 auto;
}

.form-card {
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

.cursor-pointer {
  cursor: pointer;
}

:deep(.q-field__native) {
  font-size: 0.9rem;
}

:deep(.q-field__label) {
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .container {
    padding: 0;
  }
  .form-card {
    margin-bottom: 16px;
  }
}
</style>

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
