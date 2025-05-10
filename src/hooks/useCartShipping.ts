import { useState, useEffect } from "react";
import { useAuth } from '../components/AuthContext'; // Import useAuth
import { getAddresses, Address } from '@/services/userService'; // Import getAddresses and Address type
import { CartItem } from '../components/CartContext'; // Import CartItem type

export interface ShippingOption {
  id: string; // Unique identifier
  name: string; // e.g., "Retirada na Loja", "Receber em Casa", "Frete Grátis", "Calculado Pelo CEP"
  cost: number; // The calculated cost
  price: number; // Add price property
  deliveryTime: string; // e.g., "1 Dia Útil Após Confirmação do Pagamento do Pedido", "3 à 5 Dias Úteis para Entrega", "3 a 4 Dias Úteis"
  note?: string; // Optional note, like pickup hours
}

interface UseCartShippingResult {
  userAddresses: Address[];
  selectedAddress: Address | null;
  setSelectedAddress: (address: Address | null) => void;
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
  manualShippingInfo: {
    name: string;
    email: string;
    address: string;
    city: string;
    zipCode: string;
    houseNumber: string;
    complement: string;
    state: string;
    country: string;
  };
  setManualShippingInfo: (info: {
    name: string;
    email: string;
    address: string;
    city: string;
    zipCode: string;
    houseNumber: string;
    complement: string;
    state: string;
    country: string;
  }) => void;
  handleManualInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const useCartShipping = (items: CartItem[]): UseCartShippingResult => {
  const { user, isAuthenticated } = useAuth();

  // State for user addresses and selection
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  // State for shipping calculation and selection
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingOption, setSelectedShippingOption] = useState<ShippingOption | null>(null);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState<boolean>(false);
  const [shippingCalculationError, setShippingCalculationError] = useState<string | null>(null);

  // Local state for manual shipping info input (used if no address is selected)
  const [manualShippingInfo, setManualShippingInfo] = useState({
    name: user?.name || "", // Pre-fill with user name if available
    email: user?.email || "", // Pre-fill with user email if available
    address: "",
    city: "",
    zipCode: "",
    houseNumber: "",
    complement: "",
    state: "",
    country: "",
  });

  // Handle input changes for manual shipping info
  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setManualShippingInfo((prev) => ({ ...prev, [name]: value }));
    // If user starts typing, deselect any chosen saved address
    setSelectedAddress(null);
    setSelectedShippingOption(null); // Clear selected shipping if address changes
    setShippingOptions([]); // Clear shipping options
    setShippingCost(0);
  };


  // Effect to fetch user addresses when authenticated user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchUserAddresses = async () => {
        try {
          const addresses = await getAddresses(user.id);
          setUserAddresses(addresses);
          const defaultAddress = addresses.find(addr => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddress(defaultAddress);
          } else if (addresses.length > 0) {
             // Optionally select the first address if no default
             // setSelectedAddress(addresses[0]);
          }
        } catch (error) {
          console.error("Failed to fetch user addresses:", error);
          // Handle error (e.g., show a message)
        }
      };
      fetchUserAddresses();
    } else {
      // Clear addresses if user logs out
      setUserAddresses([]);
      setSelectedAddress(null);
      // Clear manual shipping info as well
      setManualShippingInfo({
        name: "",
        email: "",
        address: "",
        city: "",
        zipCode: "",
        houseNumber: "",
        complement: "",
        state: "",
        country: "",
      });
    }
  }, [isAuthenticated, user]); // Re-run if auth state or user changes

  // Effect to calculate shipping when selectedAddress or cartItems change
  useEffect(() => {
    // Determine which address to use: selected saved address or manual input
    const addressToUse = selectedAddress || (manualShippingInfo.zipCode ? manualShippingInfo : null);

    if (addressToUse && items.length > 0 && addressToUse.zipCode) {
      setIsCalculatingShipping(true);
      setShippingCalculationError(null);
      setShippingOptions([]); // Clear previous options
      setSelectedShippingOption(null);
      setShippingCost(0);

      const totalCartValue = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const state = addressToUse.state.toUpperCase();
      const city = addressToUse.city.toUpperCase();

      let calculatedOptions: ShippingOption[] = [];

      // 1. Belo Horizonte - MG
      if (state === 'MG' && city === 'BELO HORIZONTE') {
        calculatedOptions = [
          {
            id: 'pickup',
            name: 'Retirada na Loja',
            cost: 0,
            price: 0,
            deliveryTime: '1 Dia Útil Após Confirmação do Pagamento do Pedido',
            note: 'Seg - Sex: 09:00 às 18:00',
          },
          {
            id: 'home-delivery-bh',
            name: 'Receber em Casa',
            cost: 0,
            price: 0,
            deliveryTime: '3 à 5 Dias Úteis para Entrega',
          },
        ];
      }
      // 2. Região Sul e Sudeste (excluding Belo Horizonte)
      else if (['PR', 'SC', 'RS'].includes(state) || (['SP', 'RJ', 'ES', 'MG'].includes(state) && city !== 'BELO HORIZONTE')) {
         calculatedOptions = [
           {
             id: 'free-shipping-sulsudeste',
             name: 'Frete Grátis',
             cost: 0,
             price: 0,
             deliveryTime: '3 a 4 Dias Úteis',
           },
         ];
      }
      // 3. Demais Regiões
      else {
        if (totalCartValue > 399) {
          calculatedOptions = [
            {
              id: 'free-shipping-other',
              name: 'Frete Grátis',
              cost: 0,
              price: 0,
              deliveryTime: '3 a 4 Dias Úteis',
            },
          ];
        } else {
          // Placeholder for Calculated by CEP. A real implementation would call an external service or use a lookup table.
          // For this task, we'll use a fixed placeholder cost.
          const placeholderCost = 25.00; // Example placeholder cost
          calculatedOptions = [
            {
              id: 'calculated-by-cep',
              name: 'Calculado Pelo CEP',
              cost: placeholderCost,
              price: placeholderCost, // Use placeholder cost
              deliveryTime: '3 a 4 Dias Úteis',
            },
          ];
        }
      }

      setShippingOptions(calculatedOptions);
      if (calculatedOptions.length > 0) {
        // Optionally auto-select the cheapest or first option
        // setSelectedShippingOption(calculatedOptions[0]);
        // setShippingCost(calculatedOptions[0].cost);
      } else {
        setShippingCalculationError("No shipping options available for this address based on the defined rules.");
      }

      setIsCalculatingShipping(false);

    } else {
      // Clear shipping info if no address is selected or cart is empty
      setShippingOptions([]);
      setSelectedShippingOption(null);
      setShippingCost(0);
      setShippingCalculationError(null);
    }
  }, [selectedAddress, items, isAuthenticated, manualShippingInfo]); // Recalculate if address, cart items, auth state, or manual info change

  // Effect to update shippingCost when selectedShippingOption changes
  useEffect(() => {
    if (selectedShippingOption) {
      setShippingCost(selectedShippingOption.cost);
    } else {
      setShippingCost(0);
    }
  }, [selectedShippingOption]);


  return {
    userAddresses,
    selectedAddress,
    setSelectedAddress,
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
    manualShippingInfo,
    setManualShippingInfo,
    handleManualInputChange,
  };
};