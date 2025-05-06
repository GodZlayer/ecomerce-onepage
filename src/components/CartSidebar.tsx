import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Trash2, Plus, Minus, ShoppingBag, CreditCard } from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import {
  loadMercadoPagoScript,
  createPreference,
  initMercadoPago,
} from "@/lib/mercadopago";
import { useCart } from "./CartContext";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  cartItems?: CartItem[];
  updateQuantity?: (id: number, quantity: number) => void;
  removeItem?: (id: number) => void;
  isAuthenticated?: boolean;
  onLoginClick?: () => void;
}

const CartSidebar = ({
  isOpen = false,
  onClose = () => {},
  cartItems = [],
  updateQuantity = () => {},
  removeItem = () => {},
  isAuthenticated = false,
  onLoginClick = () => {},
}: CartSidebarProps) => {
  const { cartItems: globalCartItems, updateCartItemQuantity, removeFromCart } = useCart();
  const items = cartItems.length > 0 ? cartItems : globalCartItems;

  const [shippingInfo, setShippingInfo] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
  });

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateCartItemQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = 5.99;
  const total = subtotal + shipping;

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

    if (!shippingInfo.name || !shippingInfo.email || !shippingInfo.address) {
      setCheckoutError("Please fill in all required shipping information");
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
        payer: {
          name: shippingInfo.name.split(" ")[0] || "",
          surname: shippingInfo.name.split(" ").slice(1).join(" ") || "",
          email: shippingInfo.email,
          address: {
            street_name: shippingInfo.address,
            zip_code: shippingInfo.zipCode,
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
              {items.map((item) => (
                <div key={item.id} className="flex items-center py-4 border-b">
                  <div className="h-20 w-20 rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-muted-foreground">
                      R$ {item.price.toFixed(2)}
                    </p>
                    <div className="flex items-center mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="mx-2 w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="font-medium">
                      R$ {(item.price * item.quantity).toFixed(2)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 mt-2"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-4">Resumo do Pedido</h3>
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Frete</span>
                  <span>R$ {shipping.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-4">
                  Informações de Entrega
                </h3>
                <div className="space-y-3">
                  <div>
                    <Input
                      name="name"
                      placeholder="Nome completo"
                      value={shippingInfo.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Input
                      name="email"
                      type="email"
                      placeholder="E-mail"
                      value={shippingInfo.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Input
                      name="address"
                      placeholder="Endereço"
                      value={shippingInfo.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      name="city"
                      placeholder="Cidade"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                    />
                    <Input
                      name="zipCode"
                      placeholder="CEP"
                      value={shippingInfo.zipCode}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
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
                disabled={isProcessingPayment}
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
