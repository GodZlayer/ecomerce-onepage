// src/lib/siteConfig.ts
// Persistência de categorias/filtros no Firestore
// @ts-ignore
import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { OutputData } from '@editorjs/editorjs'; // Import OutputData

export interface CategoriaFiltro {
  categorias: string[];
  generos: string[];
  tamanhos: string[];
  cores: string[];
  regioes: string[];
  anos: number[];
}

const CONFIG_DOC = "siteConfig";

export async function getCategoriaFiltro(): Promise<CategoriaFiltro> {
  const ref = doc(db, CONFIG_DOC, "filtros");
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    // Valores padrão caso não exista
    return {
      categorias: ["Eletrônicos", "Roupas", "Casa", "Livros", "Esportes"],
      generos: ["masculino", "feminino"],
      tamanhos: ["P", "M", "G", "GG", "XGG", "EXG"],
      cores: ["Azul", "Branco", "Cinza", "Preto"],
      regioes: ["Sudeste", "Nordeste", "Sul", "Centro-oeste"],
      anos: Array.from({ length: 1997 - 1978 + 1 }, (_, i) => 1978 + i),
    };
  }
  return snap.data() as CategoriaFiltro;
}

export async function setCategoriaFiltro(data: CategoriaFiltro) {
  const ref = doc(db, CONFIG_DOC, "filtros");
  await setDoc(ref, data);
}

export interface FiltrosAtivosConfig {
  categoria: boolean;
  genero: boolean;
  tamanho: boolean;
  cor: boolean;
  regiao: boolean;
  ano: boolean;
}

export async function getFiltrosAtivosConfig(): Promise<FiltrosAtivosConfig> {
  const ref = doc(db, CONFIG_DOC, "filtrosAtivos");
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    // Todos ativos por padrão
    return {
      categoria: true,
      genero: true,
      tamanho: true,
      cor: true,
      regiao: true,
      ano: true,
    };
  }
  return snap.data() as FiltrosAtivosConfig;
}

export async function setFiltrosAtivosConfig(data: FiltrosAtivosConfig) {
  const ref = doc(db, CONFIG_DOC, "filtrosAtivos");
  await setDoc(ref, data);
}

export interface SiteContentConfig {
  logoText: string;
  logoImageUrl: string;
  logoMode: 'text' | 'image' | 'both';
  faviconUrl: string;
  siteTitle: string;
  logoImageSizePercent?: number; // Novo campo para tamanho da logo em %
}

export async function getSiteContentConfig(): Promise<SiteContentConfig> {
  const ref = doc(db, CONFIG_DOC, "content");
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return {
      logoText: "Meu Site",
      logoImageUrl: "",
      logoMode: "text",
      faviconUrl: "",
      siteTitle: "Minha Loja",
      logoImageSizePercent: 100, // valor padrão
    };
  }
  const data = snap.data() as SiteContentConfig;
  if (data.logoImageSizePercent === undefined) data.logoImageSizePercent = 100;
  return data;
}

export async function setSiteContentConfig(data: SiteContentConfig) {
  const ref = doc(db, CONFIG_DOC, "content");
  await setDoc(ref, data);
}

// --- Sections dinâmicas do site ---

export interface DailyOpeningHours {
  Segunda: { open: string; close: string };
  Terça: { open: string; close: string };
  Quarta: { open: string; close: string };
  Quinta: { open: string; close: string };
  Sexta: { open: string; close: string };
  Sábado: { open: string; close: string };
  Domingo: { open: string; close: string };
}

export interface SiteSectionsConfig {
  sectionsAtivas: {
    top: boolean;
    about: boolean;
    features: boolean;
    contact: boolean;
    footer: boolean;
  };
  top: {
    title: string;
    subtitle: string;
    imageUrl?: string;
    actionButton1?: { label: string; url: string };
    actionButton2?: { label: string; url: string };
  };
  about: {
    title: string;
    content: OutputData; // Change content type to OutputData
  };
  features: {
    title: string;
    subtitle: string;
    benefits: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  };
  contact: {
    title: string;
    email: string;
    phone: string;
    address: string;
    openingHours: DailyOpeningHours;
    showContactForm: boolean;
  };
  footer: {
    text: string;
    footerColumn1: {
      title: string;
      description: string;
    };
    footerColumn2: Array<{ label: string; url: string }>;
    footerColumn3: string;
  };
}

export async function getSiteSections(): Promise<SiteSectionsConfig> {
  const ref = doc(db, CONFIG_DOC, "sections");
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    // Conteúdo inicial padrão
    return {
      sectionsAtivas: {
        top: true,
        about: true,
        features: true,
        contact: true,
        footer: true,
      },
      top: {
        title: "Bem-vindo à Minha Loja",
        subtitle: "Os melhores produtos para você",
        imageUrl: "",
        actionButton1: { label: "Ver Produtos", url: "/produtos" },
        actionButton2: { label: "Contato", url: "/contato" },
      },
      about: {
        title: "Sobre Nós",
        content: { blocks: [{ type: "paragraph", data: { text: "Somos uma loja dedicada a oferecer os melhores produtos." } }] }, // Initialize with Editor.js format
      },
      features: {
        title: "Por que escolher a gente?",
        subtitle: "Benefícios de comprar conosco",
        benefits: [
          { icon: "shield", title: "Compra Protegida", description: "Seus dados protegidos com as melhores práticas de segurança" },
          { icon: "truck", title: "Entrega Rápida", description: "Receba seus produtos rapidamente em todo o Brasil" },
          { icon: "star", title: "Produtos Selecionados", description: "Só trabalhamos com produtos de alta qualidade" },
        ],
      },
      contact: {
        title: "Fale Conosco",
        email: "contato@minhaloja.com",
        phone: "(11) 99999-9999",
        address: "Rua Exemplo, 123, São Paulo - SP",
        openingHours: {
          Segunda: { open: "", close: "" },
          Terça: { open: "", close: "" },
          Quarta: { open: "", close: "" },
          Quinta: { open: "", close: "" },
          Sexta: { open: "", close: "" },
          Sábado: { open: "", close: "" },
          Domingo: { open: "", close: "" },
        },
        showContactForm: true,
      },
      footer: {
        text: "© 2025 Minha Loja. Todos os direitos reservados.",
        footerColumn1: {
          title: "E-Shop",
          description: "Sobre a loja: Somos referência em qualidade e atendimento.",
        },
        footerColumn2: [
          { label: "Início", url: "/" },
          { label: "Produtos", url: "/produtos" },
          { label: "Contato", url: "/contato" },
        ],
        footerColumn3: "Fale conosco: contato@minhaloja.com | (11) 99999-9999",
      },
    };
  }
  return snap.data() as SiteSectionsConfig;
}

export async function setSiteSections(data: SiteSectionsConfig) {
  const ref = doc(db, CONFIG_DOC, "sections");
  await setDoc(ref, data);
}
