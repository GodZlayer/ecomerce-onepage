import React, { useState, useEffect } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    CategoriaFiltro,
    getCategoriaFiltro,
    FiltrosAtivosConfig,
    getFiltrosAtivosConfig,
    SiteSectionsConfig, // Import SiteSectionsConfig
    getSiteSections, // Import getSiteSections
    setSiteSections, // Import setSiteSections
} from "@/lib/siteConfig";

// Import the extracted components
import AdminLogin from "@/components/admin/AdminLogin";
import AdminProductManagement from "@/components/admin/AdminProductManagement";
import AdminCategoryFilterManagement from "@/components/admin/AdminCategoryFilterManagement";
import AdminSiteContentForm from "@/components/admin/AdminSiteContentForm";
import AdminSiteSectionsForm from "@/components/admin/AdminSiteSectionsForm";

import AdminPaymentSection from '../components/admin/site-sections/AdminPaymentSection';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("produtos"); // State to track active tab
  // Keep state needed by child components here
  const [catFiltro, setCatFiltro] = useState<CategoriaFiltro | null>(null);
  const [loadingCatFiltro, setLoadingCatFiltro] = useState(true);
  const [filtrosAtivos, setFiltrosAtivos] = useState<FiltrosAtivosConfig | null>(null);
  const [loadingFiltrosAtivos, setLoadingFiltrosAtivos] = useState(true);

  // State for Site Sections
  const [sections, setSections] = useState<SiteSectionsConfig | null>(null);
  const [loadingSections, setLoadingSections] = useState(true);
  const [errorSections, setErrorSections] = useState("");
  const [successSections, setSuccessSections] = useState("");


  // Handle login
  const handleLogin = (data: { username: string; password: string }) => {
    // Use environment variables with fallbacks
    const adminLogin = import.meta.env.VITE_ADMIN_LOGIN || 'admin';
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'password';
    if (data.username === adminLogin && data.password === adminPassword) {
      setIsAuthenticated(true);
      // Consider storing auth state in localStorage/sessionStorage for persistence
      // localStorage.setItem('isAdminAuthenticated', 'true');
    } else {
      alert("Credenciais inválidas");
    }
  };

   // Example: Check auth state on mount from storage
   // useEffect(() => {
   //   const storedAuth = localStorage.getItem('isAdminAuthenticated');
   //   if (storedAuth === 'true') {
   //     setIsAuthenticated(true);
   //   }
   // }, []);


  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
     // Clear stored auth state if using storage
     // localStorage.removeItem('isAdminAuthenticated');
  };

  // Load category/filter data needed by child components
  useEffect(() => {
    setLoadingCatFiltro(true);
    getCategoriaFiltro().then((data) => {
      setCatFiltro(data);
    }).catch(error => {
        console.error("Failed to load CategoriaFiltro:", error);
        // Handle error appropriately, e.g., show a message to the user
    }).finally(() => {
        setLoadingCatFiltro(false);
    });
  }, []);

  useEffect(() => {
    setLoadingFiltrosAtivos(true);
    getFiltrosAtivosConfig().then((data) => {
      setFiltrosAtivos(data);
    }).catch(error => {
        console.error("Failed to load FiltrosAtivosConfig:", error);
         // Handle error appropriately
    }).finally(() => {
        setLoadingFiltrosAtivos(false);
    });
  }, []);

  // Load Site Sections data
  useEffect(() => {
    setLoadingSections(true);
    setErrorSections("");
    setSuccessSections("");
    getSiteSections().then((data) => {
      // Initialize with defaults and merge fetched data
      const safeSections: SiteSectionsConfig = {
        top: { title: "", subtitle: "", imageUrl: "", actionButton1: { label: "", url: "" }, actionButton2: { label: "", url: "" }, ...(data?.top || {}) },
        about: {
          title: data?.about?.title || "", // Use fetched title or default
          content: data?.about?.content || { time: Date.now(), blocks: [], version: "2.22.2" }, // Use fetched content or default
        },
        features: { title: "", subtitle: "", benefits: Array.isArray(data?.features?.benefits) ? data.features.benefits : [], ...(data?.features || {}) },
        contact: {
          title: "Fale Conosco",
          email: "contato@minasretro.com.br",
          phone: "(31) 99338-4343",
          address: "Rua Marechal Hermes, 611, Gutierrez Belo Horizonte/MG.",
          openingHours: { // Ensure only the 7 expected days are included
            Domingo: data?.contact?.openingHours?.Domingo || { open: "", close: "" },
            Segunda: data?.contact?.openingHours?.Segunda || { open: "", close: "" },
            Terça: data?.contact?.openingHours?.Terça || { open: "", close: "" },
            Quarta: data?.contact?.openingHours?.Quarta || { open: "", close: "" },
            Quinta: data?.contact?.openingHours?.Quinta || { open: "", close: "" },
            Sexta: data?.contact?.openingHours?.Sexta || { open: "", close: "" },
            Sábado: data?.contact?.openingHours?.Sábado || { open: "", close: "" },
          },
          showContactForm: data?.contact?.showContactForm ?? false, // Use fetched value or default to false
        },
        footer: { text: "", footerColumn1: { title: "", description: "" }, footerColumn2: Array.isArray(data?.footer?.footerColumn2) ? data.footer.footerColumn2 : [], footerColumn3: "", ...(data?.footer || {}) },
        sectionsAtivas: { top: true, about: true, features: true, contact: true, footer: true, payment: data?.sectionsAtivas?.payment ?? false, ...(data?.sectionsAtivas || {}) }, // Add payment here
        payment: { method: data?.payment?.method || 'paypal' }, // Add payment default
      };
      setSections(safeSections);
      setLoadingSections(false);
    }).catch((err) => {
      console.error("Error loading site sections:", err);
      setErrorSections("Erro ao carregar sections do site.");
      setLoadingSections(false);
    });
  }, []);


  // Handle changes in sections config
  const handleChange = (section: string, field: string | (string | number)[], value: any) => {
    if (!sections) return;

    setSections(prevSections => {
      if (!prevSections) return null;

      const sectionKey = section as keyof SiteSectionsConfig;

      // Helper function for deep updates
      const updateNested = (obj: any, path: (string | number)[], val: any): any => {
        const [head, ...rest] = path;
        if (!head) return val;
        return {
          ...obj,
          [head]: rest.length ? updateNested(obj[head], rest, val) : val,
        };
      };

      const updatedSection = Array.isArray(field)
        ? updateNested(prevSections[sectionKey], field, value)
        : { ...prevSections[sectionKey], [field]: value };

      return {
        ...prevSections,
        [sectionKey]: updatedSection,
      };
    });
  };

  // Handle section active toggle
  const handleToggle = (section: keyof SiteSectionsConfig['sectionsAtivas']) => {
    if (!sections) return;
    setSections(prevSections => {
      if (!prevSections) return null;
      return {
        ...prevSections,
        sectionsAtivas: {
          ...prevSections.sectionsAtivas,
          [section]: !prevSections.sectionsAtivas[section],
        },
      };
    });
  };

  // Handle saving sections config
  const handleSaveSections = async () => {
    setLoadingSections(true);
    setErrorSections("");
    setSuccessSections("");
    try {
      if (sections) {
        await setSiteSections(sections);
        if (activeTab === 'pagamentos') {
          setSuccessSections("Meio de checkout salvo com sucesso!");
        } else {
          setSuccessSections("Sections salvas com sucesso!");
        }
      } else {
        throw new Error("Sections data is null, cannot save.");
      }

    } catch (err) {
      console.error("Error saving sections:", err);
      setErrorSections("Erro ao salvar sections.");
    } finally {
        setLoadingSections(false);
    }
  };


  if (!isAuthenticated) {
    // Pass isLoggingIn prop if you want to show loading state during login attempt
    return <AdminLogin onLogin={handleLogin} />;
  }

  // Display loading state while essential config is loading
  const isLoadingConfig = loadingCatFiltro || loadingFiltrosAtivos || loadingSections;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Painel Administrativo</h1>
          <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Adjusted grid columns for better responsiveness */}
          <TabsList className="mb-6 grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            <TabsTrigger value="categorias_filtros">Categorias/Filtros</TabsTrigger>
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
            <TabsTrigger value="site_content">Conteúdo Site</TabsTrigger>
            <TabsTrigger value="site_sections">Seções Site</TabsTrigger>
            <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger> {/* Nova aba de pagamentos */}
          </TabsList>

          {/* Render loading indicator or content */}
          {isLoadingConfig ? (
             <div className="text-center text-gray-500 py-8">Carregando configurações...</div>
          ) : (
            <>
               <TabsContent value="categorias_filtros">
                 <AdminCategoryFilterManagement />
               </TabsContent>

               <TabsContent value="produtos">
                 {/* Pass catFiltro for dropdown options in product form */}
                 <AdminProductManagement catFiltro={catFiltro} />
               </TabsContent>

               <TabsContent value="site_content">
                 <AdminSiteContentForm />
               </TabsContent>

               <TabsContent value="site_sections">
                 <AdminSiteSectionsForm
                   sections={sections}
                   setSections={setSections}
                   handleChange={handleChange}
                   handleToggle={handleToggle}
                   loading={loadingSections}
                   error={errorSections}
                   success={successSections}
                   setSuccess={setSuccessSections}
                   setError={setErrorSections}
                   setLoading={setLoadingSections}
                 />
               </TabsContent>

               {/* Nova aba de pagamentos */}
               <TabsContent value="pagamentos">
                 <AdminPaymentSection
                   sections={sections}
                   setSections={setSections}
                   handleChange={handleChange}
                 />
               </TabsContent>
            </>
          )}
        </Tabs>
        {/* Add Save Sections button outside TabsContent */}
        {!isLoadingConfig && (
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 text-center">
            <button
              onClick={handleSaveSections}
              className="bg-primary text-white px-4 py-2 rounded mt-4"
              disabled={loadingSections}
            >
              {loadingSections ? "Salvando..." : activeTab === 'pagamentos' ? "Salvar Meio de Checkout" : "Salvar Configurações"}
            </button>
            {successSections && <div className="text-green-600 text-center mt-2">{successSections}</div>}
            {errorSections && <div className="text-red-600 text-center mt-2">{errorSections}</div>}
          </div>
        )}
      </main>
    </div>
  );
}