import { Ionicons } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
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
import { auth } from "../../config/firebase"; // pastikan export auth

type ForgotPasswordScreenProps = {
	navigation: NativeStackNavigationProp<any>;
};

export default function ForgotPasswordScreen({
	navigation,
}: ForgotPasswordScreenProps) {
	const [email, setEmail] = useState("");

	const handleSendReset = async () => {
		if (!email) {
			Alert.alert("Error", "Please enter your email address");
			return;
		}

		try {
			await sendPasswordResetEmail(auth, email);
			Alert.alert(
				"Check your email",
				`We have sent a password reset link to ${email}`,
				[{ text: "OK", onPress: () => navigation.goBack() }]
			);
		} catch (err: any) {
			let message = "Failed to send reset email";
			if (err.code === "auth/user-not-found") {
				message = "No account found with this email";
			} else if (err.code === "auth/invalid-email") {
				message = "Please enter a valid email address";
			}
			Alert.alert("Error", message);
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
				{/* Back to Login – tanpa absolute */}
				<TouchableOpacity
					onPress={() => navigation.goBack()}
					style={styles.backBtn}
				>
					<Ionicons name="arrow-back" size={24} color="#6A1B9A" />
					<Text style={styles.backText}>Back to Login</Text>
				</TouchableOpacity>

				{/* Title */}
				<Text style={styles.title}>Forgot Password</Text>
				<Text style={styles.subtitle}>
					Insert your email address to receive a code for creating a new
					password
				</Text>

				{/* Email */}
				<Text style={styles.label}>Email Address</Text>
				<TextInput
					style={styles.input}
					placeholder="anto_michael@gmail.com"
					placeholderTextColor="#999"
					value={email}
					onChangeText={setEmail}
					keyboardType="email-address"
					autoCapitalize="none"
				/>

				{/* Send Code Button */}
				<TouchableOpacity style={styles.sendBtn} onPress={handleSendReset}>
					<Text style={styles.sendText}>Send Code</Text>
				</TouchableOpacity>

				{/* Extra space bawah */}
				<View style={{ height: 100 }} />
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
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
		color: "#6A1B9A",
		fontSize: 16,
		fontWeight: "600",
		marginLeft: 8,
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#4A148C",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: "#666",
		marginBottom: 50,
		lineHeight: 22,
	},
	label: {
		fontSize: 16,
		color: "#333",
		marginBottom: 8,
	},
	input: {
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 12,
		padding: 16,
		fontSize: 16,
		backgroundColor: "#fafafa",
		marginBottom: 40,
	},
	sendBtn: {
		backgroundColor: "#6A1B9A",
		paddingVertical: 18,
		borderRadius: 30,
		alignItems: "center",
		justifyContent: "center",
	},
	sendText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "600",
	},
});
