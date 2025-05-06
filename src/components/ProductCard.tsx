import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingCart, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  onAddToCart: (id: string) => void;
  onQuickView: (id: string) => void;
}

const ProductCard = ({
  id = "1",
  name = "Product Name",
  price = 99.99,
  image = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
  category = "Category",
  onAddToCart = () => {},
  onQuickView = () => {},
}: ProductCardProps) => {
  return (
    <Card className="w-full max-w-[280px] overflow-hidden transition-all duration-200 hover:shadow-lg bg-white">
      <div className="relative group">
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="absolute top-2 left-2">
          <Badge variant="secondary" className="bg-white/90 text-black">
            {category}
          </Badge>
        </div>

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button
            variant="secondary"
            size="sm"
            className="mr-2 bg-white hover:bg-gray-100"
            onClick={() => onQuickView(id)}
          >
            <Eye className="h-4 w-4 mr-1" /> Ver detalhes
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-medium text-lg truncate">{name}</h3>
        <p className="text-primary font-bold mt-1">R$ {price.toFixed(2)}</p>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button className="w-full" onClick={() => onAddToCart(id)}>
          <ShoppingCart className="h-4 w-4 mr-2" /> Adicionar ao carrinho
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
