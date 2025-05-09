import React from "react";
import { InlineEdit } from "../AdminSiteSectionsForm"; // Assuming InlineEdit remains in the main file
import { SiteSectionsConfig } from "@/lib/siteConfig";

interface AdminTopSectionProps {
  sections: SiteSectionsConfig;
  setSections: React.Dispatch<React.SetStateAction<SiteSectionsConfig | null>>;
  handleChange: (sections: SiteSectionsConfig | null, setSections: React.Dispatch<React.SetStateAction<SiteSectionsConfig | null>>, section: string, field: string, value: any) => void;
  handleToggle: (sections: SiteSectionsConfig | null, setSections: React.Dispatch<React.SetStateAction<SiteSectionsConfig | null>>, section: keyof SiteSectionsConfig['sectionsAtivas']) => void;
}

const AdminTopSection: React.FC<AdminTopSectionProps> = ({
  sections,
  setSections,
  handleChange,
  handleToggle,
}) => {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const cloudName = import.meta.env.VITE_CLOUDINARY_URL?.split('@')[1];
    if (!cloudName) {
      console.error("Cloudinary Cloud Name is missing in VITE_CLOUDINARY_URL.");
      alert("Erro de configuração do Cloudinary.");
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('upload_preset', 'test_preset_unsigned'); // Use your actual upload preset name

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error uploading image to Cloudinary:", errorData);
        alert(`Erro ao fazer upload da imagem: ${errorData.error?.message || 'Erro desconhecido'}`);
        return;
      }

      const result = await response.json();
      console.log("Cloudinary upload response:", result);

      if (result.secure_url) {
        handleChange(sections, setSections, "top", "imageUrl", result.secure_url);
        setSelectedFile(null); // Clear the selected file after successful upload
        alert("Imagem enviada com sucesso!");
      } else {
        console.error("Cloudinary upload failed:", result);
        alert("Upload da imagem falhou: Resposta inválida do Cloudinary.");
      }
    } catch (error) {
      console.error("Error during Cloudinary upload fetch:", error);
      alert("Erro de rede ou problema inesperado durante o upload.");
    }
  };

  return (
    <section className="border rounded-md p-4 space-y-3">
      <label className="flex items-center gap-2 font-medium mb-2 cursor-pointer">
        <input
          type="checkbox"
          checked={sections.sectionsAtivas.top}
          onChange={() => handleToggle(sections, setSections, "top")}
        />
        Ativar Section Top
      </label>
      {sections.sectionsAtivas.top && (
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Título</label>
            <InlineEdit
              value={sections.top.title}
              onChange={(v: string) => handleChange(sections, setSections, "top", "title", v)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Subtítulo</label>
            <InlineEdit
              value={sections.top.subtitle}
              onChange={(v: string) => handleChange(sections, setSections, "top", "subtitle", v)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Imagem</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <button
              onClick={handleUpload}
              disabled={!selectedFile}
              className={`mt-2 px-4 py-2 rounded-md text-sm font-semibold text-white ${
                selectedFile ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Upload Imagem
            </button>
            {sections.top.imageUrl && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Imagem Atual</label>
                <img src={sections.top.imageUrl} alt="Imagem topo" className="max-h-40 mt-2 rounded shadow" />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Botão 1 - Texto</label>
              <InlineEdit
                value={sections.top.actionButton1?.label || ""}
                onChange={(v: string) =>
                  handleChange(sections, setSections, "top", "actionButton1", {
                    ...sections.top.actionButton1,
                    label: v,
                  })
                }
                placeholder="Texto do botão 1"
              />
              <label className="block text-sm font-medium text-gray-700 mt-1">Botão 1 - URL</label>
              <InlineEdit
                value={sections.top.actionButton1?.url || ""}
                onChange={(v: string) =>
                  handleChange(sections, setSections, "top", "actionButton1", {
                    ...sections.top.actionButton1,
                    url: v,
                  })
                }
                placeholder="/produtos"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Botão 2 - Texto</label>
              <InlineEdit
                value={sections.top.actionButton2?.label || ""}
                onChange={(v: string) =>
                  handleChange(sections, setSections, "top", "actionButton2", {
                    ...sections.top.actionButton2,
                    label: v,
                  })
                }
                placeholder="Texto do botão 2"
              />
              <label className="block text-sm font-medium text-gray-700 mt-1">Botão 2 - URL</label>
              <InlineEdit
                value={sections.top.actionButton2?.url || ""}
                onChange={(v: string) =>
                  handleChange(sections, setSections, "top", "actionButton2", {
                    ...sections.top.actionButton2,
                    url: v,
                  })
                }
                placeholder="/contato"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminTopSection;