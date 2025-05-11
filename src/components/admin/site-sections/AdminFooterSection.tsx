import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineEdit } from "../AdminSiteSectionsForm"; // Assuming InlineEdit remains in the main file
import { Textarea } from "@/components/ui/textarea";
import { SiteSectionsConfig } from "@/lib/siteConfig";

interface AdminFooterSectionProps {
  sections: SiteSectionsConfig;
  setSections: React.Dispatch<React.SetStateAction<SiteSectionsConfig | null>>;
  handleChange: (section: string, field: string | (string | number)[], value: any) => void;
  handleToggle: (section: keyof SiteSectionsConfig['sectionsAtivas']) => void;
  handleFooterLinkChange: (idx: number, field: string, value: string) => void;
  handleAddFooterLink: () => void;
  handleRemoveFooterLink: (idx: number) => void;
}

const AdminFooterSection: React.FC<AdminFooterSectionProps> = ({
  sections,
  setSections,
  handleChange,
  handleToggle,
  handleFooterLinkChange,
  handleAddFooterLink,
  handleRemoveFooterLink,
}) => {
  return (
    <section className="border rounded-md p-4 space-y-3">
      <label className="flex items-center gap-2 font-medium mb-2 cursor-pointer">
        <input
          type="checkbox"
          checked={sections.sectionsAtivas.footer}
          onChange={() => handleToggle("footer")}
        />
        Ativar Section Footer
      </label>
      {sections.sectionsAtivas.footer && (
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Texto do Rodapé (Copyright)</label>
            <InlineEdit
              value={sections.footer.text}
              onChange={(v: string) => handleChange("footer", "text", v)}
              className="text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mt-2">Loja Título</label>
            <InlineEdit
              value={sections.footer.footerColumn1.title}
              onChange={(v: string) => handleChange("footer", ["footerColumn1", "title"], v)}
              className="text-sm font-semibold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mt-2">Loja Descrição</label>
            <InlineEdit
              value={sections.footer.footerColumn1.description}
              onChange={(v: string) => handleChange("footer", ["footerColumn1", "description"], v)}
              className="text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mt-2">Fale Conosco Conteúdo</label>
            <Textarea
              value={sections.footer.footerColumn3}
              onChange={(e) => handleChange("footer", "footerColumn3", e.target.value)}
              className="text-sm"
              rows={4} // Adjust rows as needed
            />
            <div className="mt-2 p-2 border rounded bg-gray-50 whitespace-pre-wrap text-sm text-gray-800">
              {sections.footer.footerColumn3 || "Prévia do conteúdo Fale Conosco"}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminFooterSection;