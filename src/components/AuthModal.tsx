import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError("Erro ao autenticar com o Google");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Entrar</DialogTitle>
          <DialogDescription>
            Use sua conta Google para acessar a loja
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        <Button
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          {isLoading ? "Redirecionando..." : "Entrando com Google"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
