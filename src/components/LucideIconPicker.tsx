import React, { useState, useMemo } from "react";
import * as LucideIcons from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LucideIconPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (iconName: string) => void;
  selectedIcon?: string;
}

export const LucideIconPicker: React.FC<LucideIconPickerProps> = ({
  open,
  onOpenChange,
  onSelect,
  selectedIcon,
}) => {
  const [search, setSearch] = useState("");

  // Lista de nomes dos ícones Lucide
  const iconNames = useMemo(() =>
    Object.keys(LucideIcons).filter((name) => /^[A-Z]/.test(name)),
    []
  );

  const filteredIcons = useMemo(
    () =>
      iconNames.filter((name) =>
        name.toLowerCase().includes(search.toLowerCase())
      ),
    [iconNames, search]
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
          {filteredIcons.map((iconName) => {
            const LucideIcon = (LucideIcons as any)[iconName];
            return (
              <Button
                key={iconName}
                type="button"
                variant={selectedIcon === iconName ? "default" : "outline"}
                size="icon"
                className="flex flex-col items-center justify-center h-16 w-16"
                onClick={() => {
                  onSelect(iconName);
                  onOpenChange(false);
                }}
                title={iconName}
              >
                {LucideIcon ? (
                  <LucideIcon className="w-6 h-6 mb-1" />
                ) : (
                  <LucideIcons.Star className="w-6 h-6 mb-1" />
                )}
                <span className="text-xs truncate w-full">{iconName}</span>
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
