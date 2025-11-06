import { Ionicons } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import {
	createUserWithEmailAndPassword,
	GoogleAuthProvider,
	signInWithCredential,
	updateProfile,
} from "firebase/auth";
import React, { useEffect, useState } from "react";
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
import { auth } from "../../config/firebase";

WebBrowser.maybeCompleteAuthSession();

type RegisterScreenProps = {
	navigation: NativeStackNavigationProp<any>;
};

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	// GOOGLE AUTH – FIX SEMUA CLIENT ID
	const [request, response, promptAsync] = Google.useAuthRequest({
		clientId: process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID,
		webClientId: process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID,
	});

	// Handle Google response
	useEffect(() => {
		if (response?.type === "success") {
			const { id_token } = response.params;
			const credential = GoogleAuthProvider.credential(id_token);
			signInWithCredential(auth, credential)
				.then(() => {
					if (fullName && auth.currentUser) {
						updateProfile(auth.currentUser, { displayName: fullName });
					}
				})
				.catch((err) => Alert.alert("Google Register Failed", err.message));
		}
	}, [response, fullName]);

	// Auto redirect kalau sudah login
	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			if (user) navigation.replace("Home");
		});
		return unsubscribe;
	}, [navigation]);

	const handleRegister = async () => {
		if (password.length < 6) {
			Alert.alert("Error", "Password must be at least 6 characters");
			return;
		}

		try {
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				email,
				password
			);
			await updateProfile(userCredential.user, { displayName: fullName });
		} catch (err: any) {
			Alert.alert("Register Failed", err.message || "Unknown error");
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
				{/* Back Button – TANPA absolute */}
				{/* <TouchableOpacity
					onPress={() => navigation.goBack()}
					style={styles.backBtn}
				>
					<Ionicons name="arrow-back" size={24} color="#6A1B9A" />
					<Text style={styles.backText}>Back to Login</Text>
				</TouchableOpacity> */}

				{/* Title */}
				<Text style={styles.title}>Register</Text>
				<Text style={styles.subtitle}>And start taking notes</Text>

				{/* Full Name */}
				<Text style={styles.label}>Full Name</Text>
				<TextInput
					style={styles.input}
					placeholder="Example: John Doe"
					placeholderTextColor="#999"
					value={fullName}
					onChangeText={setFullName}
					autoCapitalize="words"
				/>

				{/* Email */}
				<Text style={styles.label}>Email Address</Text>
				<TextInput
					style={styles.input}
					placeholder="Example: johndoe@gmail.com"
					placeholderTextColor="#999"
					value={email}
					onChangeText={setEmail}
					keyboardType="email-address"
					autoCapitalize="none"
				/>

				{/* Password */}
				<Text style={styles.label}>Password</Text>
				<TextInput
					style={styles.input}
					placeholder="••••••••"
					placeholderTextColor="#999"
					value={password}
					onChangeText={setPassword}
					secureTextEntry
				/>

				{/* Register Button */}
				<TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
					<Text style={styles.registerText}>Register</Text>
					<Ionicons name="arrow-forward" size={24} color="#fff" />
				</TouchableOpacity>

				{/* Or */}
				<Text style={styles.or}>Or</Text>

				{/* Google Button */}
				<TouchableOpacity
					style={[styles.googleBtn, !request && styles.googleBtnDisabled]}
					disabled={!request}
					onPress={() => promptAsync()}
				>
					<Text style={styles.googleText}>Continue with Google</Text>
				</TouchableOpacity>

				<View style={styles.loginContainer}>
					<Text style={styles.loginText}>{"Already have an account?"}</Text>
					<TouchableOpacity onPress={() => navigation.navigate("Login")}>
						<Text style={styles.loginLink}>Login here</Text>
					</TouchableOpacity>
				</View>

				{/* Extra space bawah biar nyaman scroll */}
				<View style={{ height: 50 }} />
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
		paddingTop: 60, // space untuk back button
	},
	backBtn: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 30,
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
		marginBottom: 40,
	},
	label: {
		fontSize: 16,
		color: "#333",
		marginBottom: 8,
		marginTop: 16,
	},
	input: {
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 12,
		padding: 16,
		fontSize: 16,
		backgroundColor: "#fafafa",
	},
	registerBtn: {
		backgroundColor: "#6A1B9A",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 18,
		borderRadius: 30,
		marginTop: 30,
		gap: 10,
	},
	registerText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "600",
	},
	or: {
		textAlign: "center",
		marginVertical: 20,
		color: "#999",
		fontSize: 16,
	},
	googleBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: "#ddd",
		paddingVertical: 14,
		borderRadius: 30,
		gap: 12,
		backgroundColor: "#fff",
	},
	googleBtnDisabled: {
		opacity: 0.6,
	},
	googleText: {
		fontSize: 16,
		color: "#333",
	},
	loginContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginTop: 30,
	},
	loginText: { color: "#666" },
	loginLink: { color: "#4A148C", fontWeight: "bold" },
});
