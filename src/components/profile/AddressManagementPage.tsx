// ecomerce/src/components/profile/AddressManagementPage.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthContext'; // Assuming AuthContext is in components/AuthContext
import { getAddresses, saveAddress, deleteAddress } from '@/services/userService'; // Assuming userService is in services/userService
import { Button } from '@/components/ui/button'; // Assuming you have a Button component
import { Input } from '@/components/ui/input'; // Assuming you have an Input component
import { Label } from '@/components/ui/label'; // Assuming you have a Label component
import { Checkbox } from '@/components/ui/checkbox'; // Assuming you have a Checkbox component
import { Trash2 } from 'lucide-react'; // Assuming lucide-react is installed

interface Address {
  id?: string;
  userId: string;
  street: string;
  houseNumber?: string; // Added houseNumber
  complement?: string; // Added complement
  city: string;
  state: string;
  zipCode: string;
  country: string;
  type: "shipping" | "billing";
  isDefault: boolean;
}

const AddressManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id' | 'userId'>>({
    street: '',
    houseNumber: '', // Added houseNumber
    complement: '', // Added complement
    city: '',
    state: '',
    zipCode: '',
    country: '',
    type: 'shipping', // Default type
    isDefault: false,
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) {
        setLoading(false);
        setError("User not logged in.");
        return;
      }

      try {
        setLoading(true);
        const userAddresses = await getAddresses(user.id); // Use user.id
        setAddresses(userAddresses);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching addresses:", err);
        setError("Failed to fetch addresses.");
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [user]); // Refetch addresses when user changes

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (editingAddress) {
      setEditingAddress({
        ...editingAddress,
        [name]: type === 'checkbox' ? checked : value,
      });
    } else {
      setNewAddress({
        ...newAddress,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  const handleSaveAddress = async () => {
    if (!user) {
      setError("User not logged in.");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const addressToSave = editingAddress || newAddress;
      const savedId = await saveAddress(user.id, addressToSave as Address); // Use user.id

      // Update the addresses list
      if (editingAddress) {
        setAddresses(addresses.map(addr => addr.id === savedId ? { ...addressToSave as Address, id: savedId } : addr));
        setEditingAddress(null);
      } else {
        setAddresses([...addresses, { ...newAddress as Address, id: savedId, userId: user.id }]); // Use user.id
        setNewAddress({
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
          type: 'shipping',
          isDefault: false,
        });
      }
      setLoading(false);
    } catch (err) {
      console.error("Error saving address:", err);
      setError("Failed to save address.");
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user) {
      setError("User not logged in.");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await deleteAddress(addressId);
      setAddresses(addresses.filter(addr => addr.id !== addressId));
      setLoading(false);
    } catch (err) {
      console.error("Error deleting address:", err);
      setError("Failed to delete address.");
      setLoading(false);
    }
  };

  const handleEditClick = (address: Address) => {
    setEditingAddress(address);
  };

  const handleCancelEdit = () => {
    setEditingAddress(null);
  };

  if (loading) {
    return <div className="text-center text-gray-500">Carregando endereços...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Meus Endereços</h2>

      {/* List of Addresses */}
      <div className="space-y-4">
        {addresses.map(address => (
          <div key={address.id} className="border rounded-md p-4">
            <p className="font-medium">{address.street}, {address.city} - {address.state}, {address.zipCode}</p>
            <p className="text-sm text-gray-600">{address.country} ({address.type})</p>
            {address.isDefault && <span className="text-xs font-semibold text-blue-600">Endereço Padrão</span>}
            <div className="mt-2 space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleEditClick(address)}>Editar</Button>
              <Button variant="destructive" size="sm" onClick={() => handleDeleteAddress(address.id!)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Address Form */}
      <div className="border rounded-md p-6 bg-gray-50">
        <h3 className="text-xl font-semibold mb-4">{editingAddress ? 'Editar Endereço' : 'Adicionar Novo Endereço'}</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="street">Rua</Label>
            <Input
              id="street"
              name="street"
              value={editingAddress ? editingAddress.street : newAddress.street}
              onChange={handleInputChange}
              placeholder="Nome da Rua"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="houseNumber">Número</Label>
              <Input
                id="houseNumber"
                name="houseNumber"
                value={editingAddress ? editingAddress.houseNumber : newAddress.houseNumber}
                onChange={handleInputChange}
                placeholder="Número da Casa"
              />
            </div>
            <div>
              <Label htmlFor="complement">Complemento (Opcional)</Label>
              <Input
                id="complement"
                name="complement"
                value={editingAddress ? editingAddress.complement : newAddress.complement}
                onChange={handleInputChange}
                placeholder="Apartamento, Bloco, etc."
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                name="city"
                value={editingAddress ? editingAddress.city : newAddress.city}
                onChange={handleInputChange}
                placeholder="Cidade"
              />
            </div>
            <div>
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                name="state"
                value={editingAddress ? editingAddress.state : newAddress.state}
                onChange={handleInputChange}
                placeholder="Estado"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="zipCode">CEP</Label>
              <Input
                id="zipCode"
                name="zipCode"
                value={editingAddress ? editingAddress.zipCode : newAddress.zipCode}
                onChange={handleInputChange}
                placeholder="CEP"
              />
            </div>
            <div>
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                name="country"
                value={editingAddress ? editingAddress.country : newAddress.country}
                onChange={handleInputChange}
                placeholder="País"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="type">Tipo</Label>
            <select
              id="type"
              name="type"
              value={editingAddress ? editingAddress.type : newAddress.type}
              onChange={handleInputChange}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="shipping">Entrega</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDefault"
              name="isDefault"
              checked={editingAddress ? editingAddress.isDefault : newAddress.isDefault}
              onCheckedChange={(checked) => {
                const isCheckedBoolean = Boolean(checked); // Ensure boolean value
                if (editingAddress) {
                  setEditingAddress({ ...editingAddress, isDefault: isCheckedBoolean });
                } else {
                  setNewAddress({ ...newAddress, isDefault: isCheckedBoolean });
                }
              }}
            />
            <Label htmlFor="isDefault">Definir como endereço padrão</Label>
          </div>
          <div className="space-x-4">
            <Button onClick={handleSaveAddress} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Endereço'}
            </Button>
            {editingAddress && (
              <Button variant="outline" onClick={handleCancelEdit} disabled={loading}>
                Cancelar Edição
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressManagementPage;