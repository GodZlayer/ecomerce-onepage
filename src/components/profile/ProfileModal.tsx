// ecomerce/src/components/profile/ProfileModal.tsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'; // Assuming Dialog components are here
import OrderHistoryPage from './OrderHistoryPage';
import AddressManagementPage from './AddressManagementPage';
import OrderDetailsPage from './OrderDetailsPage'; // Assuming OrderDetailsPage is here

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: 'orders' | 'addresses' | 'orderDetails';
  selectedOrderId: string | null;
  setActiveSection: (section: 'orders' | 'addresses' | 'orderDetails') => void;
  setSelectedOrderId: (orderId: string | null) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  activeSection,
  selectedOrderId,
  setActiveSection,
  setSelectedOrderId,
}) => {
  const handleOrderClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setActiveSection('orderDetails');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'orders':
        // Pass a callback to OrderHistoryPage to handle view details click
        return <OrderHistoryPage onViewDetailsClick={handleOrderClick} />;
      case 'addresses':
        return <AddressManagementPage />;
      case 'orderDetails':
        // Pass selectedOrderId to OrderDetailsPage
        return <OrderDetailsPage orderId={selectedOrderId} />;
      default:
        return <OrderHistoryPage onViewDetailsClick={handleOrderClick} />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto"> {/* Adjust max-width and add scrolling */}
        <DialogHeader>
          <DialogTitle>Seu Perfil</DialogTitle>
          <DialogDescription>
            Gerencie suas compras e endereços.
          </DialogDescription>
        </DialogHeader>

        {/* Internal Navigation */}
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 text-sm font-medium ${activeSection === 'orders' || activeSection === 'orderDetails' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => {
              setActiveSection('orders');
              setSelectedOrderId(null); // Reset selected order when switching tabs
            }}
          >
            Histórico de Compras
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${activeSection === 'addresses' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => {
              setActiveSection('addresses');
              setSelectedOrderId(null); // Reset selected order when switching tabs
            }}
          >
            Meus Endereços
          </button>
          {/* Add other navigation buttons here */}
        </div>

        {/* Render active section content */}
        <div>
          {renderContent()}
        </div>

        {/* DialogFooter can be added here if needed */}
        {/* <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;