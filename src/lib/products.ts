// Adiciona declaração de módulo para importação do firebase
// Isso corrige o erro de importação de tipos do firebase
// @ts-ignore
import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
}

const COLLECTION = "products";

function docToProduct(doc: QueryDocumentSnapshot<DocumentData>): Product {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    description: data.description,
    price: data.price,
    category: data.category,
    image: data.image,
    stock: data.stock,
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map(docToProduct);
}

export async function getProduct(id: string): Promise<Product | null> {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Product;
}

export async function addProduct(product: Omit<Product, "id">): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), product);
  return docRef.id;
}

export async function updateProduct(id: string, product: Partial<Omit<Product, "id">>): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, product);
}

export async function deleteProduct(id: string): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await deleteDoc(ref);
}
