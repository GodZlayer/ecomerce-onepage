// ecomerce/src/components/profile/OrderDetailsPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrderDetails } from '@/services/orderService'; // Assuming orderService is in services/orderService

interface OrderDetailsPageProps {
  orderId: string | null;
}

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  // Add other relevant item fields
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface DeliveryInfo {
  melhorEnvioId?: string;
  trackingNumber?: string;
  carrier?: string;
  serviceName?: string;
  shippingCost?: number;
  estimatedDeliveryDate?: string;
  trackingHistory?: { status: string; timestamp: any }[];
  labelUrl?: string;
}

interface Order {
  id?: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  orderDate: any; // Refine with Firebase Timestamp type if needed
  status: string;
  shippingAddress: ShippingAddress;
  deliveryInfo?: DeliveryInfo;
  // Add other relevant order fields
}

const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({ orderId }) => {
  // Remove useParams as orderId is now a prop
  // const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [trackingStatus, setTrackingStatus] = useState<any>(null); // State for Melhor Envio tracking

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setLoading(false);
        setError("Order ID is missing.");
        return;
      }

      try {
        setLoading(true);
        const orderData = await getOrderDetails(orderId);
        setOrder(orderData);

        // // Fetch Melhor Envio tracking status if order and tracking number exist
        // if (orderData?.deliveryInfo?.melhorEnvioId) {
        //   // NOTE: Ensure getMelhorEnvioShipmentStatus is secure to call from frontend
        //   const status = await getMelhorEnvioShipmentStatus(orderData.deliveryInfo.melhorEnvioId);
        //   setTrackingStatus(status);
        // }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Failed to fetch order details.");
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]); // Refetch order when orderId changes

  if (loading) {
    return <div className="text-center text-gray-500">Carregando detalhes do pedido...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!order) {
    return <div className="text-center text-gray-500">Pedido não encontrado.</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Detalhes do Pedido #{order.id?.substring(0, 8)}</h2>

      {/* Order Summary */}
      <div className="border rounded-md p-4">
        <h3 className="text-xl font-semibold mb-2">Resumo do Pedido</h3>
        <p>Data do Pedido: {order.orderDate ? new Date(order.orderDate.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
        <p>Status: {order.status}</p>
        <p>Total: R$ {order.totalPrice.toFixed(2)}</p>
      </div>

      {/* Shipping Address */}
      <div className="border rounded-md p-4">
        <h3 className="text-xl font-semibold mb-2">Endereço de Entrega</h3>
        <p>{order.shippingAddress.street}, {order.shippingAddress.city} - {order.shippingAddress.state}, {order.shippingAddress.zipCode}</p>
        <p>{order.shippingAddress.country}</p>
      </div>

      {/* Items */}
      <div className="border rounded-md p-4">
        <h3 className="text-xl font-semibold mb-2">Itens do Pedido</h3>
        <ul className="space-y-2">
          {order.items.map((item, index) => (
            <li key={index} className="flex justify-between text-sm text-gray-700">
              <span>{item.name} (x{item.quantity})</span>
              <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Delivery Info (Melhor Envio) */}
      {order.deliveryInfo && (
        <div className="border rounded-md p-4">
          <h3 className="text-xl font-semibold mb-2">Informações de Entrega</h3>
          <p>Melhor Envio ID: {order.deliveryInfo.melhorEnvioId || 'N/A'}</p>
          <p>Número de Rastreio: {order.deliveryInfo.trackingNumber || 'N/A'}</p>
          <p>Transportadora: {order.deliveryInfo.carrier || 'N/A'}</p>
          <p>Serviço: {order.deliveryInfo.serviceName || 'N/A'}</p>
          <p>Custo do Frete: R$ {order.deliveryInfo.shippingCost?.toFixed(2) || 'N/A'}</p>
          <p>Previsão de Entrega: {order.deliveryInfo.estimatedDeliveryDate || 'N/A'}</p>
          {order.deliveryInfo.labelUrl && (
            <p><a href={order.deliveryInfo.labelUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ver Etiqueta de Frete</a></p>
          )}

          {/* Tracking History */}
          {/* {trackingStatus && trackingStatus.history && trackingStatus.history.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Histórico de Rastreio:</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                {trackingStatus.history.map((event: any, index: number) => (
                  <li key={index}>
                    {event.status} - {new Date(event.timestamp).toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
          )} */}
           {order.deliveryInfo.trackingHistory && order.deliveryInfo.trackingHistory.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Histórico de Rastreio (Firestore):</h4>
              <ul className="space-y-1 text-sm text-gray-700">
                {order.deliveryInfo.trackingHistory.map((event: any, index: number) => (
                  <li key={index}>
                    {event.status} - {event.timestamp ? new Date(event.timestamp.seconds * 1000).toLocaleString() : 'N/A'}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderDetailsPage;