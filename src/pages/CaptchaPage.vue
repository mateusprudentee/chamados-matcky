<template>
  <q-page class="flex flex-center ">

    <q-card :class="showSummary ? 'captcha-card-mestrado q-pa-xl' : 'captcha-card q-pa-xl'" style="padding: 0.5em">

      <!-- Seção do Resumo (visível inicialmente) -->
      <div v-if="showSummary" class="summary-section">
        <div class="text-center q-mb-md" style="margin-top: -5px;">
          <q-icon name="school" size="56px" color="orange" />
        </div>

        <div class="text-h6 text-weight-bold text-center text-orange q-mb-lg">
          ODS na agricultura familiar de Mato Grosso
        </div>

        <q-separator class="q-mb-lg" />

        <div class="summary-text q-mb-lg">
          <p class="text-body1 text-grey-8">
            Este trabalho investiga o papel estratégico da agricultura familiar no estado de Mato Grosso como motor para o cumprimento do Objetivo de Desenvolvimento Sustentável 2 (ODS 2) da Agenda 2030 da ONU, que visa erradicar a fome e promover a agricultura sustentável.
          </p>

          <p class="text-body1 text-grey-8">
            A pesquisa concentra-se na análise das ações desenvolvidas pelas secretarias municipais de agricultura e desenvolvimento econômico em polos fundamentais do estado, como Sinop, Cuiabá, Sorriso e Rondonópolis.
          </p>

          <p class="text-body1 text-grey-8">
            Através do levantamento de projetos locais e da integração com diretrizes estaduais, como o programa "MT Produtivo" e o uso do Fundo de Apoio à Agricultura Familiar (Fundaaf), o estudo identifica como as políticas públicas têm sido aplicadas para aumentar a produtividade e a resiliência dos pequenos produtores.
          </p>

          <p class="text-body1 text-grey-8">
            A investigação destaca que, enquanto o agronegócio de larga escala domina a balança comercial, a agricultura familiar é o alicerce da segurança alimentar interna e da manutenção da biodiversidade regional.
          </p>

          <p class="text-body1 text-grey-8">
            Os resultados preliminares apontam que o sucesso da ODS 2 em território mato-grossense depende da eficiência da assistência técnica, da modernização tecnológica das propriedades e da capacidade de escoamento da produção para os mercados locais.
          </p>

          <p class="text-body1 text-grey-8">
            Conclui-se que o fortalecimento institucional das secretarias municipais e a integração acadêmica são caminhos essenciais para transformar o potencial produtivo da agricultura familiar em desenvolvimento socioeconômico sustentável, garantindo a permanência do produtor no campo com dignidade e segurança alimentar para a população.
          </p>
        </div>

        <!-- Blocos Informativos -->
        <q-separator class="q-mb-lg" />

        <div class="text-subtitle1 text-weight-bold text-orange q-mb-md">
          Destaques da Pesquisa
        </div>

        <div class="row q-col-gutter-md q-mb-lg">
          <div class="col-12 col-md-6">
            <q-card flat bordered class="info-card bg-orange-1">
              <q-card-section>
                <div class="row items-center q-mb-sm">
                  <q-icon name="map" color="orange" size="24px" class="q-mr-sm" />
                  <div class="text-subtitle2 text-weight-bold">Municípios Analisados</div>
                </div>
                <div class="text-body2 text-grey-8">
                  Sinop, Cuiabá, Sorriso e Rondonópolis - polos estratégicos do agronegócio e agricultura familiar
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-6">
            <q-card flat bordered class="info-card bg-orange-1">
              <q-card-section>
                <div class="row items-center q-mb-sm">
                  <q-icon name="policy" color="orange" size="24px" class="q-mr-sm" />
                  <div class="text-subtitle2 text-weight-bold">Programas Analisados</div>
                </div>
                <div class="text-body2 text-grey-8">
                  MT Produtivo e Fundaaf - principais instrumentos de fomento à agricultura familiar
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-6">
            <q-card flat bordered class="info-card bg-orange-1">
              <q-card-section>
                <div class="row items-center q-mb-sm">
                  <q-icon name="trending_up" color="orange" size="24px" class="q-mr-sm" />
                  <div class="text-subtitle2 text-weight-bold">Foco Principal</div>
                </div>
                <div class="text-body2 text-grey-8">
                  Aumento da produtividade e resiliência dos pequenos produtores rurais
                </div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-md-6">
            <q-card flat bordered class="info-card bg-orange-1">
              <q-card-section>
                <div class="row items-center q-mb-sm">
                  <q-icon name="eco" color="orange" size="24px" class="q-mr-sm" />
                  <div class="text-subtitle2 text-weight-bold">Objetivo Final</div>
                </div>
                <div class="text-body2 text-grey-8">
                  Segurança alimentar e permanência digna do produtor no campo
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- Palavras-chave -->
        <q-separator class="q-mb-lg" />

        <div class="keywords-section bg-orange-1 q-pa-md rounded-borders q-mb-lg">
          <div class="text-subtitle2 text-weight-bold text-orange q-mb-sm">
            Palavras-chave
          </div>
          <div class="row q-gutter-sm">
            <q-badge color="orange" label="Agricultura Familiar" />
            <q-badge color="orange" label="ODS 2" />
            <q-badge color="orange" label="Mato Grosso" />
            <q-badge color="orange" label="Políticas Públicas" />
            <q-badge color="orange" label="Desenvolvimento Sustentável" />
          </div>
        </div>

        <!-- Seção de Perguntas Frequentes -->
        <q-separator class="q-mb-lg" />

        <div class="text-subtitle1 text-weight-bold text-orange q-mb-md">
          Perguntas Frequentes sobre a Pesquisa
        </div>

        <q-list bordered separator class="rounded-borders q-mb-lg">
          <q-expansion-item
            v-for="(faq, index) in faqs"
            :key="index"
            group="faq"
            expand-separator
            :label="faq.question"
            header-class="text-weight-medium"
            default-closed
          >
            <q-card>
              <q-card-section class="bg-grey-1">
                <p class="text-body2 text-grey-8 q-ma-none">{{ faq.answer }}</p>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-list>

        <div class="text-center q-mt-xl">
          <q-btn
            color="orange"
            label="Acessar"
            icon="lock"
            size="md"
            @click="showSummary = false"
          />
        </div>
      </div>

      <!-- Seção do Captcha (oculta inicialmente) -->
      <div v-else>
        <div class="text-center q-mb-md">
          <q-icon name="school" size="56px" color="primary" />
        </div>

        <div class="text-h6 text-weight-bold text-center">
          Acesso Restrito
        </div>

        <div class="text-subtitle2 text-grey-7 text-center q-mt-sm q-mb-md">
          Você está vendo um sistema de pesquisa para o mestrado desenvolvido por Mateus Prudente.
        </div>

        <!-- Aviso de segurança -->
        <q-banner class="bg-grey-3 text-grey-9 q-mb-lg" rounded>
          Este conteúdo é restrito e requer verificação de acesso.
          Insira a senha abaixo para acessar todo conteúdo do portal.
        </q-banner>

        <!-- INPUT REAL PARA AUTOFILL DO NAVEGADOR -->
        <input
          v-model="hiddenPassword"
          type="password"
          autocomplete="current-password"
          style="position:absolute; opacity:0; height:0; width:0;"
        />

        <!-- DIGITS VISUAIS -->
        <div class="row justify-center q-gutter-sm q-mb-lg">
          <q-input
            v-for="(digit, index) in digits"
            :key="index"
            v-model="digits[index]"
            maxlength="1"
            outlined
            dense
            input-class="text-center text-h6"
            class="digit-input"
            @update:model-value="onInput"
            @keyup="focusNext(index, $event)"
          />
        </div>

        <div class="text-caption text-grey-6 text-center">
          Chave de acesso temporário
        </div>

        <div class="text-center q-mt-lg">
          <q-btn
            flat
            color="grey"
            label="Voltar ao resumo"
            icon="arrow_back"
            size="sm"
            @click="showSummary = true"
          />
        </div>
      </div>

    </q-card>

  </q-page>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()

const digits = ref(['', '', '', '', '', ''])
const hiddenPassword = ref('')
const showSummary = ref(true)
const SECRET = '012698'

let typingTimer = null

// Perguntas frequentes
const faqs = ref([
  {
    question: '1. Qual o principal objetivo desta pesquisa?',
    answer: 'Investigar o papel estratégico da agricultura familiar em Mato Grosso para o cumprimento do ODS 2 da ONU, analisando políticas públicas e sua efetividade nos principais polos agrícolas do estado.'
  },
  {
    question: '2. Por que Mato Grosso foi escolhido como foco do estudo?',
    answer: 'Mato Grosso é um dos maiores produtores agrícolas do Brasil, mas apresenta um contraste entre o agronegócio de larga escala e a agricultura familiar, tornando-se um caso único para estudar a implementação dos ODS.'
  },
  {
    question: '3. Quais municípios fazem parte da análise?',
    answer: 'A pesquisa concentra-se em quatro polos fundamentais: Sinop (norte), Cuiabá (capital e centro-sul), Sorriso (maior produtor de soja) e Rondonópolis (importante entroncamento logístico).'
  },
  {
    question: '4. O que é o programa MT Produtivo?',
    answer: 'É um programa do governo estadual que oferece assistência técnica, capacitação e incentivos para aumentar a produtividade da agricultura familiar, promovendo tecnologias adaptadas à realidade dos pequenos produtores.'
  },
  {
    question: '5. Como o Fundaaf contribui para a agricultura familiar?',
    answer: 'O Fundo de Apoio à Agricultura Familiar (Fundaaf) financia projetos de infraestrutura, aquisição de equipamentos e melhoria das condições de produção, sendo um instrumento crucial para a política agrícola estadual.'
  },
  {
    question: '6. Qual a relação entre agricultura familiar e segurança alimentar?',
    answer: 'A agricultura familiar é responsável por grande parte dos alimentos consumidos internamente, sendo o alicerce da segurança alimentar. Enquanto o agronegócio foca em exportação, a agricultura familiar abastece mercados locais e regionais.'
  },
  {
    question: '7. Quais os principais desafios identificados na pesquisa?',
    answer: 'Os principais desafios incluem: deficiência na assistência técnica continuada, dificuldade de acesso a tecnologias modernas, problemas de escoamento da produção e necessidade de fortalecimento institucional das secretarias municipais.'
  },
  {
    question: '8. Como a pesquisa se relaciona com a Agenda 2030 da ONU?',
    answer: 'A pesquisa está alinhada diretamente com o ODS 2 (Fome Zero e Agricultura Sustentável), mas também contribui para outros objetivos como ODS 1 (Erradicação da Pobreza), ODS 8 (Trabalho Decente) e ODS 12 (Consumo e Produção Responsáveis).'
  },
  {
    question: '9. Quais os resultados preliminares mais relevantes?',
    answer: 'Os resultados apontam que o sucesso da ODS 2 depende de três fatores principais: eficiência da assistência técnica, modernização tecnológica adaptada à realidade local e capacidade de escoamento para mercados próximos.'
  },
  {
    question: '10. Qual a importância da integração acadêmica neste contexto?',
    answer: 'A integração acadêmica é fundamental para transformar conhecimento científico em políticas públicas efetivas, criando pontes entre universidades, gestores públicos e produtores rurais para promover desenvolvimento sustentável.'
  }
])

// =====================
// AUTOFILL WATCH (CORRIGIDO)
// =====================
watch(hiddenPassword, (val) => {
  if (!val) return

  const chars = val.slice(0, 6).split('')

  digits.value = ['','','','','','']

  chars.forEach((c, i) => {
    digits.value[i] = c
  })

  triggerVerify()
})


// =====================
// INPUT CONTROL (DEBOUNCE)
// =====================
const onInput = () => {
  clearTimeout(typingTimer)

  typingTimer = setTimeout(() => {
    triggerVerify()
  }, 120) // pequeno delay evita duplicação e autofill bug
}


// =====================
// VERIFY (ROBUSTO)
// =====================
const triggerVerify = () => {
  const value = digits.value.join('')

  if (value.length !== 6) return

  if (value !== SECRET) {
    $q.notify({
      type: 'negative',
      message: 'Código incorreto'
    })

    digits.value = ['','','','','','']
    hiddenPassword.value = ''
    return
  }

  // sucesso
  $q.notify({
    type: 'positive',
    message: 'Acesso liberado com sucesso!'
  })

  localStorage.setItem(
  'captcha_expire',
  String(Date.now() + 24 * 60 * 60 * 1000)
)

  // 🔥 IMPORTANTE: reload completo (faz navbar reaparecer corretamente)
  setTimeout(() => {
    router.push('/').then(() => {
      window.location.reload()
    })
  }, 300)
}


// =====================
// KEY NAVIGATION (CORRIGIDO)
// =====================
const focusNext = (index, event) => {
  const inputs = document.querySelectorAll('.digit-input input')

  if (event.key === 'Backspace') {
    if (inputs[index - 1]) inputs[index - 1].focus()
    return
  }

  if (digits.value[index] && inputs[index + 1]) {
    inputs[index + 1].focus()
  }
}
</script>

<style>
.q-drawer-container {
  display: none;
}

/* Card do captcha (compacto) */
.captcha-card {
  width: 100%;
  max-width: 450px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}

/* Card do mestrado (largo para o resumo) */
.captcha-card-mestrado {
  width: 100%;
  max-width: 750px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}

.digit-input {
  width: 42px;
}

.summary-section {
  padding: 20px;
}

.summary-text p {
  line-height: 1.6;
  margin-bottom: 16px;
}

.keywords-section {
  border-left: 4px solid orange;
}

.text-body1 {
  font-size: 0.95rem;
  line-height: 1.7;
}

.info-card {
  transition: all 0.3s ease;
  height: 100%;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* Estilização dos expansion items */
.q-expansion-item {
  border: none;
}

.q-expansion-item .q-item {
  padding: 12px 16px;
}
</style>
