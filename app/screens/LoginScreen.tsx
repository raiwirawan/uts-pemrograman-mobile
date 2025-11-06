import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import {
	GoogleAuthProvider,
	signInWithCredential,
	signInWithEmailAndPassword,
} from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { auth } from "../../config/firebase";

WebBrowser.maybeCompleteAuthSession();
export default function LoginScreen({
	navigation,
}: {
	navigation: NativeStackNavigationProp<any>;
}) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const [request, response, promptAsync] = Google.useAuthRequest({
		clientId: process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID,
		webClientId: process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID,
	});

	useEffect(() => {
		if (response?.type === "success") {
			const { id_token } = response.params;
			const credential = GoogleAuthProvider.credential(id_token);
			signInWithCredential(auth, credential)
				.then(() => {
					// Sukses → akan otomatis ke Home via onAuthStateChanged
				})
				.catch((error) => {
					Alert.alert("Google Login Failed", error.message);
				});
		}
	}, [response]);

	// Cek user sudah login belum
	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			if (user) navigation.replace("Home");
		});
		return unsubscribe;
	}, [navigation]);

	const handleEmailLogin = async () => {
		if (!email || !password) {
			Alert.alert("Error", "Please fill all fields");
			return;
		}
		try {
			await signInWithEmailAndPassword(auth, email, password);
		} catch (err) {
			const error = err as Error;
			Alert.alert("Login Failed", error.message);
		}
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={styles.container}
		>
			<View style={styles.inner}>
				{/* Title */}
				<Text style={styles.title}>{"Let's Login"}</Text>
				<Text style={styles.subtitle}>And notes your idea</Text>

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

				{/* Forgot Password */}
				<TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
					<Text style={styles.forgot}>Forgot Password?</Text>
				</TouchableOpacity>

				{/* Login Button */}
				<TouchableOpacity style={styles.loginBtn} onPress={handleEmailLogin}>
					<Text style={styles.loginText}>Login</Text>
					<Text style={styles.arrow}>
						<Ionicons name="arrow-forward" size={24} color="#fff" />
					</Text>
				</TouchableOpacity>

				{/* Or */}
				<Text style={styles.or}>Or</Text>

				{/* Google Button */}
				<TouchableOpacity
					style={styles.googleBtn}
					disabled={!request}
					onPress={() => {
						promptAsync();
					}}
				>
					{/* <Image
						source={require("../../assets/google-logo.png")} // pastikan path benar
						style={{ width: 24, height: 24 }}
					/> */}
					<Text style={styles.googleText}>Login with Google</Text>
				</TouchableOpacity>

				{/* Register Link */}
				<View style={styles.registerContainer}>
					<Text style={styles.registerText}>{"Don't have any account?"}</Text>
					<TouchableOpacity onPress={() => navigation.navigate("Register")}>
						<Text style={styles.registerLink}>Register here</Text>
					</TouchableOpacity>
				</View>
			</View>
		</KeyboardAvoidingView>
	);
}

// Styles tetap sama (copy dari kode kamu sebelumnya)
const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#fff" },
	inner: { flex: 1, padding: 30, justifyContent: "center" },
	title: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#4A148C",
		marginBottom: 8,
	},
	subtitle: { fontSize: 16, color: "#666", marginBottom: 40 },
	label: { fontSize: 16, color: "#333", marginBottom: 8, marginTop: 16 },
	input: {
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 12,
		padding: 16,
		fontSize: 16,
		backgroundColor: "#fafafa",
	},
	forgot: {
		color: "#4A148C",
		textAlign: "right",
		marginTop: 8,
		fontWeight: "600",
	},
	loginBtn: {
		backgroundColor: "#6A1B9A",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 18,
		borderRadius: 30,
		marginTop: 30,
		gap: 10,
	},
	loginText: { color: "#fff", fontSize: 18, fontWeight: "600" },
	arrow: { color: "#fff", fontSize: 24 },
	or: { textAlign: "center", marginVertical: 20, color: "#999", fontSize: 16 },
	googleBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: "#ddd",
		paddingVertical: 14,
		borderRadius: 30,
		gap: 12,
	},
	googleText: { fontSize: 16, color: "#333" },
	registerContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginTop: 30,
	},
	registerText: { color: "#666" },
	registerLink: { color: "#4A148C", fontWeight: "bold" },
});
