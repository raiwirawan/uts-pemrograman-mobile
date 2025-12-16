import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  DocumentSnapshot,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase";

// --- 1. INTERFACE ---
export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Todo {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  checked: boolean;
  isFavorite: boolean;
  dueDate?: Timestamp | Date | null; // <--- TANGGAL DEADLINE
  subtasks: Subtask[]; // <--- SUBTASKS (BULLET POINTS)
  createdAt: Timestamp | Date | any;
  updatedAt: Timestamp | Date | any;
}

// --- 2. CONVERTER ---
const todoConverter = {
  toFirestore: (todo: Partial<Todo>): DocumentData => {
    return {
      userId: todo.userId,
      title: todo.title,
      description: todo.description || "",
      checked: todo.checked || false,
      isFavorite: todo.isFavorite || false,
      dueDate: todo.dueDate || null,
      subtasks: todo.subtasks || [],
      updatedAt: serverTimestamp(),
      ...(todo.createdAt && { createdAt: todo.createdAt }),
    };
  },
  fromFirestore: (snapshot: DocumentSnapshot): Todo => {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      userId: data?.userId,
      title: data?.title,
      description: data?.description,
      checked: data?.checked,
      isFavorite: data?.isFavorite || false,
      dueDate: data?.dueDate,
      subtasks: data?.subtasks || [],
      createdAt: data?.createdAt,
      updatedAt: data?.updatedAt,
    } as Todo;
  },
};

// --- 3. CRUD OPERATIONS ---
const getTodosRef = (userId: string) =>
  collection(db, "users", userId, "todos");

export const createTodo = async (
  userId: string,
  title: string,
  description: string,
  dueDate: Date | null,
  subtasks: Subtask[]
) => {
  await addDoc(
    getTodosRef(userId),
    todoConverter.toFirestore({
      userId,
      title,
      description,
      checked: false,
      isFavorite: false,
      dueDate: dueDate,
      subtasks: subtasks,
      createdAt: serverTimestamp(),
    })
  );
};

export const updateTodo = async (
  userId: string,
  todoId: string,
  updates: Partial<Todo>
) => {
  const ref = doc(db, "users", userId, "todos", todoId);
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
};

export const deleteTodo = async (userId: string, todoId: string) => {
  await deleteDoc(doc(db, "users", userId, "todos", todoId));
};

export const deleteMultipleTodos = async (
  userId: string,
  todoIds: string[]
) => {
  const batch = writeBatch(db);
  todoIds.forEach((id) => {
    const ref = doc(db, "users", userId, "todos", id);
    batch.delete(ref);
  });
  await batch.commit();
};

export const toggleFavoriteTodo = async (
  userId: string,
  todoId: string,
  currentStatus: boolean
) => {
  const ref = doc(db, "users", userId, "todos", todoId);
  await updateDoc(ref, {
    isFavorite: !currentStatus,
    updatedAt: serverTimestamp(),
  });
};

export const getUserTodos = (
  userId: string,
  callback: (todos: Todo[]) => void
) => {
  const q = query(getTodosRef(userId), orderBy("updatedAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const todos = snapshot.docs.map((doc) => todoConverter.fromFirestore(doc));
    callback(todos);
  });
};
