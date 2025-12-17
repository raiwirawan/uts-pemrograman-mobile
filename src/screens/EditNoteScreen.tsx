// import { storage } from "@/config/firebase";
import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute } from "@react-navigation/native";
// import * as ImagePicker from "expo-image-picker";
// import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Image,
	Keyboard,
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

	const headerHeight = useHeaderHeight();

	// const [permission, requestPermission] = ImagePicker.useCameraPermissions();
	const note = route.params?.note;

	// === STATE DATA ===
	const [title, setTitle] = useState(note?.title ?? "");
	const [content, setContent] = useState(note?.content ?? "");
	const [imageUri, setImageUri] = useState<string | null>(
		note?.imageUrl ?? null
	);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(
		note?.imageUrl ?? null
	);

	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [hasChanges, setHasChanges] = useState(false);

	const [isEditing, setIsEditing] = useState(false);

	// State untuk melacak apakah keyboard terlihat atau tidak
	const [isKeyboardVisible, setKeyboardVisible] = useState(false);

	const scrollViewRef = useRef<ScrollView>(null);

	// === DETEKSI KEYBOARD (LOGIKA BARU) ===
	useEffect(() => {
		const keyboardDidShowListener = Keyboard.addListener(
			"keyboardDidShow",
			() => {
				setKeyboardVisible(true); // Keyboard Muncul -> Aktifkan Padding Besar
			}
		);
		const keyboardDidHideListener = Keyboard.addListener(
			"keyboardDidHide",
			() => {
				setKeyboardVisible(false); // Keyboard Hilang -> Matikan Padding
			}
		);

		return () => {
			keyboardDidHideListener.remove();
			keyboardDidShowListener.remove();
		};
	}, []);

	// === INITIAL CHECK ===
	useEffect(() => {
		if (!note) {
			Alert.alert("Error", "Catatan tidak ditemukan", [
				{ text: "Kembali", onPress: () => navigation.goBack() },
			]);
		}
	}, [note, navigation]);

	// === HEADER BUTTON (TOGGLE) ===
	useLayoutEffect(() => {
		navigation.setOptions({
			headerTitle: isEditing ? "Edit Catatan" : "Lihat Catatan",
			headerRight: () => (
				<TouchableOpacity
					onPress={() => {
						if (isEditing) Keyboard.dismiss();
						setIsEditing((prev) => !prev);
					}}
					style={{ marginRight: 15 }}
					disabled={saving || deleting}
				>
					<Ionicons
						name={isEditing ? "eye-outline" : "create-outline"}
						size={24}
						color={colors.PRIMARY_PURPLE}
					/>
				</TouchableOpacity>
			),
		});
	}, [navigation, isEditing, saving, deleting]);

	// === BACK HANDLER ===
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
			Alert.alert("Error", "Judul & isi wajib diisi");
			return;
		}
		if (!user?.uid || !note?.id) return;
		setSaving(true);
		Keyboard.dismiss();
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

			await updateNote(user.uid, note.id, {
				title: title.trim(),
				content: content.trim(),
				imageUrl: uploadedImageUrl,
			});

			setHasChanges(false);
			setIsEditing(false);

			Alert.alert("Sukses", "Catatan berhasil disimpan");
		} catch (err: any) {
			Alert.alert("Gagal menyimpan", err.message);
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async () => {
		if (!note?.id) return;
		Alert.alert("Hapus Catatan", "Yakin hapus permanen?", [
			{ text: "Batal", style: "cancel" },
			{
				text: "Hapus",
				style: "destructive",
				onPress: async () => {
					if (!user?.uid) return;
					setDeleting(true);
					try {
						await deleteNote(user.uid, note.id);
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

	if (!note)
		return (
			<View style={styles.centerContent}>
				<ActivityIndicator size="large" color={colors.PRIMARY_PURPLE} />
			</View>
		);

	return (
		<View style={styles.container}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
			>
				<ScrollView
					ref={scrollViewRef}
					style={styles.scrollView}
					contentContainerStyle={[
						styles.scrollContent,
						// DINAMIS: Jika keyboard ada, padding=400. Jika tidak, padding=20 (standar)
						{ paddingBottom: isKeyboardVisible ? 400 : 20 },
					]}
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
				>
					{/* === JUDUL === */}
					{isEditing ? (
						<>
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
						</>
					) : (
						<Text style={styles.viewTitle}>{title}</Text>
					)}

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

					{/* === ISI KONTEN === */}
					{isEditing ? (
						<>
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
								scrollEnabled={false}
							/>
						</>
					) : (
						<>
							<View
								style={{
									height: 1,
									backgroundColor: colors.DIVIDER,
									marginVertical: 15,
								}}
							/>
							<Text style={styles.viewContent}>{content}</Text>
						</>
					)}
				</ScrollView>

				{/* === FOOTER === */}
				{isEditing && (
					<View style={styles.footer}>
						<View style={styles.buttonRow}>
							<TouchableOpacity
								style={styles.iconBtn}
								onPress={takePhoto}
								disabled={saving || deleting}
							>
								<Ionicons
									name="camera-outline"
									size={24}
									color={colors.PRIMARY_PURPLE}
								/>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.iconBtn}
								onPress={pickImage}
								disabled={saving || deleting}
							>
								<Ionicons
									name="image-outline"
									size={24}
									color={colors.PRIMARY_PURPLE}
								/>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.iconBtn}
								onPress={handleDelete}
								disabled={deleting || saving}
							>
								{deleting ? (
									<ActivityIndicator color={colors.DANGER} />
								) : (
									<Ionicons name="trash" size={20} color={colors.DANGER} />
								)}
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
								onPress={handleSave}
								disabled={saving || deleting}
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
				)}
			</KeyboardAvoidingView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: colors.WHITE },

	scrollView: { flex: 1 },
	scrollContent: {
		padding: 20,
		// paddingBottom disini sekarang diatur secara dinamis di inline style komponen ScrollView
	},

	centerContent: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	label: {
		fontSize: 14,
		fontWeight: "600",
		color: colors.TEXT_GREY,
		marginBottom: 8,
	},

	// INPUT STYLES
	titleInput: {
		fontSize: 20,
		fontWeight: "bold",
		paddingVertical: 12,
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
		minHeight: 200,
		backgroundColor: colors.CARD_BG,
		lineHeight: 24,
		textAlignVertical: "top",
	},

	// VIEW STYLES
	viewTitle: {
		fontSize: 26,
		fontFamily: "Poppins-Bold",
		color: colors.TEXT_DARK,
		marginBottom: 15,
	},
	viewContent: {
		fontSize: 16,
		fontFamily: "Poppins-Regular",
		color: colors.TEXT_DARK,
		lineHeight: 26,
	},

	// IMAGE STYLES
	// imageContainer: { marginBottom: 20, position: "relative" },
	previewImage: {
		width: "100%",
		height: 250,
		borderRadius: 12,
		resizeMode: "cover",
		borderWidth: 1,
		borderColor: colors.DIVIDER,
	},
	// removeImageBtn: {
	// 	position: "absolute",
	// 	top: -10,
	// 	right: -10,
	// 	backgroundColor: colors.WHITE,
	// 	borderRadius: 15,
	// },

	// FOOTER STYLES
	footer: {
		paddingHorizontal: 20,
		paddingVertical: 12,
		backgroundColor: colors.WHITE,
		borderTopWidth: 1,
		borderTopColor: colors.DIVIDER,
	},
	buttonRow: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
	iconBtn: {
		flex: 0.5,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 14,
		borderRadius: 12,
		backgroundColor: colors.CARD_BG,
		borderWidth: 1,
		borderColor: colors.DIVIDER,
	},
	saveBtn: {
		flex: 2,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 14,
		borderRadius: 12,
		backgroundColor: colors.FAB_BG,
		gap: 10,
	},
	saveBtnDisabled: { opacity: 0.7 },
	saveText: { color: colors.WHITE, fontSize: 16, fontWeight: "600" },
});
