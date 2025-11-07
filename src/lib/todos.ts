// lib/todos.ts
import { db } from "@/config/firebase";
import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDoc,
	onSnapshot,
	orderBy,
	query,
	Unsubscribe,
	updateDoc,
	where,
} from "firebase/firestore";

export interface TodoItem {
	text: string;
	checked: boolean;
}

export interface Todo {
	id?: string;
	title: string;
	items: TodoItem[];
	color: string;
	userId: string;
	createdAt: any;
	updatedAt: any;
}

export const COLORS = [
	"#FFEB3B",
	"#FFCDD2",
	"#C8E6C9",
	"#BBDEFB",
	"#D1C4E9",
] as const;

export const createTodo = async (
	uid: string,
	title: string,
	items: TodoItem[],
	color: string
) => {
	return await addDoc(collection(db, "todos"), {
		userId: uid,
		title: title.trim(),
		items: items.filter((i) => i.text.trim()),
		color,
		createdAt: new Date(),
		updatedAt: new Date(),
	});
};

export const updateTodo = async (
	uid: string,
	id: string,
	data: Partial<Todo>
) => {
	return await updateDoc(doc(db, "todos", id), {
		...data,
		updatedAt: new Date(),
	});
};

export const deleteTodo = async (uid: string, id: string) => {
	return await deleteDoc(doc(db, "todos", id));
};

// FIXED: PAKAI where("userId", "==", uid) → AMAN!
export const getUserTodos = (
	uid: string,
	callback: (todos: Todo[]) => void
): Unsubscribe => {
	const q = query(
		collection(db, "todos"),
		where("userId", "==", uid), // HANYA AMBIL TODO USER INI
		orderBy("updatedAt", "desc")
	);

	return onSnapshot(q, (snapshot) => {
		const todos = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		})) as Todo[];
		callback(todos);
	});
};

export const getTodoById = async (
	userId: string,
	todoId: string
): Promise<Todo | null> => {
	try {
		const todoRef = doc(db, "todos", todoId); // ✅ FIXED PATH
		const todoSnap = await getDoc(todoRef);

		if (todoSnap.exists()) {
			const data = todoSnap.data();
			if (data.userId !== userId) return null; // extra safety
			return { id: todoSnap.id, ...data } as Todo;
		}
		return null;
	} catch (error) {
		console.error("Error getting todo:", error);
		return null;
	}
};
