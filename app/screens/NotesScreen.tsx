import { db } from "@/config/firebase";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import {
	collection,
	deleteDoc,
	doc,
	onSnapshot,
	orderBy,
	query,
	Timestamp,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

type RootStackParamList = {
	NotesScreen: undefined;
	EditNote: { note: Note };
	AddNote: undefined;
};

type NotesScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface Note {
	id: string;
	title: string;
	description: string;
	updatedAt: Timestamp;
}

export default function NotesScreen() {
	const navigation = useNavigation<NotesScreenNavigationProp>();
	const [notes, setNotes] = useState<Note[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const notesRef = collection(db, "notes");
		const q = query(notesRef, orderBy("updatedAt", "desc"));

		const unsubscribe = onSnapshot(
			q,
			(snapshot) => {
				const notesData = snapshot.docs.map(
					(doc) =>
						({
							id: doc.id,
							...doc.data(),
						} as Note)
				);
				setNotes(notesData);
				setLoading(false);
			},
			(err) => {
				console.error("Failed to fetch notes:", err);
				setError(err.message);
				setLoading(false);
			}
		);

		return () => unsubscribe();
	}, []);

	const deleteNote = async (id: string) => {
		try {
			await deleteDoc(doc(db, "notes", id));
		} catch (err) {
			console.error("Failed to delete note:", err);
			setError(err instanceof Error ? err.message : "Failed to delete note");
		}
	};

	const renderNote = ({ item }: { item: Note }) => (
		<TouchableOpacity
			style={styles.noteCard}
			onPress={() => navigation.navigate("EditNote", { note: item })}
		>
			<Text style={styles.title}>{item.title}</Text>
			<Text style={styles.description}>
				{item.description.length > 100
					? `${item.description.substring(0, 100)}...`
					: item.description}
			</Text>
			<Text style={styles.date}>
				Updated: {new Date(item.updatedAt.seconds * 1000).toLocaleString()}
			</Text>
			<TouchableOpacity
				onPress={() => deleteNote(item.id)}
				style={styles.deleteBtn}
			>
				<Ionicons name="trash-outline" size={24} color="#FF4444" />
			</TouchableOpacity>
		</TouchableOpacity>
	);
	if (loading) {
		return (
			<View style={[styles.container, styles.centerContent]}>
				<ActivityIndicator size="large" color="#0000ff" />
			</View>
		);
	}

	if (error) {
		return (
			<View style={[styles.container, styles.centerContent]}>
				<Text style={styles.errorText}>{error}</Text>
				<TouchableOpacity
					style={styles.retryButton}
					onPress={() => {
						setLoading(true);
						setError(null);
						// The useEffect will re-run and fetch notes
					}}
				>
					<Text style={styles.retryText}>Retry</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<FlatList
				data={notes}
				renderItem={renderNote}
				keyExtractor={(item) => item.id}
				ListEmptyComponent={
					<View style={styles.centerContent}>
						<Text>No notes yet.</Text>
					</View>
				}
			/>
			<TouchableOpacity
				style={styles.addBtn}
				onPress={() => navigation.navigate("AddNote")}
			>
				<Ionicons name="add" size={30} color="white" />
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 10,
	},
	centerContent: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	noteCard: {
		backgroundColor: "#fff",
		padding: 15,
		marginBottom: 10,
		borderRadius: 8,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowRadius: 5,
		elevation: 3,
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
	},
	description: {
		fontSize: 14,
		color: "gray",
	},
	date: {
		fontSize: 12,
		color: "lightgray",
		marginTop: 5,
	},
	deleteBtn: {
		position: "absolute",
		right: 10,
		top: 10,
	},
	addBtn: {
		position: "absolute",
		bottom: 20,
		right: 20,
		backgroundColor: "#2196F3",
		width: 56,
		height: 56,
		borderRadius: 28,
		justifyContent: "center",
		alignItems: "center",
		elevation: 4,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
	},
	errorText: {
		color: "red",
		fontSize: 16,
		marginBottom: 16,
	},
	retryButton: {
		backgroundColor: "#2196F3",
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 4,
	},
	retryText: {
		color: "white",
		fontSize: 16,
	},
});
