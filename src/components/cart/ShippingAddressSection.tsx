import React from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Address } from '@/services/userService'; // Import Address type

interface ShippingAddressSectionProps {
  isAuthenticated: boolean;
  userAddresses: Address[];
  selectedAddress: Address | null;
  setSelectedAddress: (address: Address | null) => void;
  manualShippingInfo: {
    name: string;
    email: string;
    address: string;
    city: string;
    zipCode: string;
    houseNumber: string;
    complement: string;
    state: string;
    country: string;
  };
  handleManualInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const ShippingAddressSection: React.FC<ShippingAddressSectionProps> = ({
  isAuthenticated,
  userAddresses,
  selectedAddress,
  setSelectedAddress,
  manualShippingInfo,
  handleManualInputChange,
}) => {
  return (
    <div className="mt-6">
      <h3 className="font-semibold text-lg mb-4">
        Informações de Entrega
      </h3>
      {isAuthenticated && userAddresses.length > 0 && (
        <div className="mb-4">
          <Label>Selecione um Endereço Salvo:</Label>
          {/* Simple dropdown/selection for saved addresses */}
          <select
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
            value={selectedAddress?.id || ''}
            onChange={(e) => {
              const addressId = e.target.value;
              const address = userAddresses.find(addr => addr.id === addressId) || null;
              setSelectedAddress(address);
              // Note: Clearing shipping options and cost is handled in CartSidebar's useEffect
            }}
          >
            <option value="">Selecione um endereço</option>
            {userAddresses.map(address => (
              <option key={address.id} value={address.id}>
                {address.street}, {address.houseNumber} - {address.city}, {address.state}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Display selected address or manual input form */}
      {selectedAddress ? (
        <div className="border rounded-md p-4 bg-gray-100">
          <p className="font-medium">{selectedAddress.street}, {selectedAddress.houseNumber}{selectedAddress.complement && `, ${selectedAddress.complement}`}</p>
          <p className="text-sm text-gray-600">{selectedAddress.city} - {selectedAddress.state}, {selectedAddress.zipCode}</p>
          <p className="text-sm text-gray-600">{selectedAddress.country}</p>
          {selectedAddress.isDefault && <span className="text-xs font-semibold text-blue-600">Endereço Padrão</span>}
          <Button variant="link" size="sm" onClick={() => setSelectedAddress(null)} className="p-0 mt-2">
            Inserir outro endereço
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <Label htmlFor="manualName">Nome Completo</Label>
            <Input
              id="manualName"
              name="name"
              placeholder="Nome completo"
              value={manualShippingInfo.name}
              onChange={handleManualInputChange}
            />
          </div>
          <div>
             <Label htmlFor="manualEmail">E-mail</Label>
            <Input
              id="manualEmail"
              name="email"
              type="email"
              placeholder="E-mail"
              value={manualShippingInfo.email}
              onChange={handleManualInputChange}
            />
          </div>
          <div>
             <Label htmlFor="manualAddress">Rua</Label>
            <Input
              id="manualAddress"
              name="address"
              placeholder="Endereço"
              value={manualShippingInfo.address}
              onChange={handleManualInputChange}
            />
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
             <div>
               <Label htmlFor="manualHouseNumber">Número</Label>
               <Input
                 id="manualHouseNumber"
                 name="houseNumber"
                 placeholder="Número"
                 value={manualShippingInfo.houseNumber}
                 onChange={handleManualInputChange}
               />
             </div>
             <div>
               <Label htmlFor="manualComplement">Complemento (Opcional)</Label>
               <Input
                 id="manualComplement"
                 name="complement"
                 placeholder="Complemento"
                 value={manualShippingInfo.complement}
                 onChange={handleManualInputChange}
               />
             </div>
           </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
             <div>
               <Label htmlFor="manualCity">Cidade</Label>
               <Input
                 id="manualCity"
                 name="city"
                 placeholder="Cidade"
                 value={manualShippingInfo.city}
                 onChange={handleManualInputChange}
               />
             </div>
             <div>
               <Label htmlFor="manualState">Estado</Label>
               <Input
                 id="manualState"
                 name="state"
                 placeholder="Estado"
                 value={manualShippingInfo.state}
                 onChange={handleManualInputChange}
               />
             </div>
          </div>
          <div>
             <Label htmlFor="manualZipCode">CEP</Label>
            <Input
              id="manualZipCode"
              name="zipCode"
              placeholder="CEP"
              value={manualShippingInfo.zipCode}
              onChange={handleManualInputChange}
            />
          </div>
           <div>
             <Label htmlFor="manualCountry">País</Label>
             <Input
               id="manualCountry"
               name="country"
               placeholder="País"
               value={manualShippingInfo.country}
               onChange={handleManualInputChange}
             />
           </div>
        </div>
      )}
    </div>
  );
};

export default ShippingAddressSection;