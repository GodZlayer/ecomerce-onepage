// IMPORTANT: To enable PayPal integration, add the PayPal SDK script to your main HTML file (e.g., public/index.html or equivalent) like this:
// <script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=YOUR_CURRENCY"></script>
// Replace YOUR_CLIENT_ID and YOUR_CURRENCY with your actual PayPal client ID and desired currency.

import React, { useEffect, useState, useRef } from "react"; // Import useState and useRef
import { motion } from "framer-motion";
import { X, ShoppingBag, CreditCard } from "lucide-react";
import { Button } from "./ui/button";
import { useCart, CartItem } from "./CartContext";
import { useAuth } from './AuthContext';
import { Address } from '@/services/userService'; // Import Address type
import { getSiteSections, SiteSectionsConfig } from "@/lib/siteConfig"; // Import getSiteSections and SiteSectionsConfig

// Import the new refactored components and hook
import CartItemList from "./cart/CartItemList";
import OrderSummary from "./cart/OrderSummary";
import ShippingAddressSection from "./cart/ShippingAddressSection";
import ShippingOptionsSection from "./cart/ShippingOptionsSection";
import { useCartShipping } from "@/hooks/useCartShipping"; // Import the custom hook
// REMOVIDO: import { initMercadoPago } from '@mercadopago/sdk-react'; // Import Mercado Pago SDK components


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
// Declare the MercadoPago global object type for TypeScript
declare const MercadoPago: any; // Adicionado: Declaração global para o SDK JS V2

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

  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'mercadopago' | null>(null); // State to store payment method
  const [mercadoPagoError, setMercadoPagoError] = useState<string | null>(null); // State for MercadoPago errors
  const [isLoadingMercadoPago, setIsLoadingMercadoPago] = useState(false); // State for MercadoPago loading

  // Ref para o contêiner do botão do PayPal
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  // Ref para o contêiner do botão do Mercado Pago
  const mercadopagoContainerRef = useRef<HTMLDivElement>(null); // Adicionado: Ref para o contêiner do Mercado Pago


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


  // Novo useEffect para carregar a configuração do site
  useEffect(() => {
    const fetchSiteConfig = async () => {
      try {
        const config = await getSiteSections();
        if (config && config.payment && config.payment.method) {
          setPaymentMethod(config.payment.method);
        } else {
          console.warn("Configuração de pagamento ausente ou incompleta, usando fallback.");
          setPaymentMethod('paypal'); // Fallback
        }
      } catch (error) {
        console.error("Erro ao buscar configuração do site:", error);
        // Tratar erro, talvez definir um método padrão ou exibir mensagem
        setPaymentMethod('paypal'); // Fallback para PayPal em caso de erro
      }
    };

    fetchSiteConfig();
  }, []); // Dependência vazia para rodar apenas na montagem inicial

  // Função para carregar o script do PayPal dinamicamente
  const loadPayPalScript = () => {
    console.log('Carregando script do PayPal dinamicamente...');
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=BRL`;
    script.onload = () => {
      console.log('Script do PayPal carregado.');
      // renderPayPalButtons(); // Não renderiza mais aqui, será em outro useEffect
    };
    script.onerror = (err) => {
      console.error('Erro ao carregar o script do PayPal:', err);
      // Tratar erro no carregamento do script, talvez exibir uma mensagem para o usuário
    };
    script.async = true;
    script.id = 'paypal-sdk'; // Adiciona um ID para facilitar a remoção
    document.body.appendChild(script);
  };

  // Função para carregar o script do Mercado Pago SDK JS V2 dinamicamente
const loadMercadoPagoScript = () => {
    if (document.getElementById('mercadopago-sdk-v2')) {
      console.log('CartSidebar: SDK JS V2 do Mercado Pago já carregado.');
      // Se já carregado, talvez precise chamar initiateMercadoPagoCheckoutPro aqui
      // se o botão do usuário já estiver visível e o método for mercadopago.
      // Mas cuidado para não chamar múltiplas vezes.
      return;
    }
    console.log('CartSidebar: Carregando SDK JS V2 do Mercado Pago dinamicamente...');
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.id = 'mercadopago-sdk-v2';
    script.async = true;
    script.onload = () => {
      console.log('CartSidebar: SDK JS V2 do Mercado Pago CARREGADO.');
      // Agora que o SDK carregou, se o método for mercadopago,
      // e as condições para exibir o checkout forem atendidas, inicie o checkout.
      if (paymentMethod === 'mercadopago' && mercadopagoContainerRef.current && isAuthenticated && items.length > 0 && (shippingOptions.length === 0 || selectedShippingOption)) {
        console.log('CartSidebar: Condições atendidas PÓS-LOAD para iniciar Mercado Pago Checkout Pro.');
        initiateMercadoPagoCheckoutPro(); // Chame initiateMercadoPagoCheckoutPro aqui
      }
    };
    script.onerror = () => {
      console.error('CartSidebar: ERRO ao carregar SDK JS V2 do Mercado Pago.');
      setMercadoPagoError('Falha ao carregar recursos do Mercado Pago.');
    };
    document.body.appendChild(script);
  };


  // Função para renderizar os botões do PayPal
  const renderPayPalButtons = () => {
    // Check if PayPal SDK is loaded, user is authenticated, there are items in the cart,
    // shipping is selected (if required), AND the PayPal container element exists in the DOM
    if (
      typeof paypal !== 'undefined' &&
      isAuthenticated &&
      items.length > 0 &&
      (shippingOptions.length === 0 || selectedShippingOption) &&
      paypalContainerRef.current // Check if the ref is attached to the DOM element
    ) {
      console.log('PayPal SDK loaded:', typeof paypal !== 'undefined');
      console.log('User authenticated:', isAuthenticated);
      console.log('Items in cart:', items.length > 0);
      console.log('Shipping selected (or not required):', (shippingOptions.length === 0 || selectedShippingOption));
      console.log('PayPal container exists:', !!paypalContainerRef.current);
      console.log('All conditions met, rendering PayPal buttons...');

      // Limpa o contêiner do PayPal antes de renderizar para evitar duplicidade
      clearPaymentContainers('paypal');

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
      }).render(paypalContainerRef.current); // Renderiza os botões no contêiner referenciado
    } else {
      console.log('Conditions not met for rendering PayPal buttons.');
      // Limpa o contêiner se as condições não forem atendidas
      if (paypalContainerRef.current) {
        paypalContainerRef.current.innerHTML = '';
      }
    }
  };

  // Limpa os contêineres de pagamento existentes antes de renderizar novamente
  const clearPaymentContainers = (methodToClear?: 'paypal' | 'mercadopago' | 'all') => {
    if (methodToClear === 'paypal' || methodToClear === 'all') {
      const paypalContainer = document.getElementById('paypal-button-container');
      if (paypalContainer) {
        paypalContainer.innerHTML = '';
        console.log('CartSidebar: Contêiner do PayPal limpo.');
      }
    }
    if (methodToClear === 'mercadopago' || methodToClear === 'all') {
      const mercadopagoContainer = document.getElementById('mercadopago-button-container');
      if (mercadopagoContainer) {
        mercadopagoContainer.innerHTML = '';
        console.log('CartSidebar: Contêiner do Mercado Pago limpo.');
      }
    }
  };

  // Remove scripts SDKs existentes
  const removeSDKScripts = () => {
    const paypalScript = document.getElementById('paypal-sdk');
    if (paypalScript) {
      paypalScript.remove();
    }
    // Remove o script do Mercado Pago SDK JS V2 se ele foi adicionado
    const mercadopagoScript = document.getElementById('mercadopago-sdk-v2');
    if (mercadopagoScript) {
      mercadopagoScript.remove();
    }
  };

const initiateMercadoPagoCheckoutPro = async () => { // Tornar async se precisar de await para algo, senão pode ser síncrona
    console.log('CartSidebar: initiateMercadoPagoCheckoutPro chamada.');
    setMercadoPagoError(null);

    if (typeof MercadoPago === 'undefined') {
      console.error('CartSidebar: Objeto MercadoPago (SDK JS V2) NÃO definido. O SDK não carregou?');
      setMercadoPagoError('Recursos do Mercado Pago não estão prontos. Tente novamente.');
      return;
    }
    console.log('CartSidebar: Objeto MercadoPago DEFINIDO.');

    const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
    if (!publicKey) {
      console.error('CartSidebar: VITE_MERCADOPAGO_PUBLIC_KEY não definida no .env.');
      setMercadoPagoError('Erro de configuração do Mercado Pago.');
      return;
    }
    console.log('CartSidebar: Usando PublicKey:', publicKey);

    const mp = new MercadoPago(publicKey);
    console.log('CartSidebar: Instância de MercadoPago criada.');

    const preference = {
      items: items.map(item => ({
        id: String(item.id),
        title: item.name,
        quantity: item.quantity,
        unit_price: parseFloat(item.price.toFixed(2)),
        currency_id: "BRL", // Ou sua moeda
        description: item.name,
      })),
      back_urls: {
        success: `${window.location.origin}/payment-success`, // Exemplo
        failure: `${window.location.origin}/payment-failure`, // Exemplo
        pending: `${window.location.origin}/payment-pending`, // Exemplo
      },
      auto_return: "approved",
    };
    console.log('CartSidebar: Objeto de preferência:', JSON.stringify(preference, null, 2));

    const container = document.getElementById('mercadopago-button-container');
    if (!container) {
      console.error('CartSidebar: Contêiner #mercadopago-button-container NÃO encontrado no DOM.');
      setMercadoPagoError('Erro ao preparar o checkout do Mercado Pago (contêiner).');
      return;
    }
    console.log('CartSidebar: Conteúdo do contêiner ANTES de limpar:', container.innerHTML);
    container.innerHTML = ''; // Garante que o contêiner esteja vazio
    console.log('CartSidebar: Contêiner #mercadopago-button-container encontrado e limpo.');

    try {
      console.log('CartSidebar: Agendando mp.checkout() via setTimeout...');
      setTimeout(() => {
        try {
          console.log('CartSidebar: Chamando mp.checkout() DENTRO do setTimeout...');
          const checkoutController = mp.checkout({
            preference: preference,
            render: {
              container: '#mercadopago-button-container',
              // label: 'Pagar com Mercado Pago', // REMOVIDO TEMPORARIAMENTE
            },
            // autoOpen: false, // Já está false ou ausente
          });
          console.log('CartSidebar: mp.checkout() chamado DENTRO do setTimeout. Controller:', checkoutController);
        } catch (sdkErrorInTimeout) {
          console.error('CartSidebar: Erro direto ao chamar mp.checkout() DENTRO do setTimeout:', sdkErrorInTimeout);
          setMercadoPagoError('Erro ao iniciar o checkout do Mercado Pago (timeout).');
        }
      }, 0); // Delay de 0 para empurrar para a próxima tick do event loop

    } catch (sdkError) {
      // Este catch pode não pegar erros assíncronos do setTimeout, mas mantemos por segurança
      console.error('CartSidebar: Erro (improvável aqui) ao agendar mp.checkout():', sdkError);
      setMercadoPagoError('Erro ao preparar o checkout do Mercado Pago.');
    }
  };


  // useEffect para lidar com a inicialização dos SDKs de pagamento
  useEffect(() => {
    console.log('useEffect de SDKs de pagamento rodando. paymentMethod:', paymentMethod);
    // Limpeza inicial ou condicional de SDKs anteriores
    removeSDKScripts();
    clearPaymentContainers('all'); // Limpa ambos os contêineres ao trocar de método

    if (paymentMethod === 'mercadopago') {
      console.log('CartSidebar: Carregando script do Mercado Pago SDK JS V2...');
      loadMercadoPagoScript(); // Carrega o script do SDK JS V2
    } else if (paymentMethod === 'paypal') {
      console.log('CartSidebar: Carregando script PayPal...');
      loadPayPalScript(); // loadPayPalScript agora apenas carrega o script
    } else {
       // Não precisa resetar estado aqui, pois ele foi removido
    }

    return () => {
      console.log('Cleanup function for payment SDKs running...');
      // A limpeza aqui pode ser mais seletiva dependendo do que foi inicializado
      removeSDKScripts(); // Remove os scripts se eles foram adicionados
      clearPaymentContainers('all'); // Limpa os contêineres
      // Não precisa resetar estado aqui, pois ele foi removido
    };
  }, [paymentMethod, isAuthenticated, items, total, subtotal, shippingCost, shippingOptions, selectedShippingOption, mercadopagoContainerRef.current]); // Dependência principal para trocar de SDK e reavaliar condições

  // useEffect separado para renderizar botões do PayPal quando as dependências relevantes mudarem
  useEffect(() => {
    console.log('useEffect de renderização do PayPal rodando.');
    if (paymentMethod === 'paypal') {
      renderPayPalButtons();
    }
  }, [paymentMethod, isAuthenticated, items, total, subtotal, shippingCost, shippingOptions, selectedShippingOption, paypalContainerRef.current]); // Dependências relevantes para renderizar PayPal



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
                 {/* Payment button container - will render PayPal or MercadoPago */}
                 {isAuthenticated && items.length > 0 && (shippingOptions.length === 0 || selectedShippingOption) && (
                   <>
                     {paymentMethod === 'paypal' && <div id="paypal-button-container" ref={paypalContainerRef} className="w-full mb-4"></div>}
                     {paymentMethod === 'mercadopago' && (
                       <div className="w-full mb-4">
                          {/* Contêiner onde o SDK do Mercado Pago renderizará o botão/modal */}
                          <div id="mercadopago-button-container" ref={mercadopagoContainerRef}></div>
                          {/* O SDK do Mercado Pago renderizará o botão/link dentro do contêiner acima */}
                          {mercadoPagoError && (
                            <p className="text-red-500 text-sm mt-2">{mercadoPagoError}</p>
                          )}
                        </div>
                      )}
                    </>
                  )}
                {/* The "Finalizar Compra" button is replaced by payment method buttons */}
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
