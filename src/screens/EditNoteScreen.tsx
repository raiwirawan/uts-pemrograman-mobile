// screens/EditNoteScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Image,
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
import { deleteNote, updateNote } from "@/lib/notes";
import {
	deleteNoteImage,
	pickImage,
	takePhoto,
	uploadNoteImage,
} from "@/lib/storage";
import { EditNoteScreenProps } from "@/types/navigation";

// eslint-disable-next-line no-empty-pattern
export default function EditNoteScreen({}: EditNoteScreenProps) {
	const route = useRoute<EditNoteScreenProps["route"]>();
	const navigation = useNavigation<EditNoteScreenProps["navigation"]>();
	const { user } = useAuth();

	const note = route.params?.note;

	useEffect(() => {
		if (!note) {
			Alert.alert("Error", "Catatan tidak ditemukan", [
				{ text: "Kembali", onPress: () => navigation.goBack() },
			]);
		}
	}, [note, navigation]);

	const [title, setTitle] = useState(note?.title ?? "");
	const [content, setContent] = useState(note?.content ?? "");
	const [imageUri, setImageUri] = useState<string | null>(
		note?.imageUrl ?? null
	);
	const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(
		note?.imageUrl ?? null
	);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [hasChanges, setHasChanges] = useState(false);

	useEffect(() => {
		const unsubscribe = navigation.addListener("beforeRemove", (e) => {
			if (!hasChanges || saving || deleting) return;
			e.preventDefault();
			Alert.alert(
				"Buang perubahan?",
				"Catatan belum disimpan. Keluar tanpa simpan?",
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

	// === PICK IMAGE FROM GALLERY ===
	const handlePickImage = async () => {
		try {
			setUploading(true);
			const uri = await pickImage();
			if (uri) {
				setImageUri(uri);
				setHasChanges(true);
			}
		} catch (error: any) {
			Alert.alert("Error", error.message);
		} finally {
			setUploading(false);
		}
	};

	// === TAKE PHOTO WITH CAMERA ===
	const handleTakePhoto = async () => {
		try {
			setUploading(true);
			const uri = await takePhoto();
			if (uri) {
				setImageUri(uri);
				setHasChanges(true);
			}
		} catch (error: any) {
			Alert.alert("Error", error.message);
		} finally {
			setUploading(false);
		}
	};

	// === REMOVE IMAGE ===
	const handleRemoveImage = () => {
		Alert.alert("Hapus Gambar", "Yakin ingin menghapus gambar ini?", [
			{ text: "Batal", style: "cancel" },
			{
				text: "Hapus",
				style: "destructive",
				onPress: () => {
					setImageUri(null);
					setHasChanges(true);
				},
			},
		]);
	};

	// === SHOW IMAGE OPTIONS ===
	const showImageOptions = () => {
		Alert.alert("Tambah Gambar", "Pilih sumber gambar", [
			{
				text: "Kamera",
				onPress: handleTakePhoto,
			},
			{
				text: "Galeri",
				onPress: handlePickImage,
			},
			{
				text: "Batal",
				style: "cancel",
			},
		]);
	};

	// === SAVE NOTE ===
	const handleSave = async () => {
		if (!title.trim() || !content.trim()) {
			Alert.alert("Error", "Judul dan isi catatan wajib diisi");
			return;
		}
		if (!user?.uid || !note?.id) return;

		setSaving(true);
		try {
			let uploadedImageUrl: string | null = imageUri;

			// Check if image changed
			const imageChanged = imageUri !== originalImageUrl;

			if (imageChanged) {
				// Delete old image if exists
				if (originalImageUrl) {
					try {
						await deleteNoteImage(originalImageUrl);
					} catch (error) {
						console.error("Failed to delete old image:", error);
					}
				}

				// Upload new image if exists and is local URI
				if (imageUri && !imageUri.startsWith("http")) {
					try {
						uploadedImageUrl = await uploadNoteImage(
							user.uid,
							note.id,
							imageUri
						);
					} catch (uploadError: any) {
						Alert.alert(
							"Peringatan",
							`Gambar gagal diupload: ${uploadError.message}. Lanjutkan tanpa gambar baru?`,
							[
								{ text: "Batal", style: "cancel" },
								{
									text: "Lanjutkan",
									onPress: async () => {
										await updateNote(user.uid, note.id, {
											title: title.trim(),
											content: content.trim(),
											imageUrl: null,
										});
										setHasChanges(false);
										navigation.goBack();
									},
								},
							]
						);
						setSaving(false);
						return;
					}
				}
			}

			// Update note
			await updateNote(user.uid, note.id, {
				title: title.trim(),
				content: content.trim(),
				imageUrl: uploadedImageUrl,
			});

			setHasChanges(false);
			navigation.goBack();
		} catch (err: any) {
			Alert.alert("Gagal menyimpan", err.message);
		} finally {
			setSaving(false);
		}
	};

	// === DELETE NOTE ===
	const handleDelete = async () => {
		if (!note?.id) return;
		Alert.alert("Hapus Catatan", "Catatan ini akan dihapus permanen.", [
			{ text: "Batal", style: "cancel" },
			{
				text: "Hapus",
				style: "destructive",
				onPress: async () => {
					if (!user?.uid) return;
					setDeleting(true);
					try {
						await deleteNote(user.uid, note.id);
						navigation.navigate("Home");
					} catch (err: any) {
						Alert.alert("Gagal menghapus", err.message);
					} finally {
						setDeleting(false);
					}
				},
			},
		]);
	};

	if (!note) {
		return (
			<View style={styles.centerContent}>
				<ActivityIndicator size="large" color={colors.PRIMARY_PURPLE} />
				<Text style={styles.loadingText}>Memuat catatan...</Text>
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
				<Text style={styles.label}>Judul</Text>
				<TextInput
					style={styles.titleInput}
					placeholder="Masukkan judul..."
					placeholderTextColor={colors.TEXT_LIGHT_GREY}
					value={title}
					onChangeText={(text) => {
						setTitle(text);
						setHasChanges(true);
					}}
				/>

				{/* GAMBAR SECTION */}
				<Text style={styles.label}>Gambar (Opsional)</Text>
				{imageUri ? (
					<View style={styles.imageContainer}>
						<Image source={{ uri: imageUri }} style={styles.imagePreview} />
						<TouchableOpacity
							style={styles.removeImageBtn}
							onPress={handleRemoveImage}
						>
							<Ionicons name="close-circle" size={32} color={colors.DANGER} />
						</TouchableOpacity>
					</View>
				) : (
					<TouchableOpacity
						style={styles.addImageBtn}
						onPress={showImageOptions}
						disabled={uploading}
					>
						{uploading ? (
							<ActivityIndicator color={colors.PRIMARY_PURPLE} />
						) : (
							<>
								<Ionicons
									name="image-outline"
									size={32}
									color={colors.PRIMARY_PURPLE}
								/>
								<Text style={styles.addImageText}>Tambah Gambar</Text>
							</>
						)}
					</TouchableOpacity>
				)}

				{/* ISI CATATAN */}
				<Text style={styles.label}>Isi Catatan</Text>
				<TextInput
					style={styles.contentInput}
					placeholder="Tulis isi catatan di sini..."
					placeholderTextColor={colors.TEXT_LIGHT_GREY}
					value={content}
					onChangeText={(text) => {
						setContent(text);
						setHasChanges(true);
					}}
					multiline
					textAlignVertical="top"
				/>
			</ScrollView>

			{/* FOOTER */}
			<View style={styles.footer}>
				<View style={styles.buttonRow}>
					<TouchableOpacity
						style={[styles.deleteBtn, deleting && styles.deleteBtnDisabled]}
						onPress={handleDelete}
						disabled={deleting}
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

					<TouchableOpacity
						style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
						onPress={handleSave}
						disabled={saving}
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
		flex: 1,
		height: "100%",
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
	},
	imageContainer: {
		position: "relative",
		marginBottom: 20,
		borderRadius: 12,
		overflow: "hidden",
	},
	imagePreview: {
		width: "100%",
		height: 200,
		borderRadius: 12,
		backgroundColor: colors.DIVIDER,
	},
	removeImageBtn: {
		position: "absolute",
		top: 8,
		right: 8,
		backgroundColor: colors.WHITE,
		borderRadius: 16,
	},
	addImageBtn: {
		height: 120,
		borderWidth: 2,
		borderStyle: "dashed",
		borderColor: colors.PRIMARY_PURPLE,
		borderRadius: 12,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 20,
		backgroundColor: colors.CARD_BG,
		gap: 8,
	},
	addImageText: {
		color: colors.PRIMARY_PURPLE,
		fontSize: 16,
		fontWeight: "600",
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
		fontSize: 16,
		fontWeight: "600",
	},
	saveBtn: {
		flex: 2,
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
