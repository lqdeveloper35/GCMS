
export interface CustomerData {
    companyName: string;
    contactName: string;
    phone: string;
    email: string;
    website: string;
    address: string;
    firstContactDate: string;
    freeConsultationDate: string;
    freeConsultationTime: string;
    secondMeetingDate: string;
    secondMeetingTime: string;
    contractStartDate: string;
    contractLength: string;
    status: string;
    lastContact: string;
    notes: string;
}

export interface SchedulePost {
    week: number;
    publicationDate: string;
    dayOfWeek: string;
    title: string;
    description: string;
    tags: string;
    captions: string;
    postType: string;
    topic: string;
    creativeSuggestion: string;
}

export enum PostTone {
    FORMAL = "Formal",
    INFORMATIVO = "Informativo",
    DIVERTIDO = "Divertido",
    INSPIRADOR = "Inspirador",
    PROMOCIONAL = "Promocional",
    EDUCACIONAL = "Educacional",
    ENGAJADOR = "Engajador",
}

export enum CustomerStatus {
    NOVO_CLIENTE = "Novo Cliente",
    EM_ANDAMENTO = "Em Andamento",
    AGUARDANDO_CONTATO = "Aguardando Contato",
    PERDIDO = "Perdido",
    REUNIAO_AGENDADA = "Reunião Agendada",
    CONSULTORIA_AGENDADA = "Consultoria Gratuita Agendada",
    SEGUNDA_REUNIAO_AGENDADA = "Segunda Reunião Agendada",
    CONTRATO_ASSINADO = "Contrato Assinado",
}

export enum PostType {
    FEED = "Feed",
    STORY = "Story",
    REEL = "Reel",
    CARROSSEL = "Carrossel",
    CAPA = "Capa",
    PERFIL = "Perfil",
}

export enum AspectRatio {
    SQUARE = "1:1",
    PORTRAIT_4_5 = "4:5",
    PORTRAIT_9_16 = "9:16",
    LANDSCAPE_16_9 = "16:9",
    LANDSCAPE_3_2 = "3:2",
    PORTRAIT_2_3 = "2:3",
}
