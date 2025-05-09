import React, { useState, useEffect } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
    CategoriaFiltro,
    getCategoriaFiltro,
    FiltrosAtivosConfig,
    getFiltrosAtivosConfig
} from "@/lib/siteConfig";

// Import the extracted components
import AdminLogin from "@/components/admin/AdminLogin";
import AdminProductManagement from "@/components/admin/AdminProductManagement";
import AdminCategoryFilterManagement from "@/components/admin/AdminCategoryFilterManagement";
import AdminSiteContentForm from "@/components/admin/AdminSiteContentForm";
import AdminSiteSectionsForm from "@/components/admin/AdminSiteSectionsForm";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Keep state needed by child components here
  const [catFiltro, setCatFiltro] = useState<CategoriaFiltro | null>(null);
  const [loadingCatFiltro, setLoadingCatFiltro] = useState(true);
  const [filtrosAtivos, setFiltrosAtivos] = useState<FiltrosAtivosConfig | null>(null);
  const [loadingFiltrosAtivos, setLoadingFiltrosAtivos] = useState(true);

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


  if (!isAuthenticated) {
    // Pass isLoggingIn prop if you want to show loading state during login attempt
    return <AdminLogin onLogin={handleLogin} />;
  }

  // Display loading state while essential config is loading
  const isLoadingConfig = loadingCatFiltro || loadingFiltrosAtivos;

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
        <Tabs defaultValue="produtos" className="w-full">
          {/* Adjusted grid columns for better responsiveness */}
          <TabsList className="mb-6 grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            <TabsTrigger value="categorias_filtros">Categorias/Filtros</TabsTrigger>
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
            <TabsTrigger value="site_content">Conteúdo Site</TabsTrigger>
            <TabsTrigger value="site_sections">Seções Site</TabsTrigger>
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
                 <AdminSiteSectionsForm />
               </TabsContent>
            </>
          )}
        </Tabs>
      </main>
    </div>
  );
}