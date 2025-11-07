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
import { ForgotPasswordScreenProps } from "@/types/navigation";

function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
	const [email, setEmail] = useState("");
	const { resetPassword } = useAuth();

	const handleSendReset = async () => {
		if (!email) {
			Alert.alert("Error", "Masukkan alamat email Anda");
			return;
		}

		try {
			await resetPassword(email);
			Alert.alert(
				"Cek email Anda",
				`Link reset password telah dikirim ke ${email}`,
				[{ text: "OK", onPress: () => navigation.goBack() }]
			);
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
				{/* Back to Login */}
				<TouchableOpacity
					onPress={() => navigation.goBack()}
					style={styles.backBtn}
				>
					<Ionicons name="arrow-back" size={24} color={Colors.PRIMARY_PURPLE} />
					<Text style={styles.backText}>Back to Login</Text>
				</TouchableOpacity>

				{/* Title & Subtitle */}
				<Text style={styles.title}>Forgot Password</Text>
				<Text style={styles.subtitle}>
					Masukkan alamat email Anda untuk menerima link reset password
				</Text>

				{/* Email */}
				<Text style={styles.label}>Email Address</Text>
				<TextInput
					style={styles.input}
					placeholder="contoh: anto_michael@gmail.com"
					placeholderTextColor={Colors.TEXT_LIGHT_GREY}
					value={email}
					onChangeText={setEmail}
					keyboardType="email-address"
					autoCapitalize="none"
					autoCorrect={false}
				/>

				{/* Send Button – SAMA PERSIS LOGIN/REGISTER */}
				<TouchableOpacity style={styles.sendBtn} onPress={handleSendReset}>
					<Text style={styles.sendText}>Send Reset Link</Text>
					<Ionicons name="arrow-forward" size={24} color={Colors.WHITE} />
				</TouchableOpacity>

				{/* Extra space */}
				<View style={{ height: 100 }} />
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
	backBtn: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 40,
		alignSelf: "flex-start",
	},
	backText: {
		color: Colors.PRIMARY_PURPLE,
		fontSize: 16,
		fontWeight: "600",
		marginLeft: 8,
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
		marginBottom: 50,
		lineHeight: 24,
	},
	label: {
		fontSize: 16,
		color: Colors.TEXT_DARK,
		marginBottom: 8,
	},
	input: {
		borderWidth: 1,
		borderColor: Colors.INPUT_BORDER,
		borderRadius: 12,
		padding: 16,
		fontSize: 16,
		backgroundColor: Colors.INPUT_BG,
		marginBottom: 40,
	},
	sendBtn: {
		backgroundColor: Colors.PRIMARY_PURPLE,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 18,
		borderRadius: 30,
		gap: 10,
	},
	sendText: {
		color: Colors.WHITE,
		fontSize: 18,
		fontWeight: "600",
	},
});

export default ForgotPasswordScreen;
