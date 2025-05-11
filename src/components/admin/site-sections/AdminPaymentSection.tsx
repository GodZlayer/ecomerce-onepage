import React from "react";
import { SiteSectionsConfig } from "@/lib/siteConfig";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AdminPaymentSectionProps {
  sections: SiteSectionsConfig;
  setSections: React.Dispatch<React.SetStateAction<SiteSectionsConfig | null>>;
  handleChange: (section: string, field: string | (string | number)[], value: any) => void;
}

const AdminPaymentSection: React.FC<AdminPaymentSectionProps> = ({
  sections,
  setSections,
  handleChange,
}) => {
  return (
    <div className="border p-6 rounded-lg shadow-sm bg-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Seção de Pagamento</h3>
      </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="payment-method">Método de Pagamento</Label>
            <RadioGroup
              id="payment-method"
              value={sections.payment.method}
              onValueChange={(value: 'paypal' | 'mercadopago') =>
                handleChange('payment', 'method', value)
              }
              className="flex flex-col space-y-1 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paypal" id="paypal" />
                <Label htmlFor="paypal">PayPal</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mercadopago" id="mercadopago" />
                <Label htmlFor="mercadopago">MercadoPago</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
    </div>
  );
};

export default AdminPaymentSection;