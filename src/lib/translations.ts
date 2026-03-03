export type Lang = "en" | "pt-BR";

export const translations = {
  en: {
    // Nav
    "nav.contact": "Contact",
    "nav.myDashboard": "My Dashboard",
    "nav.openMenu": "Open menu",
    // Sidebar
    "sidebar.dashboard": "Dashboard",
    "sidebar.myCase": "My Case",
    "sidebar.documentation": "Documentation",
    "sidebar.support": "Support",
    "sidebar.profile": "Profile",
    "sidebar.settings": "Settings",
    "sidebar.evidence": "Evidence",
    "sidebar.documentsToGather": "Gather Docs",
    "sidebar.interviewPrep": "Interview",
    "sidebar.forms": "I-485 Forms",
    "sidebar.aiAssistant": "AI Assistant",
    "sidebar.adminPanel": "Admin Panel",
    // Dashboard
    "dashboard.hello": "Hello",
    "dashboard.subtitle": "Track your documentation progress below.",
    "dashboard.overallProgress": "Overall Progress",
    "dashboard.stepsCompleted": "steps completed",
    "dashboard.of": "of",
    "dashboard.completed": "Completed",
    "dashboard.inProgress": "In Progress",
    "dashboard.pending": "Pending",
    "dashboard.stepBreakdown": "Step Breakdown",
    // Step statuses
    "step.completed": "Completed",
    "step.inProgress": "In Progress",
    "step.priority": "Priority",
    "step.label": "Step",
    // Panel layout
    "panel.myCase": "My Case",
    "panel.docFlow": "Documentation Flow",
    "panel.completeSteps": "Complete each step to prepare your filing packet.",
    "panel.progress": "Progress",
    // Review page
    "review.step": "Step 6 of 6",
    "review.title": "Final Review",
    "review.subtitle": "Review your information and go back to previous steps if needed.",
    "review.noInfo": "No information saved yet.",
    "review.done": "Review complete. Use the admin panel to monitor and move the case forward.",
    // Support page
    "support.title": "Support Guide",
    "support.subtitle": "Educational and general content. Forms, fees, and policies change frequently. Always confirm at USCIS before filing.",
    "support.nextSteps": "Next Steps (4 Weeks)",
    "support.week12": "Week 1–2",
    "support.week23": "Week 2–3",
    "support.week34": "Week 3–4",
    // Case Progress Topbar
    "topbar.caseHealth": "Case Progress",
    "topbar.i485": "I-485",
    "topbar.i130": "I-130",
    "topbar.uploadEvidence": "Upload Evidence",
    "topbar.aiAssistant": "AI Assistant",
    // Language switcher
    "lang.switch": "PT-BR",
  },
  "pt-BR": {
    // Nav
    "nav.contact": "Contato",
    "nav.myDashboard": "Meu Painel",
    "nav.openMenu": "Abrir menu",
    // Sidebar
    "sidebar.dashboard": "Painel",
    "sidebar.myCase": "Meu Processo",
    "sidebar.documentation": "Documentação",
    "sidebar.support": "Guia",
    "sidebar.profile": "Perfil",
    "sidebar.settings": "Configurações",
    "sidebar.evidence": "Evidências",
    "sidebar.documentsToGather": "Coletar Docs",
    "sidebar.interviewPrep": "Entrevista",
    "sidebar.forms": "Formulário I-485",
    "sidebar.aiAssistant": "Assistente IA",
    "sidebar.adminPanel": "Painel Administrativo",
    // Dashboard
    "dashboard.hello": "Olá",
    "dashboard.subtitle": "Acompanhe o progresso da sua documentação abaixo.",
    "dashboard.overallProgress": "Progresso Geral",
    "dashboard.stepsCompleted": "etapas concluídas",
    "dashboard.of": "de",
    "dashboard.completed": "Concluídas",
    "dashboard.inProgress": "Em Andamento",
    "dashboard.pending": "Pendentes",
    "dashboard.stepBreakdown": "Detalhamento por Etapa",
    // Step statuses
    "step.completed": "Concluída",
    "step.inProgress": "Em andamento",
    "step.priority": "Prioritária",
    "step.label": "Etapa",
    // Panel layout
    "panel.myCase": "Meu Processo",
    "panel.docFlow": "Fluxo de Documentação",
    "panel.completeSteps": "Complete cada etapa para preparar seu pacote de documentos.",
    "panel.progress": "Progresso",
    // Review page
    "review.step": "Etapa 6 de 6",
    "review.title": "Revisão Final",
    "review.subtitle": "Revise as informações e, se necessário, volte às etapas anteriores para ajustes.",
    "review.noInfo": "Nenhuma informação registrada.",
    "review.done": "Revisão concluída. Use o painel admin para acompanhamento e próximos passos operacionais.",
    // Support page
    "support.title": "Guia",
    "support.subtitle": "Conteúdo educacional e genérico. Formulários, taxas e políticas mudam com frequência. Sempre confirme no USCIS antes de protocolar.",
    "support.nextSteps": "Próximos Passos (4 Semanas)",
    "support.week12": "Semana 1-2",
    "support.week23": "Semana 2-3",
    "support.week34": "Semana 3-4",
    // Case Progress Topbar
    "topbar.caseHealth": "Progresso do Caso",
    "topbar.i485": "I-485",
    "topbar.i130": "I-130",
    "topbar.uploadEvidence": "Enviar Evidência",
    "topbar.aiAssistant": "Assistente IA",
    // Language switcher
    "lang.switch": "EN",
  },
} as const;

export type TranslationKey = keyof typeof translations["en"];

export function t(key: TranslationKey, lang: Lang = "en"): string {
  const dict = translations[lang] as Record<string, string>;
  return dict[key] ?? (translations["en"] as Record<string, string>)[key] ?? key;
}
