import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	DocumentData,
	DocumentSnapshot,
	getDoc,
	onSnapshot,
	orderBy,
	query,
	QuerySnapshot,
	serverTimestamp,
	Timestamp,
	updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase"; // <-- Menggunakan impor relatif: "./firebase"

// --- 1. INTERFACE & TYPES ---

export interface Todo {
	id?: string;
	userId: string;
	title: string;
	description?: string;
	checked: boolean;
	createdAt: Timestamp | Date | any;
	updatedAt: Timestamp | Date | any;
}

// --- 2. HELPERS ---

type FirestoreSnapshot =
	| QuerySnapshot<DocumentData>
	| DocumentSnapshot<DocumentData>;

const todoConverter = {
	toFirestore: (todo: Partial<Todo>): DocumentData => {
		return {
			userId: todo.userId,
			title: todo.title,
			description: todo.description || "",
			checked: todo.checked || false,
			updatedAt: serverTimestamp(),
			...(todo.createdAt && { createdAt: todo.createdAt }),
		};
	},

	fromFirestore: (snapshot: FirestoreSnapshot): Todo[] | Todo => {
		// 1. Cek jika ini adalah snapshot dokumen tunggal (DocumentSnapshot)
		if (!("docs" in snapshot)) {
			const docSnap = snapshot as DocumentSnapshot<DocumentData>;

			if (!docSnap.exists()) {
				// Tidak akan terjadi karena sudah dicek di getTodo, tapi jaga-jaga
				throw new Error("Document data is null (does not exist).");
			}

			const docData = docSnap.data();
			if (!docData) throw new Error("Document data is null.");

			return {
				id: docSnap.id,
				userId: docData.userId,
				title: docData.title,
				description: docData.description,
				checked: docData.checked,
				createdAt: docData.createdAt,
				updatedAt: docData.updatedAt,
			} as Todo;
		}

		// 2. Jika ini adalah QuerySnapshot (Daftar dokumen)
		const querySnap = snapshot as QuerySnapshot<DocumentData>;

		return querySnap.docs.map(
			(doc) =>
				({
					id: doc.id,
					userId: doc.data().userId,
					title: doc.data().title,
					description: doc.data().description,
					checked: doc.data().checked,
					createdAt: doc.data().createdAt,
					updatedAt: doc.data().updatedAt,
				}) as Todo
		);
	},
};

// --- 3. CRUD OPERATIONS ---

const getTodosCollectionRef = (userId: string) =>
	collection(db, "users", userId, "todos");

export const createTodo = async (
	userId: string,
	title: string,
	description: string
) => {
	const todosRef = getTodosCollectionRef(userId);

	const newTodoData: Partial<Todo> & { createdAt: any; updatedAt: any } = {
		userId,
		title,
		description,
		checked: false,
		createdAt: serverTimestamp(),
		updatedAt: serverTimestamp(),
	};

	await addDoc(todosRef, newTodoData);
};

export const getTodo = async (
	userId: string,
	todoId: string
): Promise<Todo | null> => {
	const todoRef = doc(db, "users", userId, "todos", todoId);
	const docSnap = await getDoc(todoRef);

	if (docSnap.exists()) {
		return todoConverter.fromFirestore(docSnap) as Todo;
	}
	return null;
};

export const updateTodo = async (
	userId: string,
	todoId: string,
	updates: Partial<Omit<Todo, "userId" | "createdAt">>
) => {
	const todoRef = doc(db, "users", userId, "todos", todoId);

	await updateDoc(todoRef, {
		...updates,
		updatedAt: serverTimestamp(),
	});
};

export const deleteTodo = async (userId: string, todoId: string) => {
	const todoRef = doc(db, "users", userId, "todos", todoId);
	await deleteDoc(todoRef);
};

export const getUserTodos = (
	userId: string,
	callback: (todos: Todo[]) => void
) => {
	const todosRef = getTodosCollectionRef(userId);

	const todosQuery = query(todosRef, orderBy("updatedAt", "desc"));

	const unsubscribe = onSnapshot(
		todosQuery,
		(snapshot) => {
			const todos = todoConverter.fromFirestore(snapshot) as Todo[];
			callback(todos);
		},
		(error) => {
			console.error("Error fetching todos: ", error);
		}
	);

	return unsubscribe;
};
