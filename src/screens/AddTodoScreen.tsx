import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
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
import { useAuth } from "@/hooks/useAuth";
import { createTodo } from "@/lib/todos";
import { AddTodoScreenProps } from "@/types/navigation";

// Menggunakan AddTodoScreenProps
// eslint-disable-next-line no-empty-pattern
export default function AddTodoScreen({}: AddTodoScreenProps) {
	const { user } = useAuth();
	const navigation = useNavigation<AddTodoScreenProps["navigation"]>();

	// Menggunakan 'description' untuk Todo (bukan 'content')
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [saving, setSaving] = useState(false);
	const [hasChanges, setHasChanges] = useState(false);

	// === BACK HANDLER: CONFIRM UNSAVED CHANGES ===
	useEffect(() => {
		const unsubscribe = navigation.addListener("beforeRemove", (e) => {
			// Cek perubahan hanya pada title atau description
			if (!hasChanges || saving) return;

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
	}, [navigation, hasChanges, saving]);

	// === SAVE TODO ===
	const handleSave = async () => {
		if (!title.trim()) {
			Alert.alert("Error", "Judul To-Do wajib diisi");
			return;
		}

		if (!user?.uid) {
			Alert.alert("Error", "User tidak ditemukan");
			return;
		}

		setSaving(true);
		try {
			// Deskripsi diizinkan kosong
			await createTodo(user.uid, title.trim(), description.trim());
			setHasChanges(false);
			navigation.goBack();
		} catch (err: any) {
			console.error("Error creating todo:", err);
			Alert.alert(
				"Gagal menyimpan",
				err.message || "Pastikan izin Firebase sudah benar."
			);
		} finally {
			setSaving(false);
		}
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={styles.container}
			// Sesuaikan offset agar tombol tidak tertutup keyboard
			keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 50}
		>
			{/* SCROLL CONTENT */}
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
					placeholder="Masukkan judul To-Do..."
					placeholderTextColor={colors.TEXT_LIGHT_GREY}
					value={title}
					onChangeText={(text) => {
						setTitle(text);
						setHasChanges(true);
					}}
				/>

				{/* DESKRIPSI (menggantikan Isi Catatan) */}
				<Text style={styles.label}>Deskripsi (Opsional)</Text>
				<TextInput
					style={styles.contentInput}
					placeholder="Tulis detail To-Do di sini..."
					placeholderTextColor={colors.TEXT_LIGHT_GREY}
					value={description}
					onChangeText={(text) => {
						setDescription(text);
						setHasChanges(true);
					}}
					multiline
					textAlignVertical="top"
				/>
			</ScrollView>

			{/* FOOTER - Tombol Simpan */}
			<View style={styles.footer}>
				<View style={styles.buttonRow}>
					<TouchableOpacity
						style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
						onPress={handleSave}
						disabled={saving || !title.trim()} // Nonaktif jika saving atau title kosong
					>
						{saving ? (
							<ActivityIndicator color={colors.WHITE} />
						) : (
							<>
								<Ionicons name="checkmark" size={20} color={colors.WHITE} />
								<Text style={styles.saveText}>Simpan To-Do</Text>
							</>
						)}
					</TouchableOpacity>
				</View>
			</View>
		</KeyboardAvoidingView>
	);
}

// STYLES SAMA PERSIS DENGAN ADDNOTE/EDITNOTE UNTUK KONSISTENSI
const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: colors.WHITE,
	},
	container: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
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
		minHeight: 320,
		backgroundColor: colors.CARD_BG,
		lineHeight: 24,
		color: colors.TEXT_DARK,
	},
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
	},
	buttonRow: {
		flexDirection: "row",
		justifyContent: "center",
		gap: 12,
	},
	saveBtn: {
		flex: 1, // Menggunakan flex 1 karena hanya ada 1 tombol save
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
	// Gaya untuk konsistensi dengan Notes
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
