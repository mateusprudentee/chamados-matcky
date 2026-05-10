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
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default {
  name: 'AbrirChamado',

  setup() {
    const $q = useQuasar()

    // =========================
    // ESTADOS
    // =========================
    const loadingInicial = ref(false)
    const loadingSubcategorias = ref(false)
    const loadingEnvio = ref(false)
    const recarregando = ref(false)
    const erroCarregamento = ref('')

    // LOADING USUÁRIO
    const loadingUsuario = ref(false)

    const tiposChamado = ref([])
    const categorias = ref([])
    const subcategorias = ref([])
    const prioridades = ref([])

    // =========================
    // FORM
    // =========================
    const form = ref({
      tipo: '',
      categoria: '',
      subcategoria: '',
      titulo: '',
      prioridade: '',
      descricao: ''
    })

    // =========================
    // USUÁRIO LOGADO
    // =========================
    const usuarioLogado = ref({
      nome: '',
      email: '',
      departamento: '',
      iniciais: ''
    })

    // =========================
    // COMPUTEDS
    // =========================
    const subcategoriasFiltradas = computed(() => {
      if (!form.value.categoria) return []

      return subcategorias.value.filter(
        s => s.categoria_value === form.value.categoria
      )
    })

    const formValido = computed(() => {
      return (
        form.value.tipo &&
        form.value.categoria &&
        form.value.subcategoria &&
        form.value.titulo &&
        form.value.prioridade &&
        form.value.descricao
      )
    })

    // =========================
    // HELPERS
    // =========================
    const getPrioridadeColor = (prioridade) => {
      const colors = {
        critica: 'red',
        alta: 'orange',
        media: 'blue',
        baixa: 'green'
      }

      return colors[prioridade] || 'grey'
    }

    const gerarIniciais = (nome) => {
      if (!nome) return ''

      return nome
        .split(' ')
        .map(parte => parte[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    }

    // =========================
    // CARREGAR USUÁRIO LOGADO
    // =========================
    const carregarUsuarioLogado = async () => {
      loadingUsuario.value = true

      try {
        // CACHE
        const cachedUser = localStorage.getItem('userData')
        const token =
          localStorage.getItem('authToken') ||
          localStorage.getItem('token')

        console.log('Token encontrado:', !!token)
        console.log('Usuário cacheado:', cachedUser)

        // =========================
        // CARREGA DO CACHE PRIMEIRO
        // =========================
        if (cachedUser) {
          const user = JSON.parse(cachedUser)

          usuarioLogado.value = {
            nome:
              user.nome ||
              user.username ||
              user.name ||
              'Usuário',

            email:
              user.email ||
              '',

            departamento:
              user.departamento ||
              user.department ||
              'Não informado',

            iniciais: gerarIniciais(
              user.nome ||
              user.username ||
              user.name
            )
          }

          console.log(
            'Usuário carregado do cache:',
            usuarioLogado.value
          )
        }

        // =========================
        // SEM TOKEN
        // =========================
        if (!token) {
          console.warn('Token não encontrado')

          usuarioLogado.value = {
            nome: 'Visitante',
            email: '',
            departamento: '',
            iniciais: 'VT'
          }

          return
        }

        // =========================
        // API AUTH /ME
        // =========================
        let response = await fetch(
          'https://chamados-backend-4efw.onrender.com/api/auth/me',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )

        // =========================
        // ROTA ALTERNATIVA
        // =========================
        if (!response.ok) {
          console.log(
            'Tentando rota alternativa /api/users/me'
          )

          response = await fetch(
            'https://chamados-backend-4efw.onrender.com/api/users/me',
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          )
        }

        // =========================
        // SE OK
        // =========================
        if (response.ok) {
          const userData = await response.json()

          console.log(
            'Dados do usuário recebidos:',
            userData
          )

          const user = userData.user || userData

          usuarioLogado.value = {
            nome:
              user.nome ||
              user.username ||
              user.name ||
              user.nickname ||
              'Usuário',

            email:
              user.email ||
              '',

            departamento:
              user.departamento ||
              user.department ||
              user.setor ||
              'Não informado',

            iniciais: gerarIniciais(
              user.nome ||
              user.username ||
              user.name
            )
          }

          // Atualiza cache
          localStorage.setItem(
            'userData',
            JSON.stringify(user)
          )

          console.log(
            'Usuário atualizado:',
            usuarioLogado.value
          )
        }

        // =========================
        // TOKEN INVÁLIDO
        // =========================
        else if (response.status === 401) {
          console.warn('Token inválido')

          usuarioLogado.value = {
            nome: 'Visitante',
            email: '',
            departamento: '',
            iniciais: 'VT'
          }

          localStorage.removeItem('authToken')
          localStorage.removeItem('token')
          localStorage.removeItem('userData')
        }

        // =========================
        // OUTROS ERROS
        // =========================
        else {
          console.error(
            'Erro ao carregar usuário:',
            response.status
          )

          if (!cachedUser) {
            usuarioLogado.value = {
              nome: 'Usuário',
              email: '',
              departamento: '',
              iniciais: 'US'
            }
          }
        }
      } catch (error) {
        console.error(
          'Erro ao carregar usuário logado:',
          error
        )

        const cachedUser = localStorage.getItem('userData')

        if (!cachedUser) {
          usuarioLogado.value = {
            nome: 'Usuário',
            email: '',
            departamento: '',
            iniciais: 'US'
          }
        }
      } finally {
        loadingUsuario.value = false
      }
    }
const carregarCacheInicial = () => {

  const cacheTipos =
    localStorage.getItem('cache_tipos')

  const cacheCategorias =
    localStorage.getItem('cache_categorias')

  const cachePrioridades =
    localStorage.getItem('cache_prioridades')

  if (cacheTipos) {
    tiposChamado.value = JSON.parse(cacheTipos)
  }

  if (cacheCategorias) {
    categorias.value = JSON.parse(cacheCategorias)
  }

  if (cachePrioridades) {
    prioridades.value = JSON.parse(cachePrioridades)
  }

  // só mostra skeleton se NÃO tiver cache
  if (
    !cacheTipos ||
    !cacheCategorias ||
    !cachePrioridades
  ) {
    loadingInicial.value = true
  }
}
    // =========================
    // CARREGAR DADOS INICIAIS
    // =========================
    const carregarDadosIniciais = async (tentativa = 1) => {
      const maxTentativas = 3

      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(
              new Error(
                'Timeout na conexão com o servidor'
              )
            )
          }, 1000)
        })

        const requestPromise = Promise.all([
          api.get('/tipos'),
          api.get('/categorias'),
          api.get('/prioridades')
        ])

        const [
          tiposRes,
          catRes,
          priorRes
        ] = await Promise.race([
          requestPromise,
          timeoutPromise
        ])

        if (tiposRes.data.success) {
          localStorage.setItem(
  'cache_tipos',
  JSON.stringify(tiposRes.data.data)
)
          tiposChamado.value = tiposRes.data.data
        }

        if (catRes.data.success) {
          localStorage.setItem(
  'cache_categorias',
  JSON.stringify(catRes.data.data)
)
          categorias.value = catRes.data.data
        }

        if (priorRes.data.success) {
          localStorage.setItem(
  'cache_prioridades',
  JSON.stringify(priorRes.data.data)
)
          prioridades.value = priorRes.data.data
        }

        erroCarregamento.value = ''
      } catch (error) {
        console.error(
          `Erro ao carregar dados (${tentativa}/3):`,
          error
        )

        if (tentativa < maxTentativas) {
          await new Promise(resolve =>
            setTimeout(resolve, 1000)
          )

          return carregarDadosIniciais(
            tentativa + 1
          )
        }

        if (
          error.message ===
          'Timeout na conexão com o servidor'
        ) {
          erroCarregamento.value =
            'Servidor demorou muito para responder.'
        } else if (
          error.code === 'ECONNABORTED'
        ) {
          erroCarregamento.value =
            'Conexão expirada.'
        } else if (
          error.message === 'Network Error'
        ) {
          erroCarregamento.value =
            'Erro de rede.'
        } else {
          erroCarregamento.value =
            'Erro ao carregar dados.'
        }
      } finally {
        loadingInicial.value = false
      }
    }

    // =========================
    // RECARREGAR
    // =========================
    const recarregarDados = async () => {
      recarregando.value = true

      erroCarregamento.value = ''
      loadingInicial.value = true

      await carregarDadosIniciais()

      recarregando.value = false
    }

    // =========================
    // SUBCATEGORIAS
    // =========================
    const carregarSubcategorias = async () => {
      if (!form.value.categoria) {
        subcategorias.value = []
        form.value.subcategoria = ''
        return
      }

      loadingSubcategorias.value = true

      try {
        const response = await api.get(
          `/subcategorias?categoria=${form.value.categoria}`
        )

        if (response.data.success) {
          subcategorias.value =
            response.data.data

          form.value.subcategoria = ''
        }
      } catch (error) {
        console.error(
          'Erro ao carregar subcategorias:',
          error
        )

        $q.notify({
          color: 'negative',
          message:
            'Erro ao carregar subcategorias',
          icon: 'error',
          position: 'top-right'
        })
      } finally {
        loadingSubcategorias.value = false
      }
    }

    // =========================
    // ABRIR CHAMADO
    // =========================
    const abrirChamado = async () => {
      if (!formValido.value) {
        $q.notify({
          color: 'warning',
          message:
            'Preencha todos os campos obrigatórios',
          icon: 'warning',
          position: 'top-right'
        })

        return
      }

      $q.dialog({
        title: 'Confirmar',
        message:
          'Deseja realmente abrir este chamado?',
        ok: {
          label: 'Sim',
          color: 'primary'
        },
        cancel: {
          label: 'Cancelar',
          flat: true
        }
      }).onOk(async () => {
        loadingEnvio.value = true

        try {
          const tipoSelecionado =
            tiposChamado.value.find(
              t => t.value === form.value.tipo
            )

          const prioridadeSelecionada =
            prioridades.value.find(
              p =>
                p.value === form.value.prioridade
            )

          const dadosChamado = {
            tipo: form.value.tipo,
            icone_tipo:
              tipoSelecionado?.icone || '',

            categoria: form.value.categoria,
            subcategoria:
              form.value.subcategoria,

            titulo: form.value.titulo,
            prioridade:
              form.value.prioridade,

            descricao: form.value.descricao,

            nome_usuario:
              usuarioLogado.value.nome,

            email_usuario:
              usuarioLogado.value.email,

            departamento_usuario:
              usuarioLogado.value.departamento,

            sla_resposta:
              prioridadeSelecionada?.sla_resposta ||
              '',

            sla_resolucao:
              prioridadeSelecionada?.sla_resolucao ||
              ''
          }

          const response = await api.post(
            '/chamados',
            dadosChamado
          )

          if (response.data.success) {
            const numeroChamado =
              response.data.data.id

            $q.notify({
              color: 'positive',
              message:
                `Chamado #${numeroChamado} aberto com sucesso!`,
              icon: 'check',
              position: 'top-right',
              timeout: 5000
            })

            // RESET FORM
            form.value = {
              tipo: '',
              categoria: '',
              subcategoria: '',
              titulo: '',
              prioridade: '',
              descricao: ''
            }
          }
        } catch (error) {
          console.error(
            'Erro ao abrir chamado:',
            error
          )

          $q.notify({
            color: 'negative',
            message:
              'Erro ao abrir chamado.',
            icon: 'error',
            position: 'top-right'
          })
        } finally {
          loadingEnvio.value = false
        }
      })
    }

    // =========================
    // MOUNTED
    // =========================
   onMounted(async () => {

  // mostra dados instantaneamente
  carregarCacheInicial()

  // atualiza silenciosamente
  await carregarUsuarioLogado()
  await carregarDadosIniciais()

})
    // =========================
    // RETURN
    // =========================
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
      loadingUsuario,
      recarregando,
      erroCarregamento,

      getPrioridadeColor,

      carregarSubcategorias,
      abrirChamado,
      recarregarDados,
      carregarUsuarioLogado
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
