import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    'pt-BR': {
        translation: {
            "settings": "Configurações",
            "appearance": "Aparência",
            "dark_mode": "Modo Escuro",
            "notifications": "Notificações",
            "alerts": "Alertas de Novos Tickets",
            "general": "Geral",
            "language": "Idioma do Sistema",
            "timezone": "Fuso Horário",
            "save": "Salvar Alterações",
            "cancel": "Cancelar",
            "success": "Configurações salvas com sucesso!",
            "date_format": "dd/MM/yyyy HH:mm",
            "menu": {
                "profile": "Meu Perfil",
                "settings": "Configurações",
                "logout": "Sair da Conta",
                "company": "Minha Empresa",
                "role": "Colaborador"
            },
            "sidebar": {
                "home": "Início",
                "support": "Atendimento",
                "overview": "Visão Geral",
                "new_ticket": "Novo Ticket",
                "my_tickets": "Meus Tickets",
                "inbox": "Caixa de Entrada",
                "sla_reports": "Relatórios SLA",
                "contacts": "Contatos",
                "all_contacts": "Todos os contatos",
                "groups": "Grupos",
                "broadcasts": "Disparos",
                "new_broadcast": "Novo disparo",
                "history": "Histórico",
                "knowledge": "Conhecimento",
                "articles": "Artigos & FAQ",
                "train_ai": "Treinar IA",
                "chatbot": "Chatbot",
                "flows": "Fluxos",
                "ai_config": "IA Config",
                "analytics": "Análises",
                "general_dash": "Dashboard Geral",
                "team_performance": "Performance Equipe",
                "tools": "Ferramentas",
                "channels": "Canais (WhatsApp)",
                "privacy": "Privacidade (LGPD)",
                "api": "Webhooks / API"
            },
            "header": {
                "notifications": "Notificações",
                "mark_all_read": "Marcar todas como lidas",
                "no_notifications": "Nenhuma notificação nova",
                "help": "Central de Ajuda",
                "docs": "Documentação",
                "support": "Falar com Suporte",
                "shortcuts": "Atalhos de Teclado",
                "version": "Versão 1.2.0"
            },
            // === NOVO BLOCO TICKET (Para o formulário funcionar) ===
            "ticket": {
                "new_title": "Abrir Solicitação",
                "new_subtitle": "Preencha os detalhes abaixo para agilizar seu atendimento.",
                "type_label": "Departamento",
                "tech_support": "Suporte Técnico",
                "tech_desc": "Problemas, Bugs e Acessos",
                "commercial": "Comercial",
                "commercial_desc": "Financeiro, Planos e Contratos",
                "category": "Categoria",
                "subcategory": "Detalhe do Assunto",
                "priority": "Nível de Urgência",
                "subject": "Assunto Principal",
                "description": "Descrição Detalhada",
                "upload_text": "Clique para fazer upload ou arraste arquivos",
                "cancel": "Cancelar",
                "create": "Criar Ticket",
                "sending": "Enviando...",
                "select_option": "Selecione...",
                "priority_low": "Baixa",
                "priority_medium": "Média",
                "priority_high": "Alta"
            }
        }
    },
    'en-US': {
        translation: {
            "settings": "Settings",
            "appearance": "Appearance",
            "dark_mode": "Dark Mode",
            "notifications": "Notifications",
            "alerts": "New Ticket Alerts",
            "general": "General",
            "language": "System Language",
            "timezone": "Timezone",
            "save": "Save Changes",
            "cancel": "Cancel",
            "success": "Settings saved successfully!",
            "date_format": "MM/dd/yyyy h:mm aa",
            "menu": {
                "profile": "My Profile",
                "settings": "Settings",
                "logout": "Logout",
                "company": "My Company",
                "role": "Collaborator"
            },
            "sidebar": {
                "home": "Home",
                "support": "Support",
                "overview": "Overview",
                "new_ticket": "New Ticket",
                "my_tickets": "My Tickets",
                "inbox": "Inbox",
                "sla_reports": "SLA Reports",
                "contacts": "Contacts",
                "all_contacts": "All Contacts",
                "groups": "Groups",
                "broadcasts": "Broadcasts",
                "new_broadcast": "New Broadcast",
                "history": "History",
                "knowledge": "Knowledge Base",
                "articles": "Articles & FAQ",
                "train_ai": "Train AI",
                "chatbot": "Chatbot",
                "flows": "Flows",
                "ai_config": "AI Config",
                "analytics": "Analytics",
                "general_dash": "General Dashboard",
                "team_performance": "Team Performance",
                "tools": "Tools",
                "channels": "Channels (WhatsApp)",
                "privacy": "Privacy (GDPR)",
                "api": "Webhooks / API"
            },
            "header": {
                "notifications": "Notifications",
                "mark_all_read": "Mark all as read",
                "no_notifications": "No new notifications",
                "help": "Help Center",
                "docs": "Documentation",
                "support": "Contact Support",
                "shortcuts": "Keyboard Shortcuts",
                "version": "Version 1.2.0"
            },
            // === NEW TICKET BLOCK ===
            "ticket": {
                "new_title": "Open Ticket",
                "new_subtitle": "Fill in the details below to speed up your service.",
                "type_label": "Department",
                "tech_support": "Technical Support",
                "tech_desc": "Issues, Bugs and Access",
                "commercial": "Commercial",
                "commercial_desc": "Financial, Plans and Contracts",
                "category": "Category",
                "subcategory": "Subject Detail",
                "priority": "Urgency Level",
                "subject": "Main Subject",
                "description": "Detailed Description",
                "upload_text": "Click to upload or drag files",
                "cancel": "Cancel",
                "create": "Create Ticket",
                "sending": "Sending...",
                "select_option": "Select...",
                "priority_low": "Low",
                "priority_medium": "Medium",
                "priority_high": "High"
            }
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: localStorage.getItem('ssd_language') || 'pt-BR',
        fallbackLng: 'pt-BR',
        interpolation: { escapeValue: false }
    });

export default i18n;