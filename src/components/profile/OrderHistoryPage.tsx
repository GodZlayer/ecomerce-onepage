// ecomerce/src/components/profile/OrderHistoryPage.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthContext'; // Assuming AuthContext is in components/AuthContext
import { getOrderHistory } from '@/services/orderService'; // Assuming orderService is in services/orderService
import { Link } from 'react-router-dom';

interface Order {
  id?: string;
  userId: string;
  totalPrice: number;
  orderDate: any; // Refine with Firebase Timestamp type if needed
  status: string;
  // Add other relevant order fields
}

interface OrderHistoryPageProps {
  onViewDetailsClick: (orderId: string) => void;
}

const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ onViewDetailsClick }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        setError("User not logged in.");
        return;
      }

      try {
        setLoading(true);
        const userOrders = await getOrderHistory(user.id);
        setOrders(userOrders);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching order history:", err);
        setError("Failed to fetch order history.");
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]); // Refetch orders when user changes

  if (loading) {
    return <div className="text-center text-gray-500">Carregando histórico de compras...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (orders.length === 0) {
    return <div className="text-center text-gray-500">Você ainda não fez nenhuma compra.</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-4">Histórico de Compras</h2>
      {orders.map(order => (
        <div key={order.id} className="border rounded-md p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">Pedido #{order.id?.substring(0, 8)}</p> {/* Display a truncated ID */}
            <p className="text-sm text-gray-600">Data: {order.orderDate ? new Date(order.orderDate.seconds * 1000).toLocaleDateString() : 'N/A'}</p> {/* Format date */}
            <p className="text-sm text-gray-600">Total: R$ {order.totalPrice.toFixed(2)}</p>
            <p className="text-sm text-gray-600">Status: {order.status}</p>
          </div>
          {/* Change Link to button/span with onClick */}
          <button
            className="text-blue-600 hover:underline"
            onClick={() => order.id && onViewDetailsClick(order.id)}
          >
            Ver Detalhes
          </button>
        </div>
      ))}
    </div>
  );
};

export default OrderHistoryPage;