import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, ShoppingBag, CreditCard } from "lucide-react";
import { Button } from "./ui/button";
import {
  loadMercadoPagoScript,
  createPreference,
  initMercadoPago,
} from "@/lib/mercadopago";
import { useCart, CartItem } from "./CartContext";
import { useAuth } from './AuthContext';
import { Address } from '@/services/userService'; // Import Address type
import { MelhorEnvioShippingOption } from '@/services/melhorEnvioService'; // Import Melhor Envio service and types

// Import the new refactored components and hook
import CartItemList from "./cart/CartItemList";
import OrderSummary from "./cart/OrderSummary";
import ShippingAddressSection from "./cart/ShippingAddressSection";
import ShippingOptionsSection from "./cart/ShippingOptionsSection";
import { useCartShipping } from "@/hooks/useCartShipping"; // Import the custom hook


interface CartSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  // Props for cart items and actions are now handled by context directly in this component
  // and passed down to CartItemList. They are kept here for potential external usage.
  cartItems?: CartItem[];
  updateQuantity?: (id: number, quantity: number) => void;
  removeItem?: (id: number) => void;
  isAuthenticatedProp?: boolean; // Renamed prop to avoid conflict with context isAuthenticated
  onLoginClick?: () => void;
}

const CartSidebar = ({
  isOpen = false,
  onClose = () => {},
  cartItems = [], // Default value, but context will be used
  updateQuantity = () => {}, // Default value, but context will be used
  removeItem = () => {}, // Default value, but context will be used
  isAuthenticatedProp = false, // Use the renamed prop
  onLoginClick = () => {},
}: CartSidebarProps) => {
  const { cartItems: globalCartItems, updateCartItemQuantity, removeFromCart } = useCart();
  const items = cartItems.length > 0 ? cartItems : globalCartItems; // Use globalCartItems from context
  const { user, isAuthenticated } = useAuth(); // Get user and isAuthenticated from AuthContext

  // Use the custom hook for shipping logic and state
  const {
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
    handleManualInputChange,
  } = useCartShipping(items); // Pass items to the hook


  // Calculate subtotal
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Total includes subtotal and dynamic shipping cost
  const total = subtotal + shippingCost;

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
    // Use type guards to handle the union type and ensure required properties exist
    const addressForCheckout = selectedAddress || (manualShippingInfo.zipCode ? manualShippingInfo : null);


    // Validate shipping information based on whether a saved address is selected or manual info is used
    if (!addressForCheckout) {
       setCheckoutError("Please provide shipping information.");
       return;
    }

    // Ensure required fields are present in the selected/manual address
    if (!('street' in addressForCheckout && addressForCheckout.street) ||
        !('city' in addressForCheckout && addressForCheckout.city) ||
        !('zipCode' in addressForCheckout && addressForCheckout.zipCode)) {
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
            {              id: selectedShippingOption.id.toString(), // Use shipping option ID
              title: `Frete: ${selectedShippingOption.name}`,
              quantity: 1,
              unit_price: parseFloat(selectedShippingOption.price), // Ensure price is a number
              currency_id: "BRL",
            },
          ],
        }),
        payer: { // Populate payer info from selected address or manual input
          name: ('name' in addressForCheckout ? addressForCheckout.name : user?.name) || "", // Use name from address if available, otherwise user
          surname: ('name' in addressForCheckout && addressForCheckout.name?.split(" ").slice(1).join(" ")) || user?.name?.split(" ").slice(1).join(" ") || "", // Use surname from address if available, otherwise user
          email: ('email' in addressForCheckout ? addressForCheckout.email : user?.email) || "", // Use email from address if available, otherwise user
          address: { // Populate address from selected address or manual input
            street_name: addressForCheckout.street,
            street_number: ('houseNumber' in addressForCheckout && addressForCheckout.houseNumber) ? parseInt(addressForCheckout.houseNumber, 10) : undefined, // Convert houseNumber to number if it exists
            zip_code: addressForCheckout.zipCode,
            city: addressForCheckout.city,
            state: addressForCheckout.state,
            // country: addressForCheckout.country, // MercadoPago might not need country here
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

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      )}

      <motion.div
        className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-background z-50 shadow-xl flex flex-col"
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            <ShoppingBag className="mr-2 h-5 w-5" />
            Seu Carrinho
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Seu carrinho está vazio</p>
              <p className="text-muted-foreground mt-1">
                Adicione produtos ao carrinho
              </p>
              <Button className="mt-6" onClick={onClose}>
                Continuar comprando
              </Button>
            </div>
          ) : (
            <>
              {/* Cart Item List */}
              <CartItemList
                items={items}
                updateQuantity={updateCartItemQuantity}
                removeItem={removeFromCart}
              />

              {/* Order Summary */}
              <OrderSummary
                subtotal={subtotal}
                shippingCost={shippingCost}
                isCalculatingShipping={isCalculatingShipping}
                shippingCalculationError={shippingCalculationError}
                selectedShippingOption={selectedShippingOption}
              />

              {/* Shipping Address Section */}
              <ShippingAddressSection
                isAuthenticated={isAuthenticated}
                userAddresses={userAddresses}
                selectedAddress={selectedAddress}
                setSelectedAddress={setSelectedAddress}
                manualShippingInfo={manualShippingInfo}
                handleManualInputChange={handleManualInputChange}
              />

              {/* Shipping Options Section */}
              <ShippingOptionsSection
                 selectedAddress={selectedAddress}
                 items={items}
                 shippingOptions={shippingOptions}
                 setShippingOptions={setShippingOptions}
                 selectedShippingOption={selectedShippingOption}
                 setSelectedShippingOption={setSelectedShippingOption}
                 shippingCost={shippingCost} // Pass shippingCost state down
                 setShippingCost={setShippingCost} // Pass setShippingCost setter down
                 isCalculatingShipping={isCalculatingShipping} // Pass state down
                 setIsCalculatingShipping={setIsCalculatingShipping} // Pass setter down
                 shippingCalculationError={shippingCalculationError} // Pass state down
                 setShippingCalculationError={setShippingCalculationError} // Pass setter down
              />

            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t">
            {checkoutError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4 text-sm">
                {checkoutError}
              </div>
            )}
            {!isAuthenticated ? (
              <div className="space-y-4">
                <p className="text-center text-sm text-gray-600">
                  Você precisa estar logado para finalizar a compra
                </p>
                <Button className="w-full" size="lg" onClick={onLoginClick}>
                  Entrar para finalizar
                </Button>
              </div>
            ) : (
              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={isProcessingPayment || (shippingOptions.length > 0 && !selectedShippingOption)} // Disable if shipping options available but none selected
              >
                {isProcessingPayment ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                       ></path>
                     </svg>
                     Processando...
                   </span>
                 ) : (
                   <span className="flex items-center">
                     <CreditCard className="mr-2 h-5 w-5" /> Finalizar Compra
                   </span>
                 )}
               </Button>
             )}
             <p className="text-xs text-center text-muted-foreground mt-2">
               Checkout seguro via Mercado Pago
             </p>
             <div className="mercado-pago-checkout hidden"></div>
           </div>
         )}
       </motion.div>
     </>
   );
 };

export default CartSidebar;
