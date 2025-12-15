// src/lib/notes.ts
import { db } from "@/config/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

export type Note = {
  id: string;
  title: string;
  content: string;
  userId: string;
  imageUrl?: string | null;
  isFavorite?: boolean;
  createdAt: any;
  updatedAt: any;
};

const NOTES_COLLECTION = "notes";

// === CREATE ===
export const createNote = async (
  userId: string,
  title: string,
  content: string,
  imageUrl: string | null = null
): Promise<string> => {
  if (!userId) throw new Error("userId diperlukan");

  const docRef = await addDoc(collection(db, NOTES_COLLECTION), {
    title: title.trim(),
    content: content.trim(),
    userId,
    imageUrl: imageUrl,
    isFavorite: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
};

// === READ ALL ===
export const getUserNotes = async (userId: string): Promise<Note[]> => {
  if (!userId) {
    throw new Error("userId diperlukan");
  }

  const notesRef = collection(db, "notes");
  const q = query(
    notesRef,
    where("userId", "==", userId),
    orderBy("updatedAt", "desc")
  );

  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Note[];
  } catch (err: any) {
    throw new Error(err.message || "Gagal memuat catatan");
  }
};

// === UPDATE ===
export const updateNote = async (
  userId: string,
  noteId: string,
  updates: { title?: string; content?: string; imageUrl?: string | null }
): Promise<void> => {
  if (!userId) throw new Error("userId diperlukan");

  const docRef = doc(db, NOTES_COLLECTION, noteId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// === TOGGLE FAVORITE ===
export const toggleFavoriteNote = async (
  userId: string,
  noteId: string,
  currentStatus: boolean
): Promise<void> => {
  if (!userId) throw new Error("userId diperlukan");
  const docRef = doc(db, NOTES_COLLECTION, noteId);
  await updateDoc(docRef, {
    isFavorite: !currentStatus,
    updatedAt: serverTimestamp(),
  });
};

// === DELETE SINGLE ===
export const deleteNote = async (
  userId: string,
  noteId: string
): Promise<void> => {
  if (!userId) throw new Error("userId diperlukan");
  const docRef = doc(db, "notes", noteId);
  await deleteDoc(docRef);
};

// === DELETE MULTIPLE (BATCH) - INI YANG ANDA BUTUHKAN ===
export const deleteMultipleNotes = async (
  userId: string,
  noteIds: string[]
): Promise<void> => {
  if (!userId) throw new Error("userId diperlukan");
  if (noteIds.length === 0) return;

  // Menggunakan Batch untuk menghapus banyak sekaligus
  const batch = writeBatch(db);

  noteIds.forEach((id) => {
    const docRef = doc(db, "notes", id);
    batch.delete(docRef);
  });

  // Jalankan semua perintah hapus
  await batch.commit();
};

// === INTERFACE ADD NOTE ===
export interface NoteData {
  title: string;
  content: string;
  userId: string;
  imageUrl?: string | null;
  isFavorite?: boolean;
}

export const addNote = async (data: NoteData) => {
  try {
    await addDoc(collection(db, "notes"), {
      ...data,
      imageUrl: data.imageUrl || null,
      isFavorite: data.isFavorite || false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw error;
  }
};
