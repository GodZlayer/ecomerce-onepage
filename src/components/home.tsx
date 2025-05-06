import React, { useState, useEffect, useRef } from "react";
import { ShoppingCart, User } from "lucide-react";
import ProductGallery from "./ProductGallery";
import CartSidebar from "./CartSidebar";
import { Button } from "./ui/button";
import About from "./about";
import Contact from "./contact";
import AuthModal from "./AuthModal";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";
import { getAllProducts, Product as FirestoreProduct } from "@/lib/products";

const Home = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { cartItems, addToCart, updateCartItemQuantity, removeFromCart, cartItemCount } = useCart();
  const [products, setProducts] = useState<FirestoreProduct[]>([]);

  useEffect(() => {
    getAllProducts().then(setProducts);
  }, []);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">E-Shop</h1>
            <nav className="hidden md:flex ml-8">
              <ul className="flex space-x-6">
                <li>
                  <a href="#top" className="text-gray-700 hover:text-primary">
                    Início
                  </a>
                </li>
                <li>
                  <a
                    href="#products"
                    className="text-gray-700 hover:text-primary"
                  >
                    Produtos
                  </a>
                </li>
                <li>
                  <a href="#about" className="text-gray-700 hover:text-primary">
                    Sobre
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-gray-700 hover:text-primary"
                  >
                    Contato
                  </a>
                </li>
              </ul>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCart}
                className="relative"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </div>
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <span className="text-sm hidden md:inline">
                  Olá, {user?.name}
                </span>
                <Button variant="outline" size="sm" onClick={logout}>
                  Sair
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAuthModalOpen(true)}
              >
                <User className="h-4 w-4 mr-2" /> Entrar
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section id="top" className="py-12 mb-12 scroll-mt-20">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl font-bold mb-4">Bem-vindo à E-Shop</h1>
              <p className="text-xl text-gray-600 mb-6">
                Descubra produtos premium com checkout seguro Mercado Pago e
                atendimento excepcional.
              </p>
              <div className="flex space-x-4">
                <a href="#products">
                  <Button size="lg">Comprar Agora</Button>
                </a>
                <a href="#about">
                  <Button variant="outline" size="lg">
                    Saiba Mais
                  </Button>
                </a>
              </div>
            </div>
            <div className="rounded-lg overflow-hidden shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=800&q=80"
                alt="Shopping"
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* Products Section */}
        <section id="products" className="mb-12 scroll-mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Nossos Produtos</h2>
            <p className="text-gray-600">
              Descubra nossa coleção de produtos de alta qualidade
            </p>
          </div>
          <ProductGallery products={products} onAddToCart={addToCart} />
        </section>

        {/* Features Section */}
        <section className="mb-12 py-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Por que escolher a gente</h2>
            <p className="text-gray-600">
              Oferecemos a melhor experiência de compra com esses benefícios
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Checkout Seguro</h3>
              <p className="text-gray-600">
                Pagamentos seguros com integração Mercado Pago
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8 text-primary"
                >
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Produtos de Qualidade</h3>
              <p className="text-gray-600">
                Itens selecionados cuidadosamente para nossos clientes
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8 text-primary"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Compra Protegida</h3>
              <p className="text-gray-600">
                Seus dados protegidos com as melhores práticas de segurança
              </p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="mb-12 py-8 scroll-mt-20">
          <About />
        </section>

        {/* Seção de Contato */}
        <section id="contact" className="mb-12 py-8 scroll-mt-20">
          <Contact />
        </section>
      </main>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={toggleCart}
        cartItems={cartItems}
        updateQuantity={(id, quantity) => updateCartItemQuantity(String(id), quantity)}
        removeItem={id => removeFromCart(String(id))}
        isAuthenticated={isAuthenticated}
        onLoginClick={() => {
          setIsCartOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Modal de Autenticação */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          // Se o carrinho estava aberto antes do login, reabra
          if (cartItems.length > 0) {
            setIsCartOpen(true);
          }
        }}
      />

      {/* Footer */}
      <footer className="bg-gray-100 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">E-Shop</h3>
              <p className="text-gray-600">
                Sua loja completa para produtos de qualidade.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#top" className="text-gray-600 hover:text-primary">
                    Início
                  </a>
                </li>
                <li>
                  <a
                    href="#products"
                    className="text-gray-600 hover:text-primary"
                  >
                    Produtos
                  </a>
                </li>
                <li>
                  <a href="#about" className="text-gray-600 hover:text-primary">
                    Sobre Nós
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-gray-600 hover:text-primary"
                  >
                    Contato
                  </a>
                </li>
                <li>
                  <a href="/admin" className="text-gray-600 hover:text-primary">
                    Admin
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Fale Conosco</h3>
              <p className="text-gray-600">
                Rua Principal, 123
                <br />
                Cidade, Estado 12345
                <br />
                info@eshop.com
                <br />
                (11) 99999-9999
              </p>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-500">
            <p>
              &copy; {new Date().getFullYear()} E-Shop. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
