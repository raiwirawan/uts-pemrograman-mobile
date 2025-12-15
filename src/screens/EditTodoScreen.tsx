import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

import colors from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth"; // Asumsi alias ini berfungsi
import { EditTodoScreenProps } from "@/types/navigation"; // Asumsi alias ini berfungsi
import { Todo, deleteTodo, getTodo, updateTodo } from "../lib/todos"; // <-- PERBAIKAN IMPORT


// eslint-disable-next-line no-empty-pattern
export default function EditTodoScreen({}: EditTodoScreenProps) {
	const route = useRoute<EditTodoScreenProps["route"]>();
	const navigation = useNavigation<EditTodoScreenProps["navigation"]>();
	const { user } = useAuth();
	const todoId = route.params?.todoId;

	const [todo, setTodo] = useState<Todo | null>(null);
	const [loading, setLoading] = useState(true);

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [checked, setChecked] = useState(false);

	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);

	// Fungsi utilitas untuk formatting tanggal (sama dengan di TodoListScreen)
	const formatUpdateDate = (date: any) => {
		if (!date) return "N/A";
		// Cek apakah ini objek Timestamp dari Firestore
		if (date.toDate) {
			return date.toDate().toLocaleString();
		}
		// Cek apakah ini objek Date biasa
		if (date instanceof Date) {
			return date.toLocaleString();
		}
		return "N/A";
	};

	// === FETCH DATA TO-DO ===
	const fetchTodo = useCallback(async () => {
		if (!user?.uid || !todoId) return;
		setLoading(true);
		try {
			const fetchedTodo = await getTodo(user.uid, todoId);
			if (fetchedTodo) {
				setTodo(fetchedTodo);
				// Inisialisasi state form dengan data yang dimuat
				setTitle(fetchedTodo.title);
				setDescription(fetchedTodo.description ?? "");
				setChecked(fetchedTodo.checked);
			} else {
				Alert.alert("Error", "To-Do tidak ditemukan", [
					{ text: "Kembali", onPress: () => navigation.goBack() },
				]);
			}
		} catch (error) {
			console.error("Gagal memuat To-Do:", error);
			Alert.alert("Error", "Gagal memuat To-Do");
		} finally {
			setLoading(false);
		}
	}, [user?.uid, todoId, navigation]);

	useEffect(() => {
		fetchTodo();
	}, [fetchTodo]);

	// === Pengecekan Perubahan ===
	// Pastikan todo sudah dimuat sebelum mengambil nilai inisial
	const initialTitle = todo?.title ?? "";
	const initialDescription = todo?.description ?? "";
	const initialChecked = todo?.checked ?? false;

	// Hitung perubahan lokal
	const hasChanges =
		title.trim() !== initialTitle.trim() ||
		description.trim() !== initialDescription.trim() ||
		checked !== initialChecked;

	// === BACK HANDLER: CONFIRM UNSAVED CHANGES ===
	useEffect(() => {
		const unsubscribe = navigation.addListener("beforeRemove", (e) => {
			if (!hasChanges || saving || deleting) return;

			e.preventDefault();
			Alert.alert(
				"Buang perubahan?",
				"To-Do belum disimpan. Keluar tanpa simpan?",
				[
					{ text: "Tetap di sini", style: "cancel" },
					{
						text: "Buang",
						style: "destructive",
						onPress: () => navigation.dispatch(e.data.action),
					},
				]
			);
		});
		return unsubscribe;
	}, [navigation, hasChanges, saving, deleting]);

	const handleSave = async () => {
		if (!title.trim()) {
			Alert.alert("Error", "Judul To-Do wajib diisi");
			return;
		}
		if (!user?.uid || !todo?.id) return;

		setSaving(true);
		try {
			await updateTodo(user.uid, todo.id, {
				title: title.trim(),
				description: description.trim(),
				checked: checked,
			});
			navigation.goBack();
		} catch (err: any) {
			Alert.alert("Gagal menyimpan", err.message);
		} finally {
			setSaving(false);
		}
	};

	const handleToggleCheck = () => {
		// Toggle checked state secara lokal
		setChecked((prev) => !prev);
	};

	const handleDelete = async () => {
		if (!todo?.id) return;
		Alert.alert("Hapus To-Do", "To-Do ini akan dihapus permanen.", [
			{ text: "Batal", style: "cancel" },
			{
				text: "Hapus",
				style: "destructive",
				onPress: async () => {
					if (!user?.uid || !todo?.id) return;
					setDeleting(true);
					try {
						await deleteTodo(user.uid, todo.id);
						navigation.navigate("Home" as never);
					} catch (err: any) {
						Alert.alert("Gagal menghapus", err.message);
					} finally {
						setDeleting(false);
					}
				},
			},
		]);
	};

	if (loading || !todo) {
		return (
			<View style={styles.centerContent}>
				<ActivityIndicator size="large" color={colors.PRIMARY_PURPLE} />
				<Text style={styles.loadingText}>
					{loading ? "Memuat To-Do..." : "To-Do tidak ditemukan"}
				</Text>
			</View>
		);
	}

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={styles.container}
			keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 50}
		>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				{/* JUDUL */}
				<Text style={styles.label}>Judul To-Do</Text>
				<TextInput
					style={styles.titleInput}
					placeholder="Masukkan judul..."
					placeholderTextColor={colors.TEXT_LIGHT_GREY}
					value={title}
					onChangeText={(text) => {
						setTitle(text);
					}}
				/>

				{/* DESKRIPSI */}
				<Text style={styles.label}>Deskripsi (Opsional)</Text>
				<TextInput
					style={styles.contentInput}
					placeholder="Tulis deskripsi To-Do di sini..."
					placeholderTextColor={colors.TEXT_LIGHT_GREY}
					value={description}
					onChangeText={(text) => {
						setDescription(text);
					}}
					multiline
					textAlignVertical="top"
				/>

				{/* TANGGAL DIBUAT (PERBAIKAN UI) */}
				<View style={styles.dateInfoContainer}>
					<Text style={styles.dateInfoText}>
						<Text style={styles.dateInfoLabel}>Dibuat:</Text>{" "}
						{formatUpdateDate(todo.createdAt)}
					</Text>
					<Text style={styles.dateInfoText}>
						<Text style={styles.dateInfoLabel}>Terakhir Diperbarui:</Text>{" "}
						{formatUpdateDate(todo.updatedAt)}
					</Text>
					<Text style={styles.dateInfoText}>
						<Text style={styles.dateInfoLabel}>Status:</Text>{" "}
						{checked ? "Selesai" : "Belum Selesai"}
					</Text>
				</View>
			</ScrollView>

			{/* FOOTER - Tombol Aksi */}
			<View style={styles.footer}>
				<View style={styles.buttonRow}>
					{/* Tombol Delete */}
					<TouchableOpacity
						style={[
							styles.deleteBtn,
							(deleting || saving) && styles.deleteBtnDisabled,
						]}
						onPress={handleDelete}
						disabled={deleting || saving}
					>
						{deleting ? (
							<ActivityIndicator color={colors.DANGER} />
						) : (
							<>
								<Ionicons name="trash" size={20} color={colors.DANGER} />
								<Text style={styles.deleteText}>Hapus</Text>
							</>
						)}
					</TouchableOpacity>

					{/* Tombol Toggle Checked */}
					<TouchableOpacity
						style={[styles.checkBtn, saving && styles.saveBtnDisabled]}
						onPress={handleToggleCheck}
						disabled={saving}
					>
						<Ionicons
							name={checked ? "close" : "checkmark-done"}
							size={20}
							color={checked ? colors.TEXT_DARK : colors.WHITE}
						/>
						<Text style={checked ? styles.uncheckText : styles.checkText}>
							{checked ? "Batalkan Selesai" : "Tandai Selesai"}
						</Text>
					</TouchableOpacity>

					{/* Tombol Save */}
					<TouchableOpacity
						style={[
							styles.saveBtn,
							(saving || !title.trim() || !hasChanges) &&
								styles.saveBtnDisabled,
						]}
						onPress={handleSave}
						disabled={saving || !title.trim() || !hasChanges}
					>
						{saving ? (
							<ActivityIndicator color={colors.WHITE} />
						) : (
							<>
								<Ionicons name="checkmark" size={20} color={colors.WHITE} />
								<Text style={styles.saveText}>Simpan</Text>
							</>
						)}
					</TouchableOpacity>
				</View>
			</View>
		</KeyboardAvoidingView>
	);
}

// ... Styles (Tetap sama)
const styles = StyleSheet.create({
	container: {
		flex: 1,
		height: "100%",
	},
	scrollView: {
		flex: 1,
		height: "100%",
	},
	scrollContent: {
		padding: 20,
		paddingBottom: 20,
	},
	label: {
		fontSize: 14,
		fontWeight: "600",
		color: colors.TEXT_GREY,
		marginBottom: 8,
	},
	titleInput: {
		fontSize: 20,
		fontWeight: "bold",
		paddingVertical: 14,
		paddingHorizontal: 16,
		borderWidth: 1,
		borderColor: colors.DIVIDER,
		borderRadius: 12,
		marginBottom: 20,
		backgroundColor: colors.CARD_BG,
		color: colors.TEXT_DARK,
	},
	contentInput: {
		fontSize: 16,
		padding: 16,
		borderWidth: 1,
		borderColor: colors.DIVIDER,
		borderRadius: 12,
		minHeight: 250,
		backgroundColor: colors.CARD_BG,
		lineHeight: 24,
		color: colors.TEXT_DARK,
	},
	dateInfoContainer: {
		marginTop: 20,
		padding: 15,
		borderWidth: 1,
		borderColor: colors.DIVIDER,
		borderRadius: 12,
		backgroundColor: colors.CARD_BG,
		marginBottom: 20,
	},
	dateInfoText: {
		fontSize: 14,
		color: colors.TEXT_GREY,
		lineHeight: 24,
	},
	dateInfoLabel: {
		fontWeight: "bold",
		color: colors.TEXT_DARK,
	},
	// FOOTER
	footer: {
		paddingHorizontal: 20,
		paddingVertical: 16,
		backgroundColor: colors.WHITE,
		borderTopWidth: 1,
		borderTopColor: colors.DIVIDER,
		elevation: 8,
		shadowColor: colors.SHADOW,
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		height: 100,
	},
	buttonRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		gap: 12,
	},
	deleteBtn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 16,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.DANGER,
		backgroundColor: colors.WHITE,
		gap: 8,
	},
	deleteBtnDisabled: {
		opacity: 0.6,
	},
	deleteText: {
		color: colors.DANGER,
		fontSize: 14,
		fontWeight: "600",
	},
	checkBtn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 16,
		borderRadius: 12,
		backgroundColor: colors.INFO,
		gap: 8,
	},
	checkText: {
		color: colors.WHITE,
		fontSize: 14,
		fontWeight: "600",
	},
	uncheckText: {
		color: colors.TEXT_DARK,
		fontSize: 14,
		fontWeight: "600",
	},
	saveBtn: {
		flex: 1.5,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 16,
		borderRadius: 12,
		backgroundColor: colors.FAB_BG,
		gap: 10,
	},
	saveBtnDisabled: {
		opacity: 0.7,
	},
	saveText: {
		color: colors.WHITE,
		fontSize: 16,
		fontWeight: "600",
	},
	centerContent: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	loadingText: {
		marginTop: 16,
		color: colors.TEXT_GREY,
		fontSize: 16,
	},
});
