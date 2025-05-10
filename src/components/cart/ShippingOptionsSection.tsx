import React, { useEffect } from 'react';
import { Label } from "../ui/label";
import { Address } from '@/services/userService'; // Import Address type
import { CartItem } from '../CartContext'; // Import CartItem type
import { ShippingOption } from '@/hooks/useCartShipping'; // Import the new ShippingOption type

interface ShippingOptionsSectionProps {
  selectedAddress: Address | null;
  items: CartItem[];
  shippingOptions: ShippingOption[];
  setShippingOptions: (options: ShippingOption[]) => void;
  selectedShippingOption: ShippingOption | null;
  setSelectedShippingOption: (option: ShippingOption | null) => void;
  shippingCost: number;
  setShippingCost: (cost: number) => void;
  isCalculatingShipping: boolean;
  setIsCalculatingShipping: (isLoading: boolean) => void;
  shippingCalculationError: string | null;
  setShippingCalculationError: (error: string | null) => void;
}

const ShippingOptionsSection: React.FC<ShippingOptionsSectionProps> = ({
  selectedAddress,
  items,
  shippingOptions,
  setShippingOptions,
  selectedShippingOption,
  setSelectedShippingOption,
  shippingCost,
  setShippingCost,
  isCalculatingShipping,
  setIsCalculatingShipping,
  shippingCalculationError,
  setShippingCalculationError,
}) => {

  // Effect to update shippingCost when selectedShippingOption changes
  useEffect(() => {
    if (selectedShippingOption) {
      setShippingCost(selectedShippingOption.cost);
    } else {
      setShippingCost(0);
    }
  }, [selectedShippingOption]);


  return (
    <>
      {selectedAddress && items.length > 0 && ( // Only show shipping options if an address is selected and there are items
         <div className="mt-6">
           <h3 className="font-semibold text-lg mb-4">Opções de Frete</h3>
           {isCalculatingShipping ? (
             <div className="text-center text-gray-500">Calculando opções de frete...</div>
           ) : shippingCalculationError ? (
             <div className="text-red-500">{shippingCalculationError}</div>
           ) : shippingOptions.length > 0 ? (
             <div className="space-y-2">
               {shippingOptions.map(option => (
                 <div key={option.id} className="flex items-center border rounded-md p-3 cursor-pointer hover:bg-gray-100"
                      onClick={() => setSelectedShippingOption(option)}>
                   <input
                     type="radio"
                     id={`shipping-option-${option.id}`}
                     name="shipping-option"
                     value={option.id}
                     checked={selectedShippingOption?.id === option.id}
                     onChange={() => setSelectedShippingOption(option)}
                     className="mr-3"
                   />
                   <label htmlFor={`shipping-option-${option.id}`} className="flex-1 cursor-pointer">
                     <span className="font-medium">{option.name}</span> - R$ {option.cost.toFixed(2)}
                     <span className="block text-sm text-gray-600">Entrega em {option.deliveryTime}</span>
                     {option.note && <span className="block text-xs text-gray-500 mt-1">{option.note}</span>}
                   </label>
                 </div>
               ))}
             </div>
           ) : (
             <div className="text-gray-500">Selecione um endereço para calcular o frete.</div>
           )}
         </div>
      )}
    </>
  );
};

export default ShippingOptionsSection;