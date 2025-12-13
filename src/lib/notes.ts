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
  content: string; // ← TAMBAH INI
  userId: string;
  createdAt: any;
  updatedAt: any;
};

const NOTES_COLLECTION = "notes";

// === CREATE ===
export const createNote = async (
  userId: string,
  title: string,
  content: string
): Promise<string> => {
  if (!userId) throw new Error("userId diperlukan");

  const docRef = await addDoc(collection(db, NOTES_COLLECTION), {
    title: title.trim(),
    content: content.trim(),
    userId,
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
  updates: { title?: string; content?: string }
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

// Update tipe data NoteData (atau sesuaikan dengan interface yang Anda punya)
export interface NoteData {
  title: string;
  content: string;
  userId: string;
  imageUrl?: string | null; // <--- Tambahkan opsional string
}

export const addNote = async (data: NoteData) => {
  try {
    await addDoc(collection(db, "notes"), {
      ...data,
      imageUrl: data.imageUrl || null, // Simpan null jika tidak ada gambar
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    throw error;
  }
};
