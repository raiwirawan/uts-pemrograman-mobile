import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
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

import Colors from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { EditProfileScreenProps } from "@/types/navigation";
import { auth } from "../config/firebase";

function EditProfileScreen({ navigation }: EditProfileScreenProps) {
	const { user, updateUserProfile, updateUserEmail, uploadAvatar } = useAuth();
	const [fullName, setFullName] = useState(user?.displayName || "");
	const [email, setEmail] = useState(user?.email || "");
	const [photoURL, setPhotoURL] = useState(
		user?.photoURL || "https://i.pravatar.cc/128?img=12"
	);
	const [loading, setLoading] = useState(false);
	const [uploadingImage, setUploadingImage] = useState(false);

	useEffect(() => {
		setFullName(user?.displayName || "");
		setEmail(user?.email || "");
		setPhotoURL(user?.photoURL || "https://i.pravatar.cc/128?img=12");
	}, [user]);

	const pickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (!result.canceled) {
			setUploadingImage(true);
			try {
				// This will now automatically delete the old image
				const downloadURL = await uploadAvatar(result.assets[0].uri);
				setPhotoURL(downloadURL);
				Alert.alert(
					"Sukses",
					"Foto profil berhasil diupdate. Foto lama sudah dihapus."
				);
			} catch (err: any) {
				Alert.alert("Gagal", err.message);
			} finally {
				setUploadingImage(false);
			}
		}
	};

	const handleSave = async () => {
		if (!fullName || !email) {
			Alert.alert("Error", "Nama dan email harus diisi");
			return;
		}

		setLoading(true);
		try {
			await updateUserProfile({ displayName: fullName.trim() });
			if (email !== user?.email) {
				await updateUserEmail(email.trim());
				Alert.alert("Perhatian", "Email diubah. Silakan login ulang.");
				auth.signOut();
			} else {
				Alert.alert("Sukses", "Profil berhasil diperbarui", [
					{
						text: "OK",
						onPress: () =>
							// @ts-ignore
							navigation.navigate("Home", {
								screen: "Profile",
							}),
					},
				]);
			}
		} catch (err: any) {
			Alert.alert("Gagal", err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={styles.container}
		>
			<ScrollView
				contentContainerStyle={styles.scrollContent}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				<Text style={styles.title}>Edit Profile</Text>
				<Text style={styles.subtitle}>Perbarui informasi profil Anda</Text>

				{/* Avatar */}
				<View style={styles.avatarContainer}>
					{uploadingImage ? (
						<View style={styles.avatarPlaceholder}>
							<ActivityIndicator size="large" color={Colors.PRIMARY_PURPLE} />
							<Text style={styles.uploadingText}>Mengupload...</Text>
						</View>
					) : (
						<Image source={{ uri: photoURL }} style={styles.avatar} />
					)}
					<TouchableOpacity
						style={styles.changePhotoBtn}
						onPress={pickImage}
						disabled={uploadingImage}
					>
						<Ionicons name="camera" size={20} color={Colors.WHITE} />
					</TouchableOpacity>
				</View>

				{/* Full Name */}
				<Text style={styles.label}>Full Name</Text>
				<TextInput
					style={styles.input}
					placeholder="Masukkan nama lengkap"
					placeholderTextColor={Colors.TEXT_LIGHT_GREY}
					value={fullName}
					onChangeText={setFullName}
					autoCapitalize="words"
					editable={!loading}
				/>

				{/* Email */}
				<Text style={styles.label}>Email Address</Text>
				<TextInput
					style={styles.input}
					placeholder="contoh: nama@email.com"
					placeholderTextColor={Colors.TEXT_LIGHT_GREY}
					value={email}
					onChangeText={setEmail}
					keyboardType="email-address"
					autoCapitalize="none"
					autoCorrect={false}
					editable={!loading}
				/>
				<Text style={styles.helperText}>
					Mengubah email akan logout otomatis untuk verifikasi
				</Text>

				{/* Save Button */}
				<TouchableOpacity
					style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
					onPress={handleSave}
					disabled={loading || uploadingImage}
				>
					{loading ? (
						<ActivityIndicator color={Colors.WHITE} />
					) : (
						<>
							<Text style={styles.saveText}>Save Changes</Text>
							<Ionicons name="arrow-forward" size={24} color={Colors.WHITE} />
						</>
					)}
				</TouchableOpacity>

				<View style={{ height: 50 }} />
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.BACKGROUND,
	},
	scrollContent: {
		flexGrow: 1,
		padding: 30,
		paddingTop: 60,
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		color: Colors.DARK_PURPLE,
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: Colors.TEXT_GREY,
		marginBottom: 40,
	},
	avatarContainer: {
		alignItems: "center",
		marginBottom: 30,
	},
	avatar: {
		width: 140,
		height: 140,
		borderRadius: 70,
		borderWidth: 4,
		borderColor: Colors.PRIMARY_PURPLE,
	},
	avatarPlaceholder: {
		width: 140,
		height: 140,
		borderRadius: 70,
		borderWidth: 4,
		borderColor: Colors.PRIMARY_PURPLE,
		backgroundColor: Colors.INPUT_BG,
		justifyContent: "center",
		alignItems: "center",
	},
	uploadingText: {
		marginTop: 8,
		fontSize: 12,
		color: Colors.TEXT_GREY,
	},
	changePhotoBtn: {
		position: "absolute",
		bottom: 0,
		right: 100,
		backgroundColor: Colors.PRIMARY_PURPLE,
		padding: 12,
		borderRadius: 30,
		borderWidth: 3,
		borderColor: Colors.WHITE,
	},
	label: {
		fontSize: 16,
		color: Colors.TEXT_DARK,
		marginBottom: 8,
		marginTop: 16,
	},
	input: {
		borderWidth: 1,
		borderColor: Colors.INPUT_BORDER,
		borderRadius: 12,
		padding: 16,
		fontSize: 16,
		backgroundColor: Colors.INPUT_BG,
	},
	helperText: {
		fontSize: 14,
		color: Colors.TEXT_GREY,
		marginTop: 8,
	},
	saveBtn: {
		backgroundColor: Colors.PRIMARY_PURPLE,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 18,
		borderRadius: 30,
		marginTop: 40,
		gap: 10,
	},
	saveBtnDisabled: {
		opacity: 0.7,
	},
	saveText: {
		color: Colors.WHITE,
		fontSize: 18,
		fontWeight: "600",
	},
});

export default EditProfileScreen;
