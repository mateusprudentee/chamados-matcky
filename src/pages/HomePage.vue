<template>
  <q-page class="home-page">

    <!-- HERO -->
    <div class="hero">

      <div class="hero-content">

        <div class="title">
          Gestão de Chamados
        </div>

        <div class="subtitle">
          Faça abertura de sua solicitação, veja documentações e mais
        </div>

        <!-- SEARCH -->
        <div class="search-box">

          <q-input
            v-model="search"
            placeholder="Digite o que deseja pesquisar..."
            outlined
            rounded
            bg-color="white"
            class="search-input"
            @focus="showSuggestions = true"
            @blur="hideSuggestions"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>


          <!-- SUGESTÕES -->
          <q-card v-if="filteredSuggestions.length && showSuggestions" class="suggestions">
            <q-list separator>

              <q-item
                v-for="(item, index) in filteredSuggestions"
                :key="index"
                clickable
                v-ripple
                @mousedown="selectSuggestion(item)"
              >
                <q-item-section avatar>
                  <q-icon name="insights" color="primary" />
                </q-item-section>

                <q-item-section>
                  <q-item-label>{{ item }}</q-item-label>
                </q-item-section>

              </q-item>

            </q-list>
          </q-card>

        </div>

      </div>

    </div>

    <!-- ATALHOS -->
    <div class="quick-actions row q-col-gutter-md " style="margin-top: -30px;">

      <div
        class="col-12 col-sm-6 col-md-4"
        v-for="(item, i) in quickActions"
        :key="i"
      >
       <q-card class="action-card" clickable @click="$router.push(item.to)">
          <q-card-section>
            <q-icon :name="item.icon" size="32px" class="q-mb-sm" color="blue"/>
            <div class="text-subtitle1 text-weight-medium">{{ item.title }}</div>
          </q-card-section>
        </q-card>
      </div>

    </div>

  </q-page>
</template>

<script>
export default {
  name: 'HomePage',

  data () {
    return {
      search: '',
      showSuggestions: false,

     suggestions: [
  'Abertura de chamado para suporte técnico',
  'Abertura de chamado para desenvolvimento',
  'Solicitação de correção de bugs',
  'Solicitação de melhoria no sistema',
  'Solicitação de nova funcionalidade',
  'Suporte operacional ao sistema',
  'Erro ao acessar plataforma',
  'Problema de lentidão no sistema',
  'Falha no login de usuários',
  'Erro de permissões de acesso',
  'Reset de senha de usuário',
  'Criação de novos usuários',
  'Atualização de permissões',
  'Integração com APIs externas',
  'Integração com ERP',
  'Integração com sistema financeiro',
  'Integração com WhatsApp',
  'Integração com emissão fiscal',
  'Integração com banco de dados',
  'Correção de inconsistência de dados',
  'Falha em relatórios gerenciais',
  'Problema em dashboard',
  'Erro em filtros avançados',
  'Erro ao exportar PDF',
  'Erro ao exportar Excel',
  'Problema em gráficos analíticos',
  'Falha no carregamento de dados',
  'Ajuste de layout responsivo',
  'Correção visual em telas',
  'Problema em dispositivos móveis',
  'Melhoria de performance',
  'Otimização de consultas SQL',
  'Atualização de infraestrutura',
  'Atualização de servidor',
  'Atualização de banco de dados',
  'Atualização de segurança',
  'Implementação de autenticação',
  'Configuração de backup',
  'Configuração de monitoramento',
  'Problema em notificações',
  'Falha em envio de e-mails',
  'Erro em automações',
  'Criação de módulo personalizado',
  'Desenvolvimento de painel administrativo',
  'Criação de dashboard executivo',
  'Desenvolvimento de relatórios personalizados',
  'Desenvolvimento de sistema interno',
  'Desenvolvimento de aplicativo mobile',
  'Desenvolvimento de plataforma web',
  'Desenvolvimento de API',
  'Desenvolvimento de integrações',
  'Customização de funcionalidades',
  'Ajustes em regras de negócio',
  'Configuração de workflows',
  'Solicitação de treinamento',
  'Solicitação de suporte remoto',
  'Solicitação de acesso administrativo',
  'Migração de dados',
  'Importação de planilhas',
  'Correção de sincronização',
  'Problema com autenticação JWT',
  'Problema com tokens de acesso',
  'Erro em permissões ACL',
  'Problema em logs do sistema',
  'Auditoria de segurança',
  'Análise de vulnerabilidades',
  'Correção de falhas críticas',
  'Monitoramento de infraestrutura',
  'Configuração AWS',
  'Problema em hospedagem cloud',
  'Erro em containers Docker',
  'Problema em deploy automático',
  'Falha em CI/CD',
  'Atualização de dependências',
  'Refatoração de código',
  'Melhoria de experiência do usuário',
  'Solicitação de redesign',
  'Ajustes em identidade visual',
  'Criação de documentação técnica',
  'Análise de desempenho do sistema',
  'Planejamento de novas funcionalidades',
  'Consultoria técnica',
  'Análise de viabilidade técnica',
  'Implantação de sistema',
  'Homologação de funcionalidades',
  'Testes automatizados',
  'Testes de carga',
  'Correção de ambiente de produção',
  'Problema em ambiente de homologação',
  'Suporte emergencial',
  'Chamado prioritário crítico',
  'Chamado de média prioridade',
  'Chamado de baixa prioridade',
  'Solicitação de manutenção preventiva',
  'Solicitação de manutenção corretiva',
  'Solicitação de suporte contínuo',
  'Gestão de chamados técnicos',
  'Acompanhamento de SLA',
  'Análise de incidentes',
  'Controle de tarefas técnicas',
  'Gestão de desenvolvimento ágil'
],

     quickActions: [
  { title: 'Abrir chamado', icon: 'bug_report', to: '/dashboard' },

  { title: 'Listas', icon: 'list', to: '/fonte-publica' },
  { title: 'Excluídos', icon: 'delete', to: '/dados' },
  { title: 'Meu projeto', icon: 'person', to: '/dependencia-agricultura' },
  { title: 'Dashboards', icon: 'dashboard', to: '/cumprimento-pnae' },
  { title: 'Status dos serviços', icon: 'gavel', to: '/ods2-fome-zero' },
]
    }
  },

  computed: {
  filteredSuggestions () {
  if (!this.search) return []

  return this.suggestions.filter(item =>
    item.toLowerCase().includes(this.search.toLowerCase())
  )
}
  },

  methods: {
   selectSuggestion (item) {
  this.search = item
  this.showSuggestions = false

  this.$router.push({
    path: '/pesquisa',
    query: { q: item }
  })
},
    hideSuggestions () {
      setTimeout(() => {
        this.showSuggestions = false
      }, 150)
    }
  }
}
</script>

<style scoped>


/* HERO */
.hero {
  height: 420px;
  display: flex;
  align-items: center;
  justify-content: center;

  .title {
  font-size: 32px;
  font-weight: 700;

  background: linear-gradient(135deg, #0011ff, #00d9ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
}

.hero-content {
  width: 100%;
  max-width: 700px;
  text-align: center;
  padding: 20px;
}

.title {
  font-size: 32px;
  font-weight: 700;
}

.subtitle {
  margin-top: 0px;
  font-size: 16px;
  opacity: 0.9;
}

/* SEARCH */
.search-box {
  margin-top: 30px;
  position: relative;
}

.search-input {
  font-size: 16px;
}

.suggestions {
  position: absolute;
  width: 100%;
  text-align: left;
  margin-top: 8px;
  border-radius: 12px;
  z-index: 10;
}

/* CARDS */
.quick-actions {
  max-width: 800px;
  margin: 0 auto;
}

.action-card {
  border-radius: 16px;
  transition: 0.25s;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0);
}

.action-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.034);
}
</style>
