import React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineEdit } from "../AdminSiteSectionsForm"; // Assuming InlineEdit remains in the main file
import { FontAwesomeIconPicker } from "@/components/FontAwesomeIconPicker"; // Assuming FontAwesomeIconPicker remains in the main file or shared
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; // Assuming FontAwesomeIcon remains in the main file or shared
import { IconDefinition } from "@fortawesome/fontawesome-svg-core"; // Assuming IconDefinition remains in the main file or shared
import { SiteSectionsConfig } from "@/lib/siteConfig";

interface AdminFeaturesSectionProps {
  sections: SiteSectionsConfig;
  setSections: React.Dispatch<React.SetStateAction<SiteSectionsConfig | null>>;
  handleChange: (sections: SiteSectionsConfig | null, setSections: React.Dispatch<React.SetStateAction<SiteSectionsConfig | null>>, section: string, field: string, value: any) => void;
  handleToggle: (sections: SiteSectionsConfig | null, setSections: React.Dispatch<React.SetStateAction<SiteSectionsConfig | null>>, section: keyof SiteSectionsConfig['sectionsAtivas']) => void;
  handleBenefitChange: (sections: SiteSectionsConfig | null, setSections: React.Dispatch<React.SetStateAction<SiteSectionsConfig | null>>, idx: number, field: string, value: string) => void;
  handleAddBenefit: (sections: SiteSectionsConfig | null, setSections: React.Dispatch<React.SetStateAction<SiteSectionsConfig | null>>) => void;
  handleRemoveBenefit: (sections: SiteSectionsConfig | null, setSections: React.Dispatch<React.SetStateAction<SiteSectionsConfig | null>>, idx: number) => void;
  iconPickerOpenIdx: number | null;
  setIconPickerOpenIdx: React.Dispatch<React.SetStateAction<number | null>>;
  faIcons: { [key: string]: IconDefinition };
}

const AdminFeaturesSection: React.FC<AdminFeaturesSectionProps> = ({
  sections,
  setSections,
  handleChange,
  handleToggle,
  handleBenefitChange,
  handleAddBenefit,
  handleRemoveBenefit,
  iconPickerOpenIdx,
  setIconPickerOpenIdx,
  faIcons,
}) => {
  return (
    <section className="border rounded-md p-4 space-y-3">
      <label className="flex items-center gap-2 font-medium mb-2 cursor-pointer">
        <input
          type="checkbox"
          checked={sections.sectionsAtivas.features}
          onChange={() => handleToggle(sections, setSections, "features")}
        />
        Ativar Section Benefícios
      </label>
      {sections.sectionsAtivas.features && (
        <div className="space-y-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Título</label>
            <InlineEdit
              value={sections.features.title}
              onChange={(v: string) => handleChange(sections, setSections, "features", "title", v)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Subtítulo</label>
            <InlineEdit
              value={sections.features.subtitle}
              onChange={(v: string) => handleChange(sections, setSections, "features", "subtitle", v)}
            />
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">Benefícios</label>
            {sections.features.benefits.map((b, idx) => (
              <div key={idx} className="flex gap-3 items-start bg-gray-50 rounded p-3 border">
                <div className="flex-shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-16 h-16 flex items-center justify-center border rounded bg-white hover:bg-gray-100 transition relative"
                    title="Escolher ícone"
                    onClick={() => setIconPickerOpenIdx(idx)}
                  >
                    <FontAwesomeIcon icon={faIcons[b.icon] || faIcons['star']} className="w-8 h-8 text-indigo-600" />
                  </Button>
                  <FontAwesomeIconPicker
                    open={iconPickerOpenIdx === idx}
                    onOpenChange={open => setIconPickerOpenIdx(open ? idx : null)}
                    onSelect={iconName => {
                      handleBenefitChange(sections, setSections, idx, "icon", iconName);
                      setIconPickerOpenIdx(null);
                    }}
                    selectedIcon={b.icon}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <InlineEdit
                    value={b.title}
                    onChange={(v: string) => handleBenefitChange(sections, setSections, idx, "title", v)}
                    className="font-semibold block w-full"
                    placeholder="Título do Benefício"
                  />
                  <InlineEdit
                    value={b.description}
                    onChange={(v: string) => handleBenefitChange(sections, setSections, idx, "description", v)}
                    textarea
                    className="block w-full min-h-[40px]"
                    placeholder="Descrição do Benefício"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveBenefit(sections, setSections, idx)}
                  title="Remover benefício"
                  className="text-red-500 hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button type="button" size="sm" variant="outline" onClick={() => handleAddBenefit(sections, setSections)}>
              Adicionar benefício
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminFeaturesSection;