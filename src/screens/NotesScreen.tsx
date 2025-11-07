// app/(tabs)/notes.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	FlatList,
	RefreshControl,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

import colors from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { deleteNote, getUserNotes, Note } from "@/lib/notes";
import { NotesScreenProps } from "@/types/navigation";

// eslint-disable-next-line no-empty-pattern
function NotesScreen({}: NotesScreenProps) {
	const { user } = useAuth();
	const navigation = useNavigation<NotesScreenProps["navigation"]>();
	const [notes, setNotes] = useState<Note[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadNotes = useCallback(async () => {
		if (!user?.uid) return;

		try {
			const data = await getUserNotes(user.uid);
			setNotes(data);
			setError(null);
		} catch (err: any) {
			console.error("Failed to fetch notes:", err);
			setError(err.message || "Gagal memuat catatan");
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}, [user?.uid]);

	useEffect(() => {
		if (user?.uid) {
			setLoading(true);
			loadNotes();
		} else {
			setLoading(false);
		}
	}, [user?.uid, loadNotes]);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		loadNotes();
	}, [loadNotes]);

	const handleDelete = async (id: string) => {
		if (!user?.uid) return;

		try {
			await deleteNote(user.uid, id);
			setNotes((prev) => prev.filter((n) => n.id !== id));
		} catch (err: any) {
			Alert.alert("Gagal", err.message);
		}
	};

	const renderNote = ({ item }: { item: Note }) => (
		<TouchableOpacity
			style={styles.noteCard}
			onPress={() => {
				// @ts-ignore
				navigation.navigate("EditNote", { noteId: item.id, note: item });
			}}
		>
			<Text style={styles.title}>{item.title}</Text>
			<Text style={styles.description}>
				{item.content.length > 100
					? `${item.content.substring(0, 100)}...`
					: item.content}
			</Text>
			<Text style={styles.date}>
				Updated: {new Date(item.updatedAt.seconds * 1000).toLocaleString()}
			</Text>
			<TouchableOpacity
				onPress={() =>
					Alert.alert(
						"Hapus Catatan",
						"Apakah Anda yakin ingin menghapus catatan ini?",
						[
							{ text: "Batal", style: "cancel" },
							{
								text: "Hapus",
								style: "destructive",
								onPress: () => handleDelete(item.id),
							},
						]
					)
				}
				style={styles.deleteBtn}
			>
				<Ionicons name="trash-outline" size={24} color={colors.DANGER} />
			</TouchableOpacity>
		</TouchableOpacity>
	);

	if (loading) {
		return (
			<View style={styles.centerContent}>
				<ActivityIndicator size="large" color={colors.PRIMARY_PURPLE} />
				<Text style={styles.loadingText}>Memuat catatan...</Text>
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.centerContent}>
				<Ionicons name="alert-circle-outline" size={80} color={colors.DANGER} />
				<Text style={styles.errorText}>{error}</Text>
				<TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
					<Text style={styles.retryText}>Coba Lagi</Text>
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
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
				ListEmptyComponent={
					<View style={styles.emptyContainer}>
						<Ionicons
							name="document-outline"
							size={100}
							color={colors.DIVIDER}
						/>
						<Text style={styles.emptyTitle}>Belum ada catatan</Text>
						<Text style={styles.emptySubtitle}>
							Tekan tombol + untuk membuat catatan pertama Anda
						</Text>
					</View>
				}
			/>

			{/* FAB */}
			<TouchableOpacity
				style={styles.addBtn}
				onPress={() => navigation.navigate("AddNote" as never)}
			>
				<Ionicons name="add" size={30} color={colors.WHITE} />
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingVertical: 20,
		backgroundColor: colors.BACKGROUND,
	},
	centerContent: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	noteCard: {
		backgroundColor: colors.WHITE,
		padding: 16,
		marginHorizontal: 12,
		marginVertical: 6,
		borderRadius: 12,
		shadowColor: colors.SHADOW,
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 3,
		position: "relative",
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
		color: colors.TEXT_DARK,
		marginBottom: 6,
	},
	description: {
		fontSize: 14,
		color: colors.TEXT_GREY,
		lineHeight: 20,
	},
	date: {
		fontSize: 12,
		color: colors.TEXT_LIGHT_GREY,
		marginTop: 8,
	},
	deleteBtn: {
		position: "absolute",
		right: 12,
		top: 12,
		padding: 4,
	},
	addBtn: {
		position: "absolute",
		bottom: 30,
		right: 20,
		backgroundColor: colors.FAB_BG,
		width: 60,
		height: 60,
		borderRadius: 30,
		justifyContent: "center",
		alignItems: "center",
		elevation: 6,
		shadowColor: colors.FAB_SHADOW,
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.4,
		shadowRadius: 5,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 40,
		paddingVertical: 160,
	},
	emptyTitle: {
		fontSize: 22,
		fontWeight: "bold",
		color: colors.TEXT_DARK,
		marginTop: 20,
		marginBottom: 8,
	},
	emptySubtitle: {
		fontSize: 16,
		color: colors.TEXT_GREY,
		textAlign: "center",
		marginBottom: 30,
	},
	createFirstBtn: {
		flexDirection: "row",
		backgroundColor: colors.FAB_BG,
		paddingHorizontal: 24,
		paddingVertical: 14,
		borderRadius: 30,
		alignItems: "center",
		gap: 10,
	},
	createFirstText: {
		color: colors.WHITE,
		fontSize: 16,
		fontWeight: "600",
	},
	errorText: {
		color: colors.DANGER,
		fontSize: 16,
		textAlign: "center",
		marginBottom: 16,
	},
	retryButton: {
		backgroundColor: colors.FAB_BG,
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	retryText: {
		color: colors.WHITE,
		fontSize: 16,
		fontWeight: "600",
	},
	loadingText: {
		marginTop: 16,
		color: colors.TEXT_GREY,
		fontSize: 16,
	},
});

export default NotesScreen;
