import React from "react";
import { InlineEdit } from "../AdminSiteSectionsForm"; // Assuming InlineEdit remains in the main file
import { SiteSectionsConfig } from "@/lib/siteConfig";

interface AdminContactSectionProps {
  sections: SiteSectionsConfig;
  setSections: React.Dispatch<React.SetStateAction<SiteSectionsConfig | null>>;
  handleChange: (section: string, field: string | (string | number)[], value: any) => void;
  handleToggle: (section: keyof SiteSectionsConfig['sectionsAtivas']) => void;
}

const AdminContactSection: React.FC<AdminContactSectionProps> = ({
  sections,
  setSections,
  handleChange,
  handleToggle,
}) => {
  return (
    <section className="border rounded-lg p-6 shadow-md bg-white">
      <label className="flex items-center gap-2 font-medium mb-4 cursor-pointer">
        <input
          type="checkbox"
          checked={sections.sectionsAtivas.contact}
          onChange={() => handleToggle("contact")}
        />
        Ativar Section Contato
      </label>
      {sections.sectionsAtivas.contact && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Título */}
          <div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Título</label>
              <InlineEdit
                value={sections.contact.title}
                onChange={(v: string) => handleChange("contact", "title", v)}
              />
            </div>
          </div>
          {/* Right Column: Nested Containers */}
          <div className="space-y-6">
            {/* First Nested Container: Contact Info */}
            <div className="border rounded-lg p-4 shadow-sm bg-gray-50">
              <h3 className="text-lg font-semibold mb-4">Informações de Contato</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <InlineEdit
                    value={sections.contact.email}
                    onChange={(v: string) => handleChange("contact", "email", v)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefone</label>
                  <InlineEdit
                    value={sections.contact.phone}
                    onChange={(v: string) => handleChange("contact", "phone", v)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Endereço</label>
                  <InlineEdit
                    value={sections.contact.address}
                    onChange={(v: string) => handleChange("contact", "address", v)}
                    textarea
                  />
                </div>
              </div>
            </div>
            {/* Second Nested Container: Opening Hours and Form Checkbox */}
            <div className="border rounded-lg p-4 shadow-sm bg-gray-50">
               <h3 className="text-lg font-semibold mb-4">Horário de Atendimento</h3>
              <div className="space-y-4">
              <div>
                <h4 className="text-md font-medium text-gray-700 mb-2">Horário de Atendimento Diário</h4>
                {Object.entries(sections.contact.openingHours).map(([dayKey, hours]) => {
                  const dayNames: { [key: number]: string } = {
                    0: "Domingo",
                    1: "Segunda",
                    2: "Terça-feira",
                    3: "Quarta-feira",
                    4: "Quinta-feira",
                    5: "Sexta-feira",
                    6: "Sábado",
                  };
                  const dayName = dayNames[Number(dayKey)] || dayKey; // Fallback to key if name not found
                  return (
                    <div key={dayKey} className="grid grid-cols-3 gap-2 items-center mb-2">
                      <label className="text-sm font-medium text-gray-700 capitalize">{dayName}</label>
                      <input
                        type="time"
                        className="border px-2 py-1 rounded w-full bg-white text-sm"
                        value={hours.open}
                        onChange={(e) => handleChange("contact", ["openingHours", dayKey, "open"], e.target.value)}
                      />
                      <input
                        type="time"
                        className="border px-2 py-1 rounded w-full bg-white text-sm"
                        value={hours.close}
                        onChange={(e) => handleChange("contact", ["openingHours", dayKey, "close"], e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sections.contact.showContactForm}
                    onChange={e => handleChange("contact", "showContactForm", e.target.checked)}
                  />
                  Exibir formulário de contato
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminContactSection;