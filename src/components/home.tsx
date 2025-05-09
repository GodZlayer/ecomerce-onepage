import React, { useState, useEffect, useRef } from "react";
import { ShoppingCart, User } from "lucide-react";
import ProfileModal from "./profile/ProfileModal.tsx"; // Import ProfileModal
import ProductGallery from "./ProductGallery";
import CartSidebar from "./CartSidebar";
import { Button } from "./ui/button";
import About from "./about";
import Contact from "./contact";
import AuthModal from "./AuthModal";
import { useAuth } from "./AuthContext";
import { useCart } from "./CartContext";
import { getAllProducts, Product as FirestoreProduct } from "@/lib/products";
import { getSiteSections, SiteSectionsConfig, getSiteContentConfig, SiteContentConfig } from "@/lib/siteConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faUser, faShoppingCart, faSearch, faEdit, faTrash, faPlus, faCheck, faTimes, faHome, faEnvelope, faPhone, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom"; // Import Link

const FA_ICONS = {
  faStar,
  faUser,
  faShoppingCart,
  faSearch,
  faEdit,
  faTrash,
  faPlus,
  faCheck,
  faTimes,
  faHome,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
};

const Home = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // State for profile modal
  const [activeProfileSection, setActiveProfileSection] = useState<'orders' | 'addresses' | 'orderDetails'>('orders'); // State for active section
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null); // State for selected order ID
  const { user, isAuthenticated, logout } = useAuth();
  const { cartItems, addToCart, updateCartItemQuantity, removeFromCart, cartItemCount } = useCart();
  const [products, setProducts] = useState<FirestoreProduct[]>([]);
  const [siteSections, setSiteSections] = useState<SiteSectionsConfig | null>(null);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [siteContent, setSiteContent] = useState<SiteContentConfig | null>(null);

  useEffect(() => {
    getAllProducts().then(setProducts);
  }, []);

  useEffect(() => {
    getSiteSections().then((data) => {
      setSiteSections(data);
      setSectionsLoading(false);
    });
    getSiteContentConfig().then(setSiteContent);
  }, []);

  useEffect(() => {
    if (siteContent?.siteTitle) {
      document.title = siteContent.siteTitle;
    }
    if (siteContent?.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = siteContent.faviconUrl;
    }
  }, [siteContent]);

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            {siteContent ? (
              siteContent.logoMode === 'image' && siteContent.logoImageUrl ? (
                <img
                  src={siteContent.logoImageUrl}
                  alt={siteContent.logoText}
                  style={{
                    width: `${siteContent.logoImageSizePercent || 100}px`
                  }}
                />
              ) : siteContent.logoMode === 'both' && siteContent.logoImageUrl ? (
                <>
                  <img
                    src={siteContent.logoImageUrl}
                    alt={siteContent.logoText}
                    style={{
                      width: `${siteContent.logoImageSizePercent || 100}px`
                    }}
                  />
                  <h1 className="text-2xl font-bold text-primary">{siteContent.logoText}</h1>
                </>
              ) : (
                <h1 className="text-2xl font-bold text-primary">{siteContent.logoText}</h1>
              )
            ) : (
              <h1 className="text-2xl font-bold text-primary">TGDevs</h1>
            )}
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
                  {/* Link to open profile modal */}
                  <div
                    className="cursor-pointer text-sm text-gray-700 hover:text-primary hover:underline"
                    onClick={() => setIsProfileModalOpen(true)}
                  >
                    <span>
                      Olá, {user?.name}
                    </span>
                  </div>
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
          {sectionsLoading ? (
            <div className="text-center text-gray-400 py-8">Carregando...</div>
          ) : siteSections?.sectionsAtivas.top ? (
            <section id="top" className="py-12 mb-12 scroll-mt-20">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h1 className="text-4xl font-bold mb-4">{siteSections.top.title}</h1>
                  <p className="text-xl text-gray-600 mb-6">{siteSections.top.subtitle}</p>
                  <div className="flex space-x-4">
                    {siteSections.top.actionButton1 && (
                      <a href={siteSections.top.actionButton1.url || "#products"}>
                        <Button size="lg">{siteSections.top.actionButton1.label || "Comprar Agora"}</Button>
                      </a>
                    )}
                    {siteSections.top.actionButton2 && (
                      <a href={siteSections.top.actionButton2.url || "#about"}>
                        <Button variant="outline" size="lg">
                          {siteSections.top.actionButton2.label || "Saiba Mais"}
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
                <div className="rounded-lg overflow-hidden shadow-xl">
                  <img
                    src={siteSections.top.imageUrl || "https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=800&q=80"}
                    alt="Shopping"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </section>
          ) : null}
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
              <h2 className="text-3xl font-bold mb-2">{siteSections?.features?.title}</h2>
              <p className="text-gray-600">{siteSections?.features?.subtitle}</p>
            </div>
            {sectionsLoading ? (
              <div className="text-center text-gray-400 py-8">Carregando benefícios...</div>
            ) : siteSections?.features?.benefits?.length ? (
              <div className="grid md:grid-cols-3 gap-8">
                {siteSections.features.benefits.map((benefit, idx) => {
                  let IconComponent = null;
                  let isFa = false;
                  if (benefit.icon?.startsWith("fa") && FA_ICONS[benefit.icon]) {
                    isFa = true;
                  } else {
                    try {
                      IconComponent = require("lucide-react")[benefit.icon];
                    } catch {}
                  }
                  return (
                    <div key={idx} className="bg-white p-6 rounded-lg shadow-md text-center">
                      <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        {isFa ? (
                          <FontAwesomeIcon icon={FA_ICONS[benefit.icon]} className="h-8 w-8 text-primary" />
                        ) : IconComponent ? (
                          <IconComponent className="h-8 w-8 text-primary" />
                        ) : (
                          <span className="inline-block w-12 h-12 rounded-full bg-gray-200" />
                        )}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">Nenhum benefício cadastrado.</div>
            )}
          </section>

          {/* About Section */}
          {siteSections?.sectionsAtivas.about && (
            <section id="about" className="mb-12 py-8 scroll-mt-20">
              <About title={siteSections.about.title} content={siteSections.about.content} />
            </section>
          )}

          {/* Seção de Contato */}
          {siteSections?.sectionsAtivas.contact && (
            <section id="contact" className="mb-12 py-8 scroll-mt-20">
              <Contact title={siteSections.contact.title} email={siteSections.contact.email} phone={siteSections.contact.phone} />
            </section>
          )}
        </main>

        {/* Cart Sidebar */}
        <CartSidebar
          isOpen={isCartOpen}
          onClose={toggleCart}
          cartItems={cartItems}
          updateQuantity={(id, quantity) => updateCartItemQuantity(String(id), quantity)}
          removeItem={id => removeFromCart(String(id))}
          isAuthenticatedProp={isAuthenticated}
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
        {siteSections?.sectionsAtivas.footer && (
          <footer className="bg-gray-100 py-8 mt-12">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">{siteSections.footer.footerColumn1.title}</h3>
                  <p className="text-gray-600">
                    {siteSections.footer.footerColumn1.description}
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
                      <a href="#products" className="text-gray-600 hover:text-primary">
                        Produtos
                      </a>
                    </li>
                    <li>
                      <a href="#about" className="text-gray-600 hover:text-primary">
                        Sobre
                      </a>
                    </li>
                    <li>
                      <a href="#contact" className="text-gray-600 hover:text-primary">
                        Contato
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Fale Conosco</h3>
                  <p className="text-gray-600">
                    {siteSections.footer.footerColumn3.split('\n').map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        {index < siteSections.footer.footerColumn3.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </p>
                </div>
              </div>
              <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-500">
                <p>{siteSections.footer.text} | Desenvolvimento e tecnologia por <a href="https://tgdevs.pp.ua" target="_blank" rel="noopener">TG Devs</a></p>
              </div>
            </div>
          </footer>
        )}

        {/* Profile Modal */}
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          activeSection={activeProfileSection}
          selectedOrderId={selectedOrderId}
          setActiveSection={setActiveProfileSection}
          setSelectedOrderId={setSelectedOrderId}
        />
      </div>
    );
  };

export default Home;
