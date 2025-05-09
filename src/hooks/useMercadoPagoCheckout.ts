import { useState, useEffect } from "react";
import {
  loadMercadoPagoScript,
  createPreference,
  initMercadoPago,
} from "@/lib/mercadopago";
import { CartItem } from "../components/CartContext";
import { Address } from '@/services/userService';
import { MelhorEnvioShippingOption } from '@/services/melhorEnvioService';
import { User } from "firebase/auth"; // Assuming User type from firebase/auth

// Define a type that represents the manual shipping info structure
type ManualShippingInfo = {
  name: string;
  email: string;
  address: string; // This corresponds to street_name in MercadoPago
  city: string;
  zipCode: string;
  houseNumber: string;
  complement: string;
  state: string;
  country: string;
};

// Define a type that represents either a saved Address or the manual shipping info structure
type CheckoutAddress = Address | ManualShippingInfo;


interface UseMercadoPagoCheckoutProps {
  items: CartItem[];
  selectedAddress: Address | null;
  manualShippingInfo: ManualShippingInfo;
  shippingOptions: MelhorEnvioShippingOption[];
  selectedShippingOption: MelhorEnvioShippingOption | null;
  isAuthenticated: boolean;
  user: User | null; // Pass the user object
}

interface UseMercadoPagoCheckoutResult {
  isProcessingPayment: boolean;
  checkoutError: string | null;
  handleCheckout: () => Promise<void>;
}

export const useMercadoPagoCheckout = ({
  items,
  selectedAddress,
  manualShippingInfo,
  shippingOptions,
  selectedShippingOption,
  isAuthenticated,
  user,
}: UseMercadoPagoCheckoutProps): UseMercadoPagoCheckoutResult => {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [mercadoPagoLoaded, setMercadoPagoLoaded] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    loadMercadoPagoScript()
      .then(() => {
        setMercadoPagoLoaded(true);
      })
      .catch((error) => {
        console.error("Failed to load MercadoPago SDK:", error);
        setCheckoutError("Failed to load payment processor");
      });
  }, []);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      setCheckoutError("Please login to continue with checkout");
      return;
    }

    if (!mercadoPagoLoaded) {
      setCheckoutError("Payment system is still loading. Please try again.");
      return;
    }

    // Determine the address to use for checkout
    const addressForCheckout: CheckoutAddress | null = selectedAddress || (manualShippingInfo.zipCode ? manualShippingInfo : null);

    // Validate shipping information based on whether a saved address is selected or manual info is used
    if (!addressForCheckout) {
       setCheckoutError("Please provide shipping information.");
       return;
    }

    // Use type guards to access properties safely
    let streetName: string;
    let name: string;
    let email: string;
    let houseNumber: string | undefined;
    let city: string;
    let zipCode: string;
    let state: string;
    let country: string;

    if (selectedAddress) { // It's an Address type
      streetName = selectedAddress.street;
      name = selectedAddress.name || user?.displayName || "";
      email = selectedAddress.email || user?.email || "";
      houseNumber = selectedAddress.houseNumber;
      city = selectedAddress.city;
      zipCode = selectedAddress.zipCode;
      state = selectedAddress.state;
      country = selectedAddress.country;
    } else { // It's a ManualShippingInfo type
      streetName = manualShippingInfo.address; // ManualShippingInfo uses 'address' for street name
      name = manualShippingInfo.name;
      email = manualShippingInfo.email;
      houseNumber = manualShippingInfo.houseNumber;
      city = manualShippingInfo.city;
      zipCode = manualShippingInfo.zipCode;
      state = manualShippingInfo.state;
      country = manualShippingInfo.country;
    }


    // Ensure required fields are present in the selected/manual address
    if (!streetName || !city || !zipCode) {
       setCheckoutError("Shipping address is incomplete. Please provide a valid address.");
       return;
    }

    // Ensure a shipping option is selected if options were available
    if (shippingOptions.length > 0 && !selectedShippingOption) {
       setCheckoutError("Please select a shipping option.");
       return;
    }


    setIsProcessingPayment(true);
    setCheckoutError(null);

    try {
      const preference = {
        items: items.map((item) => ({
          id: item.id, // Adiciona o campo id para compatibilidade com CheckoutItem
          title: item.name,
          description: `${item.name} - Quantity: ${item.quantity}`,
          picture_url: item.image,
          category_id: "products",
          quantity: item.quantity,
          unit_price: item.price,
          currency_id: "BRL",
        })),
        // Add shipping as an item if a shipping option is selected
        ...(selectedShippingOption && {
          items: [
            ...items.map((item) => ({
              id: item.id,
              title: item.name,
              description: `${item.name} - Quantity: ${item.quantity}`,
              picture_url: item.image,
              category_id: "products",
              quantity: item.quantity,
              unit_price: item.price,
              currency_id: "BRL",
            })),
            {
              id: selectedShippingOption.id.toString(), // Use shipping option ID
              title: `Frete: ${selectedShippingOption.name}`,
              quantity: 1,
              unit_price: parseFloat(selectedShippingOption.price), // Ensure price is a number
              currency_id: "BRL",
            },
          ],
        }),
        payer: { // Populate payer info from selected address or manual input
          name: name,
          surname: name?.split(" ").slice(1).join(" ") || "", // Assuming surname is everything after the first name
          email: email,
          address: { // Populate address from selected address or manual input
            street_name: streetName,
            street_number: houseNumber ? parseInt(houseNumber, 10) : undefined, // Convert houseNumber to number if it exists
            zip_code: zipCode,
            city: city,
            state: state,
            // country: country, // MercadoPago might not need country here
          },
        },
        back_urls: {
          success: window.location.href,
          failure: window.location.href,
          pending: window.location.href,
        },
        auto_return: "approved",
        external_reference: `order_${Date.now()}`,
      };
      // Log para depuração
      console.log("MercadoPago preference:", JSON.stringify(preference, null, 2));

      const preferenceId = await createPreference(preference);

      const mp = initMercadoPago();
      const checkout = mp.checkout({
        preference: {
          id: preferenceId,
        },
        render: {
          container: ".mercado-pago-checkout",
          label: "Pay with Mercado Pago",
        },
        theme: {
          elementsColor: "#000000",
          headerColor: "#000000",
        },
      });

      const checkoutContainer = document.createElement("div");
      checkoutContainer.className = "mercado-pago-checkout";
      document.body.appendChild(checkoutContainer);

      setTimeout(() => {
        const button = document.querySelector(".mercado-pago-checkout button");
        if (button) {
          (button as HTMLButtonElement).click();
        } else {
          setCheckoutError("Could not initialize payment. Please try again.");
        }
        setIsProcessingPayment(false);
      }, 1000);
    } catch (error) {
      console.error("Checkout error:", error);
      setCheckoutError("An error occurred during checkout. Please try again.");
      setIsProcessingPayment(false);
    }
  };

  return {
    isProcessingPayment,
    checkoutError,
    handleCheckout,
  };
};