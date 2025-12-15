// src/lib/notes.ts
import { db } from "@/config/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

export type Note = {
  id: string;
  title: string;
  content: string;
  userId: string;
  imageUrl?: string | null; // <--- Saya rapikan biar konsisten
  isFavorite?: boolean; // <--- TAMBAHAN BARU
  createdAt: any;
  updatedAt: any;
};

const NOTES_COLLECTION = "notes";

// === CREATE ===
export const createNote = async (
  userId: string,
  title: string,
  content: string,
  imageUrl: string | null = null // Opsional
): Promise<string> => {
  if (!userId) throw new Error("userId diperlukan");

  const docRef = await addDoc(collection(db, NOTES_COLLECTION), {
    title: title.trim(),
    content: content.trim(),
    userId,
    imageUrl: imageUrl,
    isFavorite: false, // Default: Tidak favorite
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
};

// === READ ALL (milik user) ===
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

// === READ ONE ===
export const getNoteById = async (
  userId: string,
  noteId: string
): Promise<Note | null> => {
  if (!userId) throw new Error("userId diperlukan");

  const docRef = doc(db, NOTES_COLLECTION, noteId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  if (data.userId !== userId) throw new Error("Akses ditolak");

  return { id: docSnap.id, ...data } as Note;
};

// === UPDATE ===
export const updateNote = async (
  userId: string,
  noteId: string,
  updates: { title?: string; content?: string; imageUrl?: string | null }
): Promise<void> => {
  if (!userId) throw new Error("userId diperlukan");

  const docRef = doc(db, NOTES_COLLECTION, noteId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) throw new Error("Catatan tidak ditemukan");
  if (docSnap.data().userId !== userId) throw new Error("Akses ditolak");

  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

// === TOGGLE FAVORITE (BARU) ===
export const toggleFavoriteNote = async (
  userId: string,
  noteId: string,
  currentStatus: boolean
): Promise<void> => {
  if (!userId) throw new Error("userId diperlukan");

  const docRef = doc(db, NOTES_COLLECTION, noteId);

  // Validasi pemilik (agar aman)
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error("Catatan tidak ditemukan");
  if (docSnap.data().userId !== userId) throw new Error("Akses ditolak");

  // Update status favorite
  await updateDoc(docRef, {
    isFavorite: !currentStatus,
    updatedAt: serverTimestamp(),
  });
};

// === DELETE ===
export const deleteNote = async (
  userId: string,
  noteId: string
): Promise<void> => {
  if (!userId) {
    throw new Error("userId diperlukan");
  }

  const docRef = doc(db, "notes", noteId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error("Catatan tidak ditemukan");
  }
  if (docSnap.data().userId !== userId) {
    throw new Error("Akses ditolak");
  }

  await deleteDoc(docRef);
};

// === INTERFACE BAWAAN (Update) ===
export interface NoteData {
  title: string;
  content: string;
  userId: string;
  imageUrl?: string | null;
  isFavorite?: boolean; // <--- Tambah ini
}

export const addNote = async (data: NoteData) => {
  try {
    await addDoc(collection(db, "notes"), {
      ...data,
      imageUrl: data.imageUrl || null,
      isFavorite: data.isFavorite || false, // Default false
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw error;
  }
};
