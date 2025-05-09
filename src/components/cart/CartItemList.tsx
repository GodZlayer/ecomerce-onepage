import React from 'react';
import { Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { useCart, CartItem } from "../CartContext"; // Assuming CartItem is exported from CartContext

interface CartItemListProps {
  items: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
}

const CartItemList: React.FC<CartItemListProps> = ({ items, updateQuantity, removeItem }) => {
  return (
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
                  updateQuantity(item.id, item.quantity - 1)
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
                  updateQuantity(item.id, item.quantity + 1)
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
              onClick={() => removeItem(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </>
  );
};

export default CartItemList;