import React from 'react';
import { Separator } from "../ui/separator";

interface OrderSummaryProps {
  subtotal: number;
  shippingCost: number;
  isCalculatingShipping: boolean;
  shippingCalculationError: string | null;
  selectedShippingOption: any;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  subtotal,
  shippingCost,
  isCalculatingShipping,
  shippingCalculationError,
  selectedShippingOption,
}) => {
  const total = subtotal + shippingCost;

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-lg mb-4">Resumo do Pedido</h3>
      <div className="flex justify-between mb-2">
        <span>Subtotal</span>
        <span>R$ {subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between mb-2">
        <span>Frete</span>
        {isCalculatingShipping ? (
          <span>Calculando...</span>
        ) : shippingCalculationError ? (
          <span className="text-red-500">{shippingCalculationError}</span>
        ) : selectedShippingOption ? (
          <span>R$ {shippingCost.toFixed(2)}</span>
        ) : (
          <span>Selecione o frete</span>
        )}
      </div>
      <Separator className="my-2" />
      <div className="flex justify-between font-semibold">
        <span>Total</span>
        <span>R$ {total.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default OrderSummary;