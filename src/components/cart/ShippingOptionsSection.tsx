import React, { useEffect } from 'react';
import { Label } from "../ui/label";
import { calculateShipping, MelhorEnvioShippingOption } from '@/services/melhorEnvioService'; // Import service and types
import { Address } from '@/services/userService'; // Import Address type
import { CartItem } from '../CartContext'; // Import CartItem type

interface ShippingOptionsSectionProps {
  selectedAddress: Address | null;
  items: CartItem[];
  shippingOptions: MelhorEnvioShippingOption[];
  setShippingOptions: (options: MelhorEnvioShippingOption[]) => void;
  selectedShippingOption: MelhorEnvioShippingOption | null;
  setSelectedShippingOption: (option: MelhorEnvioShippingOption | null) => void;
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

  // Effect to calculate shipping when selectedAddress or cartItems change
  useEffect(() => {
    if (selectedAddress && items.length > 0 && selectedAddress.zipCode) {
      const calculateAndSetShipping = async () => {
        setIsCalculatingShipping(true);
        setShippingCalculationError(null);
        setShippingOptions([]); // Clear previous options
        setSelectedShippingOption(null);
        setShippingCost(0);

        try {
          // Construct payload for Melhor Envio
          // YOUR_STORE_CEP needs to be replaced with the actual sender's CEP from config
          const payload = {
            from: { postal_code: "YOUR_STORE_CEP" }, // <<< REPLACE WITH ACTUAL SENDER CEP
            to: { postal_code: selectedAddress.zipCode },
            products: items.map(item => ({
              id: item.id,
              width: item.width || 10, // Default or from product data - Ensure your product data includes these
              height: item.height || 10, // Default or from product data
              length: item.length || 10, // Default or from product data
              weight: item.weight || 0.1, // Default or from product data
              insurance_value: item.price * item.quantity, // Insurance value per item
              quantity: item.quantity,
            })),
            // Potentially other options like services: "1,2" (PAC, SEDEX)
          };
          console.log("Melhor Envio Payload:", payload); // Log payload for debugging

          const options = await calculateShipping(payload); // Call your service
          console.log("Melhor Envio Options:", options); // Log options for debugging

          setShippingOptions(options);
          if (options.length > 0) {
            // Optionally auto-select the cheapest or first option
            // setSelectedShippingOption(options[0]);
            // setShippingCost(parseFloat(options[0].price));
          } else {
            setShippingCalculationError("No shipping options available for this address.");
          }
        } catch (error) {
          console.error("Failed to calculate shipping:", error);
          setShippingCalculationError("Could not calculate shipping. Please check the address.");
        } finally {
          setIsCalculatingShipping(false);
        }
      };
      calculateAndSetShipping();
    } else {
      // Clear shipping info if no address is selected or cart is empty
      setShippingOptions([]);
      setSelectedShippingOption(null);
      setShippingCost(0);
      setShippingCalculationError(null);
    }
  }, [selectedAddress, items]); // Recalculate if address or cart items change


  // Effect to update shippingCost when selectedShippingOption changes
  useEffect(() => {
    if (selectedShippingOption) {
      setShippingCost(parseFloat(selectedShippingOption.price));
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
                     <span className="font-medium">{option.name}</span> - R$ {parseFloat(option.price).toFixed(2)}
                     <span className="block text-sm text-gray-600">Entrega em {option.delivery_time} dias</span>
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