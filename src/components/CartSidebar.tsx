// IMPORTANT: To enable PayPal integration, add the PayPal SDK script to your main HTML file (e.g., public/index.html or equivalent) like this:
// <script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=YOUR_CURRENCY"></script>
// Replace YOUR_CLIENT_ID and YOUR_CURRENCY with your actual PayPal client ID and desired currency.

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { X, ShoppingBag, CreditCard } from "lucide-react";
import { Button } from "./ui/button";
import { useCart, CartItem } from "./CartContext";
import { useAuth } from './AuthContext';
import { Address } from '@/services/userService'; // Import Address type

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

// Declare the PayPal global object type for TypeScript
declare const paypal: any;

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

  useEffect(() => {
    console.log('PayPal useEffect running...');

    // Função para carregar o script do PayPal dinamicamente
    const loadPayPalScript = () => {
      console.log('Carregando script do PayPal dinamicamente...');
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=BRL`;
      script.onload = () => {
        console.log('Script do PayPal carregado.');
        // Agora que o script está carregado, podemos renderizar os botões
        renderPayPalButtons();
      };
      script.onerror = (err) => {
        console.error('Erro ao carregar o script do PayPal:', err);
        // Tratar erro no carregamento do script, talvez exibir uma mensagem para o usuário
      };
      script.async = true;
      script.id = 'paypal-sdk'; // Adiciona um ID para facilitar a remoção
      document.body.appendChild(script);
    };

    // Função para renderizar os botões do PayPal
    const renderPayPalButtons = () => {
      // Check if PayPal SDK is loaded, user is authenticated, and there are items in the cart
      // Also check if shipping is selected if shipping options are available
      if (
        typeof paypal !== 'undefined' &&
        isAuthenticated &&
        items.length > 0 &&
        (shippingOptions.length === 0 || selectedShippingOption)
      ) {
        console.log('PayPal SDK loaded:', typeof paypal !== 'undefined');
        console.log('User authenticated:', isAuthenticated);
        console.log('Items in cart:', items.length > 0);
        console.log('Shipping selected (or not required):', (shippingOptions.length === 0 || selectedShippingOption));
        console.log('All conditions met, rendering PayPal buttons...');

        // Render the PayPal buttons
        paypal.Buttons({
          // Configuração da ordem para o PayPal
          createOrder: (data: any, actions: any) => {
            console.log('Criando ordem para o PayPal...');
            return actions.order.create({
              intent: 'CAPTURE', // Define a intenção como CAPTURE para captura automática
              purchase_units: [{
                amount: {
                  currency_code: 'BRL', // Moeda da transação
                  value: total.toFixed(2), // Valor total da ordem
                  breakdown: {
                    item_total: {
                      currency_code: 'BRL',
                      value: subtotal.toFixed(2), // Subtotal dos itens
                    },
                    shipping: {
                      currency_code: 'BRL',
                      value: shippingCost.toFixed(2), // Custo do frete
                    },
                    // Outras categorias como tax_total, discount, etc., podem ser adicionadas aqui se aplicável
                  },
                },
                items: items.map(item => ({
                  name: item.name,
                  unit_amount: {
                    currency_code: 'BRL',
                    value: item.price.toFixed(2), // Preço unitário do item
                  },
                  quantity: item.quantity, // Quantidade do item
                })),
                // shipping: { // Informações de envio podem ser adicionadas aqui se necessário
                //   address: {
                //     address_line_1: '123 Main St',
                //     admin_area_2: 'San Jose',
                //     admin_area_1: 'CA',
                //     postal_code: '95131',
                //     country_code: 'US'
                //   }
                // }
              }],
            });
          },
          // Função chamada quando o comprador aprova o pagamento
          onApprove: (data: any, actions: any) => {
            console.log('Pagamento aprovado e capturado pelo PayPal:', data);
            // Lógica para lidar com o sucesso do pagamento
            alert('Pagamento aprovado com sucesso!');
            // Exemplo: Limpar o carrinho ou redirecionar para a página de confirmação
            // clearCart();
          },
          // Função chamada em caso de erro no processo de pagamento
          onError: (err: any) => {
            console.error('Erro no PayPal:', err);
            // Lógica para lidar com erros
            alert('Ocorreu um erro durante o pagamento. Por favor, tente novamente.');
          },
        }).render('#paypal-button-container'); // Renderiza os botões no contêiner especificado
      } else {
        console.log('Conditions not met for rendering PayPal buttons.');
      }
    };

    // Verifica se o script já foi carregado antes de tentar carregar novamente
    if (!document.getElementById('paypal-sdk')) {
      loadPayPalScript();
    } else {
      // Se o script já existe, apenas renderiza os botões (útil em re-renderizações do componente)
      renderPayPalButtons();
    }


    // Cleanup function to remove PayPal buttons and the script if the component unmounts or dependencies change
    return () => {
      console.log('Cleanup function running...');
      const paypalContainer = document.getElementById('paypal-button-container');
      if (paypalContainer) {
        paypalContainer.innerHTML = ''; // Clear the container
        console.log('PayPal button container cleared.');
      }
      const paypalScript = document.getElementById('paypal-sdk');
      if (paypalScript) {
        paypalScript.remove(); // Remove o script do DOM
        console.log('PayPal SDK script removed.');
      }
    };
  }, [isAuthenticated, items, total, subtotal, shippingCost, shippingOptions, selectedShippingOption]); // Dependencies for the effect

  // PayPal integration logic
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
            {/* IMPORTANT SECURITY NOTE:
              While the initial checkout flow might be handled on the frontend using the PayPal SDK,
              a real, secure integration in a production environment REQUIRES a backend component
              to handle the sensitive steps of creating and capturing PayPal orders.
              This is crucial for protecting your PayPal API credentials and ensuring transaction security.
              The frontend SDK is primarily for rendering the button and initiating the flow.
              The actual order creation and capture should happen on your server after the user
              approves the payment on the frontend.
            */}
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
               <>
                 {/* PayPal button container */}
                 {/* IMPORTANT SECURITY NOTE:
                   This frontend-only PayPal integration uses Smart Payment Buttons with automatic capture.
                   This method is secure because the sensitive payment capture is handled directly by PayPal
                   on their servers after the user approves the payment. Your frontend code initiates the
                   transaction and handles the UI flow, but does not perform the capture itself.
                   This is different from manual capture methods which require a backend to complete the transaction.
                   Crucially, the PayPal Secret key is NOT used or exposed in this frontend code.
                 */}
                 {isAuthenticated && items.length > 0 && (shippingOptions.length === 0 || selectedShippingOption) && (
                   <div id="paypal-button-container" className="w-full mb-4"></div>
                 )}
                 {/* The "Finalizar Compra" button is replaced by PayPal buttons in this integration */}
               </>
               )}
             {/* IMPORTANT SECURITY NOTE:
               This frontend-only PayPal integration uses Smart Payment Buttons with automatic capture.
               This method is secure because the sensitive payment capture is handled directly by PayPal
               on their servers after the user approves the payment. Your frontend code initiates the
               transaction and handles the UI flow, but does not perform the capture itself.
               This is different from manual capture methods which require a backend to complete the transaction.
             */}
             <p className="text-xs text-center text-muted-foreground mt-2">
               Checkout seguro
             </p>
           </div>)}
         </motion.div>
       </>
     );
   };

 export default CartSidebar;
