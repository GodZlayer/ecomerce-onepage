import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, setDoc, query, where, orderBy } from "firebase/firestore";

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  weight: number; // in kg or grams, consistent unit
  height: number; // in cm
  width: number;  // in cm
  length: number; // in cm
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface BillingAddress {
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
  estimatedDeliveryDate?: string; // Or timestamp
  trackingHistory?: { status: string; timestamp: any }[]; // Use any for now, refine later
  labelUrl?: string;
}

interface Order {
  id?: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  orderDate: any; // Use any for now, refine with Firebase Timestamp
  status: "pending_payment" | "payment_confirmed" | "processing" | "ready_for_shipping" | "shipped" | "delivered" | "cancelled";
  shippingAddress: ShippingAddress;
  billingAddress: BillingAddress;
  deliveryInfo?: DeliveryInfo;
  createdAt: any; // Use any for now, refine with Firebase Timestamp
  updatedAt: any; // Use any for now, refine with Firebase Timestamp
}

// Create a new order
export const createOrder = async (userId: string, orderData: Omit<Order, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'status'>) => {
  const ordersCollection = collection(db, "orders");
  const newOrderRef = doc(ordersCollection);
  const orderToSave = {
    ...orderData,
    userId,
    status: "pending_payment", // Initial status
    createdAt: new Date(), // Use Date object for now, convert to Timestamp in Cloud Function if needed
    updatedAt: new Date(),
    orderDate: new Date(), // Assuming orderDate is the same as createdAt initially
  };
  await setDoc(newOrderRef, orderToSave);
  return newOrderRef.id;
};

// Get order history for a user
export const getOrderHistory = async (userId: string): Promise<Order[]> => {
  const ordersCollection = collection(db, "orders");
  const userOrdersQuery = query(
    ordersCollection,
    where("userId", "==", userId),
    orderBy("orderDate", "desc") // Order by most recent
  );
  const orderSnapshot = await getDocs(userOrdersQuery);
  return orderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
};

// Get a specific order by ID
export const getOrderDetails = async (orderId: string): Promise<Order | null> => {
  const orderRef = doc(db, "orders", orderId);
  const orderSnap = await getDoc(orderRef);
  if (orderSnap.exists()) {
    return { id: orderSnap.id, ...orderSnap.data() } as Order;
  } else {
    return null;
  }
};