import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
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

import Colors from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { ChangePasswordScreenProps } from "@/types/navigation";

function ChangePasswordScreen({ navigation }: ChangePasswordScreenProps) {
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showCurrent, setShowCurrent] = useState(false);
	const [showNew, setShowNew] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);

	const { changePassword } = useAuth();

	const handleSubmit = async () => {
		if (!currentPassword || !newPassword || !confirmPassword) {
			Alert.alert("Error", "Semua field harus diisi");
			return;
		}
		if (newPassword.length < 6) {
			Alert.alert("Error", "Password baru minimal 6 karakter");
			return;
		}
		if (newPassword !== confirmPassword) {
			Alert.alert("Error", "Password baru tidak cocok");
			return;
		}

		try {
			await changePassword(currentPassword, newPassword);
			Alert.alert("Sukses", "Password berhasil diubah", [
				{ text: "OK", onPress: () => navigation.goBack() },
			]);
		} catch (err: any) {
			Alert.alert("Gagal", err.message);
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
				<Text style={styles.title}>Change Password</Text>
				<Text style={styles.subtitle}>
					Masukkan password lama dan buat password baru yang kuat
				</Text>

				{/* Current Password */}
				<Text style={styles.label}>Current Password</Text>
				<View style={styles.inputWrapper}>
					<TextInput
						style={styles.input}
						placeholder="••••••••"
						placeholderTextColor={Colors.TEXT_LIGHT_GREY}
						value={currentPassword}
						onChangeText={setCurrentPassword}
						secureTextEntry={!showCurrent}
						autoCapitalize="none"
					/>
					<TouchableOpacity
						onPress={() => setShowCurrent(!showCurrent)}
						style={styles.eyeIcon}
					>
						<Ionicons
							name={showCurrent ? "eye-off" : "eye"}
							size={20}
							color={Colors.TEXT_GREY}
						/>
					</TouchableOpacity>
				</View>

				<View style={styles.divider} />

				{/* New Password */}
				<Text style={styles.label}>New Password</Text>
				<View style={styles.inputWrapper}>
					<TextInput
						style={styles.input}
						placeholder="••••••••"
						placeholderTextColor={Colors.TEXT_LIGHT_GREY}
						value={newPassword}
						onChangeText={setNewPassword}
						secureTextEntry={!showNew}
						autoCapitalize="none"
					/>
					<TouchableOpacity
						onPress={() => setShowNew(!showNew)}
						style={styles.eyeIcon}
					>
						<Ionicons
							name={showNew ? "eye-off" : "eye"}
							size={20}
							color={Colors.TEXT_GREY}
						/>
					</TouchableOpacity>
				</View>
				<Text style={styles.helperText}>
					Password harus mengandung huruf kecil, kapital, dan angka
				</Text>

				{/* Confirm New Password */}
				<Text style={styles.label}>Confirm New Password</Text>
				<View style={styles.inputWrapper}>
					<TextInput
						style={styles.input}
						placeholder="••••••••"
						placeholderTextColor={Colors.TEXT_LIGHT_GREY}
						value={confirmPassword}
						onChangeText={setConfirmPassword}
						secureTextEntry={!showConfirm}
						autoCapitalize="none"
					/>
					<TouchableOpacity
						onPress={() => setShowConfirm(!showConfirm)}
						style={styles.eyeIcon}
					>
						<Ionicons
							name={showConfirm ? "eye-off" : "eye"}
							size={20}
							color={Colors.TEXT_GREY}
						/>
					</TouchableOpacity>
				</View>

				{/* Submit Button */}
				<TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
					<Text style={styles.submitText}>Update Password</Text>
					<Ionicons name="arrow-forward" size={24} color={Colors.WHITE} />
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
		lineHeight: 24,
	},
	label: {
		fontSize: 16,
		color: Colors.TEXT_DARK,
		marginBottom: 8,
		marginTop: 16,
	},
	inputWrapper: {
		position: "relative",
	},
	input: {
		borderWidth: 1,
		borderColor: Colors.INPUT_BORDER,
		borderRadius: 12,
		padding: 16,
		paddingRight: 50,
		fontSize: 16,
		backgroundColor: Colors.INPUT_BG,
	},
	eyeIcon: {
		position: "absolute",
		right: 16,
		top: 16,
	},
	helperText: {
		fontSize: 14,
		color: Colors.TEXT_GREY,
		marginTop: 8,
	},
	divider: {
		height: 1,
		backgroundColor: Colors.DIVIDER,
		marginVertical: 30,
	},
	submitBtn: {
		backgroundColor: Colors.PRIMARY_PURPLE,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 18,
		borderRadius: 30,
		marginTop: 40,
		gap: 10,
	},
	submitText: {
		color: Colors.WHITE,
		fontSize: 18,
		fontWeight: "600",
	},
});

export default ChangePasswordScreen;
