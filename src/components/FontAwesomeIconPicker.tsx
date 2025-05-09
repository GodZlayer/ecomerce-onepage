import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faUser, faShoppingCart, faSearch, faEdit, faTrash, faPlus, faCheck, faTimes, faHome, faEnvelope, faPhone, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";

const ICONS = [
  { name: "faStar", icon: faStar },
  { name: "faUser", icon: faUser },
  { name: "faShoppingCart", icon: faShoppingCart },
  { name: "faSearch", icon: faSearch },
  { name: "faEdit", icon: faEdit },
  { name: "faTrash", icon: faTrash },
  { name: "faPlus", icon: faPlus },
  { name: "faCheck", icon: faCheck },
  { name: "faTimes", icon: faTimes },
  { name: "faHome", icon: faHome },
  { name: "faEnvelope", icon: faEnvelope },
  { name: "faPhone", icon: faPhone },
  { name: "faMapMarkerAlt", icon: faMapMarkerAlt },
];

interface FontAwesomeIconPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (iconName: string) => void;
  selectedIcon?: string;
}

export const FontAwesomeIconPicker: React.FC<FontAwesomeIconPickerProps> = ({
  open,
  onOpenChange,
  onSelect,
  selectedIcon,
}) => {
  const [search, setSearch] = useState("");

  const filteredIcons = useMemo(
    () =>
      ICONS.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Escolha um ícone</DialogTitle>
        </DialogHeader>
        <Input
          autoFocus
          placeholder="Buscar ícone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />
        <div className="grid grid-cols-6 md:grid-cols-8 gap-3 max-h-80 overflow-y-auto">
          {filteredIcons.map((item) => (
            <Button
              key={item.name}
              type="button"
              variant={selectedIcon === item.name ? "default" : "outline"}
              size="icon"
              className="flex flex-col items-center justify-center h-16 w-16"
              onClick={() => {
                onSelect(item.name);
                onOpenChange(false);
              }}
              title={item.name}
            >
              <FontAwesomeIcon icon={item.icon} className="w-6 h-6 mb-1" />
              <span className="text-xs truncate w-full">{item.name}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
