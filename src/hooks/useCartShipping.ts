import { useState, useEffect } from "react";
import { useAuth } from '../components/AuthContext'; // Import useAuth
import { getAddresses, Address } from '@/services/userService'; // Import getAddresses and Address type
import { calculateShipping, MelhorEnvioShippingOption } from '@/services/melhorEnvioService'; // Import Melhor Envio service and types
import { CartItem } from '../components/CartContext'; // Import CartItem type

interface UseCartShippingResult {
  userAddresses: Address[];
  selectedAddress: Address | null;
  setSelectedAddress: (address: Address | null) => void;
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
  const [shippingOptions, setShippingOptions] = useState<MelhorEnvioShippingOption[]>([]);
  const [selectedShippingOption, setSelectedShippingOption] = useState<MelhorEnvioShippingOption | null>(null);
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
  }, [selectedAddress, items, isAuthenticated]); // Recalculate if address, cart items, or auth state change

  // Effect to update shippingCost when selectedShippingOption changes
  useEffect(() => {
    if (selectedShippingOption) {
      setShippingCost(parseFloat(selectedShippingOption.price));
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