// src/lib/todos.ts
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

export type Todo = {
	id: string;
	title: string;
	completed: boolean;
	userId: string;
	createdAt: any;
	updatedAt: any;
};

const TODOS_COLLECTION = "todos";

// === CREATE ===
export const createTodo = async (
	userId: string,
	title: string
): Promise<string> => {
	if (!userId) throw new Error("userId diperlukan");

	const docRef = await addDoc(collection(db, TODOS_COLLECTION), {
		title: title.trim(),
		completed: false,
		userId,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp(),
	});

	return docRef.id;
};

// === READ ALL ===
export const getUserTodos = async (userId: string): Promise<Todo[]> => {
	if (!userId) throw new Error("userId diperlukan");

	const q = query(
		collection(db, TODOS_COLLECTION),
		where("userId", "==", userId),
		orderBy("updatedAt", "desc")
	);

	const snapshot = await getDocs(q);
	return snapshot.docs.map((doc) => ({
		id: doc.id,
		...doc.data(),
	})) as Todo[];
};

// === READ ONE ===
export const getTodoById = async (
	userId: string,
	todoId: string
): Promise<Todo | null> => {
	if (!userId) throw new Error("userId diperlukan");

	const docRef = doc(db, TODOS_COLLECTION, todoId);
	const docSnap = await getDoc(docRef);

	if (!docSnap.exists()) return null;
	const data = docSnap.data();
	if (data.userId !== userId) throw new Error("Akses ditolak");

	return { id: docSnap.id, ...data } as Todo;
};

// === UPDATE ===
export const updateTodo = async (
	userId: string,
	todoId: string,
	updates: { title?: string; completed?: boolean }
): Promise<void> => {
	if (!userId) throw new Error("userId diperlukan");

	const docRef = doc(db, TODOS_COLLECTION, todoId);
	const docSnap = await getDoc(docRef);

	if (!docSnap.exists()) throw new Error("Todo tidak ditemukan");
	if (docSnap.data().userId !== userId) throw new Error("Akses ditolak");

	await updateDoc(docRef, {
		...updates,
		updatedAt: serverTimestamp(),
	});
};

// === TOGGLE ===
export const toggleTodo = async (
	userId: string,
	todoId: string
): Promise<void> => {
	if (!userId) throw new Error("userId diperlukan");

	const docRef = doc(db, TODOS_COLLECTION, todoId);
	const docSnap = await getDoc(docRef);

	if (!docSnap.exists()) throw new Error("Todo tidak ditemukan");
	if (docSnap.data().userId !== userId) throw new Error("Akses ditolak");

	await updateDoc(docRef, {
		completed: !docSnap.data().completed,
		updatedAt: serverTimestamp(),
	});
};

// === DELETE ===
export const deleteTodo = async (
	userId: string,
	todoId: string
): Promise<void> => {
	if (!userId) throw new Error("userId diperlukan");

	const docRef = doc(db, TODOS_COLLECTION, todoId);
	const docSnap = await getDoc(docRef);

	if (!docSnap.exists()) throw new Error("Todo tidak ditemukan");
	if (docSnap.data().userId !== userId) throw new Error("Akses ditolak");

	await deleteDoc(docRef);
};
