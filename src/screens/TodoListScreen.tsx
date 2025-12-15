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
import Animated, { FadeIn } from "react-native-reanimated";

import colors from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { deleteTodo, getUserTodos, Todo, updateTodo } from "@/lib/todos";
import { TodoListScreenProps } from "@/types/navigation";

export default function TodoListScreen() {
	const { user } = useAuth();
	const navigation = useNavigation<TodoListScreenProps["navigation"]>();
	const [todos, setTodos] = useState<Todo[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadTodos = useCallback(() => {
		if (!user?.uid) {
			setLoading(false);
			return;
		}
		setRefreshing(true);
		setError(null);

		const unsubscribe = getUserTodos(user.uid, (data) => {
			setTodos(data);
			setLoading(false);
			setRefreshing(false);
		});

		return unsubscribe;
	}, [user?.uid]);

	useEffect(() => {
		const unsubscribe = loadTodos();
		return () => {
			if (unsubscribe) {
				unsubscribe();
			}
		};
	}, [user?.uid, loadTodos]);

	const onRefresh = useCallback(() => {
		setRefreshing(true);
		loadTodos();
	}, [loadTodos]);

	const handleDelete = (id: string) => {
		Alert.alert("Hapus To-Do", "Apakah Anda yakin ingin menghapus To-Do ini?", [
			{ text: "Batal", style: "cancel" },
			{
				text: "Hapus",
				style: "destructive",
				onPress: async () => {
					if (!user?.uid) return;
					try {
						await deleteTodo(user.uid, id);
						setTodos((prev) => prev.filter((t) => t.id !== id));
					} catch (err: any) {
						Alert.alert("Gagal", err.message);
					}
				},
			},
		]);
	};

	// Fungsi: Toggle Status Checked
	const handleToggleCheck = async (todo: Todo) => {
		if (!user?.uid || !todo.id) return;

		// Optimistic update
		// Pastikan updatedAt adalah objek Date agar toLocaleString() tetap berfungsi sebelum sync Firestore
		const newTodos = todos.map((t) =>
			t.id === todo.id
				? { ...t, checked: !t.checked, updatedAt: new Date() }
				: t
		);
		setTodos(newTodos);

		try {
			await updateTodo(user.uid, todo.id, { checked: !todo.checked });
		} catch (error) {
			console.error("Gagal toggle check", error);
			Alert.alert("Gagal", "Gagal memperbarui status To-Do.");
			setTodos(todos);
		}
	};

	// Render item To-Do
	const renderTodo = ({ item }: { item: Todo }) => (
		<Animated.View entering={FadeIn}>
			<TouchableOpacity
				// Edit: Langsung diarahkan ke screen update/edit
				onPress={() => {
					// @ts-ignore
					navigation.navigate("EditTodo", { todoId: item.id });
				}}
				style={styles.noteCard}
			>
				{/* Status Checked (Tombol Checklis di Kiri) */}
				<TouchableOpacity
					onPress={() => handleToggleCheck(item)}
					style={styles.checkButton}
				>
					<Ionicons
						name={item.checked ? "checkbox-outline" : "square-outline"}
						size={30}
						color={item.checked ? colors.SUCCESS : colors.TEXT_GREY}
					/>
				</TouchableOpacity>

				{/* Konten Judul & Deskripsi */}
				<View style={styles.contentContainer}>
					<Text
						style={[styles.title, item.checked && styles.titleChecked]}
						numberOfLines={1}
					>
						{item.title}
					</Text>

					{(item.description || "").trim() ? (
						<Text
							style={[
								styles.description,
								item.checked && styles.descriptionChecked,
							]}
							numberOfLines={2}
						>
							{item.description}
						</Text>
					) : null}

					{/* BARIS KRITIS YANG DIPERBAIKI */}
					<Text style={styles.date}>
						Status: {item.checked ? "Selesai" : "Belum Selesai"} | Diperbarui:{" "}
						{
							// Cek apakah item.updatedAt adalah objek Firestore Timestamp (punya .toDate)
							item.updatedAt?.toDate
								? item.updatedAt.toDate().toLocaleString()
								: // Jika tidak, asumsikan itu adalah objek Date JavaScript biasa
									(item.updatedAt?.toLocaleString() ??
									"Tidak ada tanggal update")
						}
					</Text>
				</View>

				{/* Tombol Hapus */}
				<TouchableOpacity
					onPress={() => handleDelete(item.id!)}
					style={styles.deleteBtn}
				>
					<Ionicons name="trash-outline" size={24} color={colors.DANGER} />
				</TouchableOpacity>
			</TouchableOpacity>
		</Animated.View>
	);

	if (loading) {
		return (
			<View style={styles.centerContent}>
				<ActivityIndicator size="large" color={colors.PRIMARY_PURPLE} />
				<Text style={styles.loadingText}>Memuat To-Do...</Text>
			</View>
		);
	}

	if (error) {
		// ... (error state code)
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
				data={todos}
				keyExtractor={(item) => item.id!}
				renderItem={renderTodo}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						colors={[colors.PRIMARY_PURPLE]}
					/>
				}
				contentContainerStyle={{ paddingBottom: 100, paddingTop: 6 }}
				ListEmptyComponent={
					<View style={styles.emptyContainer}>
						<Ionicons
							name="checkmark-done-circle-outline"
							size={100}
							color={colors.DIVIDER}
						/>
						<Text style={styles.emptyTitle}>Belum ada To-Do</Text>
						<Text style={styles.emptySubtitle}>
							Tekan tombol + untuk membuat To-Do pertama Anda
						</Text>
					</View>
				}
			/>

			{/* FAB (Floating Action Button) */}
			<TouchableOpacity
				style={styles.addBtn}
				onPress={() => navigation.navigate("AddTodo" as never)}
			>
				<Ionicons name="add" size={30} color={colors.WHITE} />
			</TouchableOpacity>
		</View>
	);
}

// ... kode styles (tetap sama) ...

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
		paddingLeft: 60,
		marginHorizontal: 12,
		marginVertical: 6,
		borderRadius: 12,
		shadowColor: colors.SHADOW,
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 3,
		position: "relative",
	},
	contentContainer: {
		// Konten utama
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
		color: colors.TEXT_DARK,
		marginBottom: 4,
	},
	description: {
		fontSize: 14,
		color: colors.TEXT_GREY,
		lineHeight: 20,
		marginBottom: 4,
	},
	date: {
		fontSize: 12,
		color: colors.TEXT_LIGHT_GREY,
		marginTop: 4,
	},
	titleChecked: {
		textDecorationLine: "line-through",
		color: colors.TEXT_LIGHT_GREY,
	},
	descriptionChecked: {
		textDecorationLine: "line-through",
		color: colors.TEXT_LIGHT_GREY,
	},

	checkButton: {
		position: "absolute",
		left: 10,
		top: 22,
		padding: 5,
		zIndex: 10,
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
