import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSiteContentConfig, setSiteContentConfig, SiteContentConfig } from "@/lib/siteConfig";

const AdminSiteContentForm: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [selectedFaviconFile, setSelectedFaviconFile] = useState<File | null>(null);

  const { register, handleSubmit, setValue, watch } = useForm<SiteContentConfig>({
    defaultValues: {
      logoText: "",
      logoImageUrl: "",
      logoMode: "text",
      faviconUrl: "",
      siteTitle: "",
      logoImageSizePercent: 100,
    },
  });

  useEffect(() => {
    getSiteContentConfig().then((data) => {
      setValue("logoText", data.logoText);
      setValue("logoImageUrl", data.logoImageUrl);
      setValue("logoMode", data.logoMode);
      setValue("faviconUrl", data.faviconUrl);
      setValue("siteTitle", data.siteTitle);
      setValue("logoImageSizePercent", data.logoImageSizePercent ?? 100);
      setLoading(false);
    }).catch(() => {
      setError("Erro ao carregar configurações do site.");
      setLoading(false);
    });
  }, [setValue]);

  const onSubmit = async (data: SiteContentConfig) => {
    setLoading(true);
    setError("");
    try {
      await setSiteContentConfig(data);
      setLoading(false);
      alert("Configurações salvas com sucesso!");
    } catch {
      setError("Erro ao salvar configurações.");
      setLoading(false);
    }
  };

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedLogoFile(event.target.files[0]);
    } else {
      setSelectedLogoFile(null);
    }
  };

  const handleFaviconFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFaviconFile(event.target.files[0]);
    } else {
      setSelectedFaviconFile(null);
    }
  };

  const handleLogoUpload = async () => {
    if (!selectedLogoFile) return;

    const cloudName = import.meta.env.VITE_CLOUDINARY_URL?.split('@')[1];
    if (!cloudName) {
      console.error("Cloudinary Cloud Name is missing in VITE_CLOUDINARY_URL.");
      alert("Erro de configuração do Cloudinary.");
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedLogoFile);
    formData.append('upload_preset', 'test_preset_unsigned'); // Use your actual upload preset name

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error uploading logo image to Cloudinary:", errorData);
        alert(`Erro ao fazer upload da imagem do logo: ${errorData.error?.message || 'Erro desconhecido'}`);
        return;
      }

      const result = await response.json();
      console.log("Cloudinary logo upload response:", result);

      if (result.secure_url) {
        setValue("logoImageUrl", result.secure_url);
        setSelectedLogoFile(null); // Clear the selected file after successful upload
        alert("Imagem do logo enviada com sucesso!");
      } else {
        console.error("Cloudinary logo upload failed:", result);
        alert("Upload da imagem do logo falhou: Resposta inválida do Cloudinary.");
      }
    } catch (error) {
      console.error("Error during Cloudinary logo upload fetch:", error);
      alert("Erro de rede ou problema inesperado durante o upload da imagem do logo.");
    }
  };

  const handleFaviconUpload = async () => {
    if (!selectedFaviconFile) return;

    const cloudName = import.meta.env.VITE_CLOUDINARY_URL?.split('@')[1];
    if (!cloudName) {
      console.error("Cloudinary Cloud Name is missing in VITE_CLOUDINARY_URL.");
      alert("Erro de configuração do Cloudinary.");
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFaviconFile);
    formData.append('upload_preset', 'test_preset_unsigned'); // Use your actual upload preset name

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error uploading favicon image to Cloudinary:", errorData);
        alert(`Erro ao fazer upload do favicon: ${errorData.error?.message || 'Erro desconhecido'}`);
        return;
      }

      const result = await response.json();
      console.log("Cloudinary favicon upload response:", result);

      if (result.secure_url) {
        setValue("faviconUrl", result.secure_url);
        setSelectedFaviconFile(null); // Clear the selected file after successful upload
        alert("Favicon enviado com sucesso!");
      } else {
        console.error("Cloudinary favicon upload failed:", result);
        alert("Upload do favicon falhou: Resposta inválida do Cloudinary.");
      }
    } catch (error) {
      console.error("Error during Cloudinary favicon upload fetch:", error);
      alert("Erro de rede ou problema inesperado durante o upload do favicon.");
    }
  };


  const logoMode = watch("logoMode");

  if (loading) return <div className="text-center text-gray-500 py-8">Carregando configurações...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl mx-auto space-y-6 mb-10 border-b pb-8">
       <h2 className="text-xl font-semibold mb-2">Configurações Gerais do Site</h2>
      <div>
        <label className="block font-medium mb-1">Título do site</label>
        <input {...register("siteTitle")} className="border px-2 py-1 rounded w-full" placeholder="Título do site" />
      </div>
      <div>
        <label className="block font-medium mb-1">Modo do logo</label>
        <select {...register("logoMode")} className="border px-2 py-1 rounded w-full">
          <option value="text">Apenas texto</option>
          <option value="image">Apenas imagem</option>
          <option value="both">Texto e imagem</option>
        </select>
      </div>
      {(logoMode === "text" || logoMode === "both") && (
        <div>
          <label className="block font-medium mb-1">Texto do logo</label>
          <input {...register("logoText")} className="border px-2 py-1 rounded w-full" placeholder="Texto do logo" />
        </div>
      )}
      {(logoMode === "image" || logoMode === "both") && (
        <>
        <div>
          <label className="block font-medium mb-1">URL da imagem do logo</label>
          <input {...register("logoImageUrl")} className="border px-2 py-1 rounded w-full" placeholder="https://exemplo.com/logo.png" />
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          <button
            type="button"
            onClick={handleLogoUpload}
            disabled={!selectedLogoFile}
            className={`mt-2 px-4 py-2 rounded-md text-sm font-semibold text-white ${
              selectedLogoFile ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Upload Imagem do Logo
          </button>
        </div>
        <div>
          <label className="block font-medium mb-1">Tamanho da logo (%)</label>
          <input type="number" min={10} max={300} step={1} {...register("logoImageSizePercent", { valueAsNumber: true })} className="border px-2 py-1 rounded w-full" placeholder="100" />
        </div>
        </>
      )}
      <div>
        <label className="block font-medium mb-1">URL do favicon</label>
        <input {...register("faviconUrl")} className="border px-2 py-1 rounded w-full" placeholder="https://exemplo.com/favicon.ico" />
        <input
          type="file"
          accept="image/*"
          onChange={handleFaviconFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        <button
          type="button"
          onClick={handleFaviconUpload}
          disabled={!selectedFaviconFile}
          className={`mt-2 px-4 py-2 rounded-md text-sm font-semibold text-white ${
            selectedFaviconFile ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Upload Favicon
        </button>
      </div>
      <button type="submit" className="bg-primary text-white px-4 py-2 rounded">Salvar configurações</button>
    </form>
  );
}

export default AdminSiteContentForm;