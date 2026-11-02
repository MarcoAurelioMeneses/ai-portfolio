/**
 * Single source of truth for the portfolio.
 * UI components, the chat system prompt, and the future RAG index all read this file.
 * Visible strings are Brazilian Portuguese and follow the design mockups.
 */

export type FeatureTheme = "light" | "dark" | "both";

export type StackItem = {
  name: string;
  /** Which theme draws the green emphasis. The mockups highlight different chips. */
  featured: FeatureTheme | null;
};

export type CaseStudy = {
  id: string;
  client: string;
  title: string;
  context: string;
  solution: string;
  stack: string;
  result: string;
};

export type ExperienceItem = {
  id: string;
  period: string;
  role: string;
  company: string;
  current: boolean;
};

export const site = {
  name: "Marco Aurélio",
  locale: "pt-BR",
  year: 2026,
  tagline: {
    lead: "Desenvolvo soluções com ",
    accent: "IA",
    tail: " que viram resultado.",
  },
  nav: [
    { id: "cases", href: "/#cases", label: "Cases" },
    { id: "stack", href: "/#stack", label: "Stack" },
    { id: "contato", href: "/#contato", label: "Contato" },
  ],
  hero: {
    agentCta: { label: "Pergunte ao meu agente" },
    placeholder: "Pergunte sobre meus projetos, stack ou experiência…",
    primaryCta: { id: "ver_cases", href: "/#cases", label: "Ver cases" },
    secondaryCta: { id: "contato", href: "/#contato", label: "Contato" },
  },
  about: {
    id: "sobre",
    label: "Sobre",
    title: "Desenvolvedor de Soluções com IA",
    bio: "25 anos, São Paulo. Tecnólogo em Jogos Digitais e Pós em AI Engineering (Impacta). 3 anos especializado em IA.",
    facts: ["25 anos", "São Paulo", "3 anos em IA"],
  },
  casesSection: {
    id: "cases",
    title: "Cases",
  },
  caseFields: {
    context: "Contexto",
    solution: "Solução",
    stack: "Stack",
    result: "Resultado",
  },
  // TODO(marco): context, solution, and stack are placeholders pending review.
  // Result lines keep only the agreed figures. Do not add extra percentages.
  cases: [
    {
      id: "ia-para-o-juridico",
      client: "Construtora de grande porte",
      title: "Plataforma de IA para o jurídico",
      context: "Minutas contratuais lentas e manuais",
      solution: "IA com RAG que gera as minutas",
      stack: "Python · LangChain · RAG · ChromaDB",
      result: "11 → 2 dias · -80% custo anual",
    },
    {
      id: "automacao-contas-a-pagar",
      client: "Construtora de grande porte",
      title: "Automação inteligente de contas a pagar",
      context: "Esteira de pagamentos lenta e manual",
      solution: "Fluxos automatizados com IA",
      stack: "Python · LangChain · RAG",
      result: "10 → 6 dias",
    },
    {
      id: "hub-multi-llm",
      client: "Consultoria de IA",
      title: "Hub multi-LLM para PMEs",
      context: "Cada cliente usava modelos isolados",
      solution: "Hub único para vários LLMs",
      stack: "Python · LLMs",
      result: "Acesso unificado aos modelos",
    },
    {
      id: "assistente-de-leitura",
      client: "Instituição educacional sem fins lucrativos",
      title: "Assistente de leitura com IA",
      context: "Atendimento manual aos grupos de leitura",
      solution: "Chatbot com IA para os leitores",
      stack: "Python · LLMs",
      result: "Atendimento automatizado",
    },
  ] satisfies CaseStudy[],
  experienceSection: {
    id: "experiencia",
    title: "Experiência",
  },
  experience: [
    {
      id: "construtora",
      period: "abr/2025 – atual",
      role: "Analista de Sistemas Pleno",
      company: "Construtora de grande porte",
      current: true,
    },
    {
      id: "consultoria",
      period: "set/2024 – abr/2025",
      role: "Engenheiro de Prompt",
      company: "Consultoria de IA",
      current: false,
    },
    {
      id: "instituicao",
      period: "nov/2021 – set/2024",
      role: "Desenvolvedor de Software e TI",
      company: "Instituição educacional sem fins lucrativos",
      current: false,
    },
  ] satisfies ExperienceItem[],
  stackSection: {
    id: "stack",
    title: "Stack",
  },
  stack: [
    { name: "Python", featured: null },
    { name: "Node.js", featured: null },
    { name: "LangChain", featured: "both" },
    { name: "RAG", featured: "both" },
    { name: "ChromaDB", featured: "dark" },
    { name: "Supabase", featured: null },
    { name: "Streamlit", featured: null },
    { name: "Lovable", featured: null },
    { name: "n8n", featured: null },
    { name: "Make", featured: null },
    { name: "GCP", featured: null },
    { name: "AWS", featured: null },
    { name: "C#", featured: "light" },
  ] satisfies StackItem[],
  contact: {
    id: "contato",
    title: "Vamos conversar?",
    email: "marco.ameneses13@gmail.com",
    links: [
      {
        id: "linkedin",
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/marco-aurélio-santos-de-meneses-666436162",
      },
      {
        id: "github",
        label: "GitHub",
        // No public GitHub profile could be verified. Replace before launch.
        href: "https://github.com/marcoameneses",
      },
    ],
    copyright: "© 2026 Marco Aurélio",
    form: {
      name: "Nome",
      email: "E-mail",
      subject: "Assunto",
      optional: "opcional",
      message: "Mensagem",
      submit: "Enviar mensagem",
      sending: "Enviando…",
      successTag: "Sucesso",
      successTitle: "Mensagem enviada",
      successBody: "Obrigado pelo contato. Respondo em breve.",
      another: "Enviar outra mensagem",
      errorTag: "Erro",
      honeypot: "Site",
      placeholders: {
        name: "Digite seu nome",
        email: "Digite seu e-mail",
        subject: "Digite o assunto",
        message: "Escreva sua mensagem...",
        messageDark: "Digite sua mensagem",
      },
      errors: {
        invalid: "Confira os campos e tente de novo.",
        name: "Informe seu nome.",
        email: "Informe um e-mail válido.",
        message: "Escreva uma mensagem um pouco mais longa.",
        banner: "Não foi possível enviar. Tente novamente.",
        unconfigured: "O formulário ainda não está configurado. Escreva para o e-mail acima.",
        rateLimited: "Você já enviou várias mensagens hoje. Tente amanhã ou use o e-mail acima.",
        generic: "Não foi possível enviar agora. Tente de novo ou escreva para o e-mail acima.",
      },
    },
  },
  chat: {
    fabLabel: "Abrir conversa com o agente",
    closeLabel: "Fechar conversa",
    title: "Pergunte ao meu agente",
    tag: "Agente",
    placeholder: "Escreva sua pergunta",
    sendLabel: "Enviar",
    inputLabel: "Mensagem para o agente",
    empty:
      "Posso falar dos projetos, da trajetória e de como entrar em contato.",
    suggestions: [
      "Quais cases você entregou?",
      "Como entro em contato?",
      "Qual é a sua stack?",
    ],
    typing: "Escrevendo",
    errors: {
      unconfigured:
        "O agente ainda não está configurado. Defina OPENAI_API_KEY para conversar.",
      rateLimited:
        "Você atingiu o limite de mensagens de hoje. Volte amanhã.",
      invalid: "Não consegui ler essa mensagem. Tente reformular.",
      generic: "Não consegui responder agora. Tente de novo em instantes.",
    },
  },
} as const;

export type SiteContent = typeof site;

export const sectionIds = [
  site.about.id,
  site.casesSection.id,
  site.experienceSection.id,
  site.stackSection.id,
  site.contact.id,
] as const;

export type SectionId = (typeof sectionIds)[number];
