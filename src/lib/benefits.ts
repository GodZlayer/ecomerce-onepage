import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";

export interface Benefit {
  id?: string;
  title: string;
  description: string;
  icon: string; // pode ser um nome de ícone ou SVG
}

const COLLECTION = "benefits";

export async function getBenefits(): Promise<Benefit[]> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
    id: doc.id,
    ...doc.data(),
  })) as Benefit[];
}

export async function addBenefit(benefit: Omit<Benefit, "id">) {
  return addDoc(collection(db, COLLECTION), benefit);
}

export async function updateBenefit(id: string, benefit: Omit<Benefit, "id">) {
  return updateDoc(doc(db, COLLECTION, id), benefit);
}

export async function deleteBenefit(id: string) {
  return deleteDoc(doc(db, COLLECTION, id));
}
