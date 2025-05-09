import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, where } from "firebase/firestore";

export interface Address {
  id?: string;
  userId: string;
  name?: string; // Added optional name for consistency with manual input
  email?: string; // Added optional email for consistency with manual input
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

// Add or update a user's address
export const saveAddress = async (userId: string, address: Address) => {
  const addressRef = address.id ? doc(db, "addresses", address.id) : doc(collection(db, "addresses"));
  const addressData = { ...address, userId }; // Ensure userId is on the document
  await setDoc(addressRef, addressData, { merge: true });
  return addressRef.id;
};

// Get all addresses for a user
export const getAddresses = async (userId: string): Promise<Address[]> => {
  const addressesCollection = collection(db, "addresses");
  const userAddressesQuery = query(addressesCollection, where("userId", "==", userId));
  const addressSnapshot = await getDocs(userAddressesQuery);
  return addressSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Address));
};

// Delete a user's address
export const deleteAddress = async (addressId: string) => {
  await deleteDoc(doc(db, "addresses", addressId));
};

// Get a specific address by ID
export const getAddressById = async (addressId: string): Promise<Address | null> => {
  const addressRef = doc(db, "addresses", addressId);
  const addressSnap = await getDoc(addressRef);
  if (addressSnap.exists()) {
    return { id: addressSnap.id, ...addressSnap.data() } as Address;
  } else {
    return null;
  }
};