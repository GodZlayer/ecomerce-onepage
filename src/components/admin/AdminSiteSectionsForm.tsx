import React, { useState, useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Import site config types and functions
import { SiteSectionsConfig, getSiteSections, setSiteSections } from "@/lib/siteConfig";

// FontAwesome setup
import { FontAwesomeIconPicker } from "@/components/FontAwesomeIconPicker";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library, IconDefinition } from "@fortawesome/fontawesome-svg-core";
import * as solidIcons from "@fortawesome/free-solid-svg-icons";
import * as regularIcons from "@fortawesome/free-regular-svg-icons";
import * as brandsIcons from "@fortawesome/free-brands-svg-icons";

// Import new section components
import AdminTopSection from "./site-sections/AdminTopSection";
import AdminAboutSection from "./site-sections/AdminAboutSection";
import AdminFeaturesSection from "./site-sections/AdminFeaturesSection";
import AdminContactSection from "./site-sections/AdminContactSection";
import AdminFooterSection from "./site-sections/AdminFooterSection";


// Helper to filter only IconDefinition objects
function isIconDefinition(i: any): i is IconDefinition {
  return i && typeof i === "object" && "iconName" in i && Array.isArray(i.icon) && typeof i.prefix === 'string';
}

// Add all icons to the library
library.add(
  ...Object.values(solidIcons).filter(isIconDefinition),
  ...Object.values(regularIcons).filter(isIconDefinition),
  ...Object.values(brandsIcons).filter(isIconDefinition)
);

// Create a map of icon names to icon objects for easy lookup
const faIcons: { [key: string]: IconDefinition } = {};
Object.values(solidIcons).filter(isIconDefinition).forEach(icon => { faIcons[icon.iconName] = icon });
Object.values(regularIcons).filter(isIconDefinition).forEach(icon => { faIcons[icon.iconName] = icon });
Object.values(brandsIcons).filter(isIconDefinition).forEach(icon => { faIcons[icon.iconName] = icon });

// Ensure the default 'star' icon exists
if (!faIcons['star']) {
    const starIcon = Object.values(solidIcons).find(icon => isIconDefinition(icon) && icon.iconName === 'star');
    if (starIcon && isIconDefinition(starIcon)) {
        faIcons['star'] = starIcon;
    } else {
        console.warn("Default 'star' icon not found in solid icons, attempting to find any star icon.");
        const anyStar = Object.values(solidIcons).find(icon => isIconDefinition(icon) && icon.iconName.includes('star'));
         if (anyStar && isIconDefinition(anyStar)) {
             faIcons['star'] = anyStar;
         } else {
            const firstIcon = Object.values(solidIcons).find(isIconDefinition);
            if(firstIcon) faIcons['star'] = firstIcon;
         }
    }
}


// Inline Edit Component (extracted from admin.tsx)
// Props type definition for InlineEdit (Removed extends React.HTMLAttributes)
interface InlineEditProps {
    value: string;
    onChange: (newValue: string) => void;
    textarea?: boolean;
    className?: string;
    placeholder?: string;
    // Add any other specific HTML attributes you need, e.g., id?: string;
}

// Removed ...props from function signature
export function InlineEdit({ value, onChange, textarea = false, className = "", placeholder }: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [temp, setTemp] = useState(value);
  useEffect(() => { setTemp(value); }, [value]);

  const handleBlur = () => {
    setEditing(false);
    if (temp !== value) {
        onChange(temp);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !textarea) {
        handleBlur();
        e.preventDefault();
    } else if (e.key === 'Escape') {
        setTemp(value);
        setEditing(false);
    }
  };

  if (editing) {
    return textarea ? (
      <Textarea
        className={`border px-2 py-1 rounded w-full bg-white ${className}`}
        value={temp}
        autoFocus
        onBlur={handleBlur}
        onChange={e => setTemp(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        // Removed {...props}
      />
    ) : (
      <Input
        className={`border px-2 py-1 rounded w-full bg-white ${className}`}
        value={temp}
        autoFocus
        onBlur={handleBlur}
        onChange={e => setTemp(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
         // Removed {...props}
      />
    );
  }
  return (
    <span
      className={`cursor-pointer inline-block min-h-[1.5em] px-1 hover:bg-yellow-100 rounded ${className}`}
      onClick={() => setEditing(true)}
      tabIndex={0}
      onFocus={() => setEditing(true)}
       // Removed {...props}
    >
      {value || <span className="text-gray-400">{placeholder || 'Clique para editar'}</span>}
    </span>
  );
}

// Helper functions (extracted from admin.tsx)
export const handleChange = (sections: SiteSectionsConfig | null, setSections: React.Dispatch<React.SetStateAction<SiteSectionsConfig | null>>, section: string, field: string | (string | number)[], value: any) => {
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

export const handleToggle = (sections: SiteSectionsConfig | null, setSections: React.Dispatch<React.SetStateAction<SiteSectionsConfig | null>>, section: keyof SiteSectionsConfig['sectionsAtivas']) => {
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

export const handleBenefitChange = (sections: SiteSectionsConfig | null, setSections: React.Dispatch<React.SetStateAction<SiteSectionsConfig | null>>, idx: number, field: string, value: string) => {
  if (!sections) return;
  setSections(prevSections => {
    if (!prevSections) return null;
    const newBenefits = [...prevSections.features.benefits];
    if (newBenefits[idx]) {
        newBenefits[idx] = { ...newBenefits[idx], [field]: value };
    }
    return {
      ...prevSections,
      features: {
        ...prevSections.features,
        benefits: newBenefits,
      },
    };
  });
};

export const handleAddBenefit = (sections: SiteSectionsConfig | null, setSections: React.Dispatch<React.SetStateAction<SiteSectionsConfig | null>>) => {
  if (!sections) return;
  setSections(prevSections => {
    if (!prevSections) return null;
    return {
      ...prevSections,
      features: {
        ...prevSections.features,
        benefits: [
          ...prevSections.features.benefits,
          { icon: "star", title: "Novo Benefício", description: "Descreva o benefício" },
        ],
      },
    };
  });
};

export const handleRemoveBenefit = (sections: SiteSectionsConfig | null, setSections: React.Dispatch<React.SetStateAction<SiteSectionsConfig | null>>, idx: number) => {
  if (!sections) return;
  setSections(prevSections => {
    if (!prevSections) return null;
    const newBenefits = prevSections.features.benefits.filter((_, i) => i !== idx);
    return {
      ...prevSections,
      features: {
        ...prevSections.features,
        benefits: newBenefits,
      },
    };
  });
};

export const handleFooterLinkChange = (sections: SiteSectionsConfig | null, setSections: React.Dispatch<React.SetStateAction<SiteSectionsConfig | null>>, idx: number, field: string, value: string) => {
    if (!sections) return;
    setSections(prevSections => {
        if (!prevSections) return null;
        const newLinks = [...prevSections.footer.footerColumn2];
        if (newLinks[idx]) {
            newLinks[idx] = { ...newLinks[idx], [field]: value };
        }
        return {
            ...prevSections,
            footer: {
                ...prevSections.footer,
                footerColumn2: newLinks,
            },
        };
    });
};

export const handleAddFooterLink = (sections: SiteSectionsConfig | null, setSections: React.Dispatch<React.SetStateAction<SiteSectionsConfig | null>>) => {
    if (!sections) return;
    setSections(prevSections => {
        if (!prevSections) return null;
        return {
            ...prevSections,
            footer: {
                ...prevSections.footer,
                footerColumn2: [
                    ...prevSections.footer.footerColumn2,
                    { label: "Novo Link", url: "/" },
                ],
            },
        };
    });
};

export const handleRemoveFooterLink = (sections: SiteSectionsConfig | null, setSections: React.Dispatch<React.SetStateAction<SiteSectionsConfig | null>>, idx: number) => {
    if (!sections) return;
    setSections(prevSections => {
        if (!prevSections) return null;
        const newLinks = prevSections.footer.footerColumn2.filter((_, i) => i !== idx);
        return {
            ...prevSections,
            footer: {
                ...prevSections.footer,
                footerColumn2: newLinks,
            },
        };
    });
};


// Main Component (extracted SiteSectionsForm logic)
const AdminSiteSectionsForm: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sections, setSections] = useState<SiteSectionsConfig | null>(null);
  const [iconPickerOpenIdx, setIconPickerOpenIdx] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    setError("");
    setSuccess("");
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
        sectionsAtivas: { top: true, about: true, features: true, contact: true, footer: true, ...(data?.sectionsAtivas || {}) },
      };

      setSections(safeSections);
      setLoading(false);
    }).catch((err) => {
      console.error("Error loading site sections:", err);
      setError("Erro ao carregar sections do site.");
      setLoading(false);
    });
  }, []);




  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (sections) {
        await setSiteSections(sections);
        setSuccess("Sections salvas com sucesso!");
      } else {
          throw new Error("Sections data is null, cannot save.");
      }

    } catch (err) {
      console.error("Error saving sections:", err);
      setError("Erro ao salvar sections.");
    } finally {
        setLoading(false);
    }
  };

  if (loading) return <div className="text-center text-gray-500 py-8">Carregando sections...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;
  if (!sections) return <div className="text-center text-gray-500 py-8">Nenhuma section carregada.</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-10 mt-10">
      <h2 className="text-xl font-semibold mb-2">Gerenciar Sections do Site</h2>

      {/* Section Top */}
      <AdminTopSection
        sections={sections}
        setSections={setSections}
        handleChange={handleChange}
        handleToggle={handleToggle}
      />

      {/* Section About */}
      <AdminAboutSection
        sections={sections}
        setSections={setSections}
        handleChange={handleChange}
        handleToggle={handleToggle}
      />

      {/* Section Features */}
      <AdminFeaturesSection
        sections={sections}
        setSections={setSections}
        handleChange={handleChange}
        handleToggle={handleToggle}
        handleBenefitChange={handleBenefitChange}
        handleAddBenefit={handleAddBenefit}
        handleRemoveBenefit={handleRemoveBenefit}
        iconPickerOpenIdx={iconPickerOpenIdx}
        setIconPickerOpenIdx={setIconPickerOpenIdx}
        faIcons={faIcons}
      />

      {/* Section Contact */}
      <AdminContactSection
        sections={sections}
        setSections={setSections}
        handleChange={handleChange}
        handleToggle={handleToggle}
      />

      {/* Section Footer */}
      <AdminFooterSection
        sections={sections}
        setSections={setSections}
        handleChange={handleChange}
        handleToggle={handleToggle}
        handleFooterLinkChange={handleFooterLinkChange}
        handleAddFooterLink={handleAddFooterLink}
        handleRemoveFooterLink={handleRemoveFooterLink}
      />

      <button type="submit" className="bg-primary text-white px-4 py-2 rounded mt-4" disabled={loading}>
        {loading ? "Salvando..." : "Salvar Sections"}
      </button>
      {success && <div className="text-green-600 text-center mt-2">{success}</div>}
      {error && <div className="text-red-600 text-center mt-2">{error}</div>}
    </form>
  );
}

export default AdminSiteSectionsForm;