import React, { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Search, SlidersHorizontal } from "lucide-react";
import { getCategoriaFiltro, CategoriaFiltro } from "@/lib/siteConfig";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  width?: number; // Added for shipping calculation
  height?: number; // Added for shipping calculation
  length?: number; // Added for shipping calculation
  weight?: number; // Added for shipping calculation
}

interface ProductGalleryProps {
  products?: Product[];
  onAddToCart?: (product: Product) => void;
}

const ProductGallery = ({
  products = defaultProducts,
  onAddToCart = () => {},
}: ProductGalleryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  const [catFiltro, setCatFiltro] = useState<CategoriaFiltro | null>(null);
  const [loadingCatFiltro, setLoadingCatFiltro] = useState(true);

  useEffect(() => {
    getCategoriaFiltro().then((data) => {
      setCatFiltro(data);
      setLoadingCatFiltro(false);
    });
  }, []);

  const generos = catFiltro?.generos || [];
  const tamanhos = catFiltro?.tamanhos || [];
  const cores = catFiltro?.cores || [];
  const regioes = catFiltro?.regioes || [];
  const anos = catFiltro?.anos || [];
  const categories = [
    "all",
    ...(catFiltro?.categorias || products.map((product) => product.category)),
  ];

  const [filtrosSelecionados, setFiltrosSelecionados] = useState<Record<string, string>>({});

  const handleFiltroChange = (filtro: string, valor: string) => {
    setFiltrosSelecionados((prev) => ({ ...prev, [filtro]: valor }));
  };

  const filtrosDinamicos = catFiltro ? Object.keys(catFiltro).filter(k => k !== "categorias") : [];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;
    const matchesFiltros = filtrosDinamicos.every(filtro => {
      const valorSelecionado = filtrosSelecionados[filtro];
      if (!valorSelecionado || valorSelecionado === "all") return true;
      const mapFiltroToField: Record<string, string> = {
        generos: "genero",
        tamanhos: "tamanho",
        cores: "cor",
        regioes: "regiaoTime",
        anos: "anoModelo"
      };
      const field = mapFiltroToField[filtro] || filtro;
      return String((product as any)[field]) === valorSelecionado;
    });
    return matchesSearch && matchesCategory && matchesFiltros;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return 0; // featured - no specific sort
  });

  return (
    <div className="w-full bg-white p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {filtrosDinamicos.sort((a, b) => a.localeCompare(b)).map(filtro => (
            <Select
              key={filtro}
              value={filtrosSelecionados[filtro] || "all"}
              onValueChange={valor => handleFiltroChange(filtro, valor)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder={filtro.charAt(0).toUpperCase() + filtro.slice(1)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{filtro.charAt(0).toUpperCase() + filtro.slice(1)}</SelectItem>
                {(catFiltro?.[filtro] || []).filter((v: any) => v && v !== "").map((v: any) => (
                  <SelectItem key={v} value={String(v)}>{String(v).charAt(0).toUpperCase() + String(v).slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Destaques</SelectItem>
              <SelectItem value="price-low">Preço: menor</SelectItem>
              <SelectItem value="price-high">Preço: maior</SelectItem>
              <SelectItem value="name">Nome</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="default"
            onClick={() => {
              setFiltrosSelecionados({});
              setSelectedCategory("all");
            }}
            className="h-9 px-6 flex items-center gap-2 min-w-[140px]"
          >
            <span className="inline">Limpar filtros</span>
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="all"
        value={selectedCategory}
        onValueChange={setSelectedCategory}
        className="mb-8"
      >
        <TabsList className="mb-4 flex w-full overflow-x-auto">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="capitalize">
              {category === "all" ? "Todos" : category.charAt(0).toUpperCase() + category.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id.toString()}
              name={product.name}
              price={product.price}
              image={product.image}
              category={product.category}
              onAddToCart={() => onAddToCart(product)}
              onQuickView={() => console.log(`Visualizar rapidamente ${product.name}`)}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
          <p className="text-center text-gray-500">
            Nenhum produto encontrado. Tente ajustar seus filtros.
          </p>
        </div>
      )}
    </div>
  );
};

// Default products for demonstration
const defaultProducts: Product[] = [
  {
    id: "1",
    name: "Leather Backpack",
    price: 89.99,
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
    category: "bags",
    description: "Handcrafted leather backpack with multiple compartments.",
  },
  {
    id: "2",
    name: "Wireless Headphones",
    price: 129.99,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
    category: "electronics",
    description: "Premium wireless headphones with noise cancellation.",
  },
  {
    id: "3",
    name: "Cotton T-Shirt",
    price: 24.99,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    category: "clothing",
    description: "Soft cotton t-shirt in various colors.",
  },
  {
    id: "4",
    name: "Smart Watch",
    price: 199.99,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    category: "electronics",
    description: "Smart watch with health monitoring features.",
  },
  {
    id: "5",
    name: "Running Shoes",
    price: 79.99,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    category: "footwear",
    description: "Lightweight running shoes for maximum comfort.",
  },
  {
    id: "6",
    name: "Ceramic Mug",
    price: 12.99,
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80",
    category: "home",
    description: "Handmade ceramic mug, perfect for your morning coffee.",
  },
  {
    id: "7",
    name: "Denim Jacket",
    price: 69.99,
    image:
      "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&q=80",
    category: "clothing",
    description: "Classic denim jacket that never goes out of style.",
  },
  {
    id: "8",
    name: "Sunglasses",
    price: 34.99,
    image:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
    category: "accessories",
    description: "Stylish sunglasses with UV protection.",
  },
];

export default ProductGallery;
