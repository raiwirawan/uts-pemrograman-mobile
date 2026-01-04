import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
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

import Colors from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { RegisterScreenProps } from "@/types/navigation";

function RegisterScreen({ navigation }: RegisterScreenProps) {
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const { register, googleLogin } = useAuth();

	const handleRegister = async () => {
		// Validation
		if (!fullName || !email || !password) {
			Alert.alert("Error", "Semua field harus diisi");
			return;
		}

		if (fullName.trim().length < 3) {
			Alert.alert("Error", "Nama minimal 3 karakter");
			return;
		}

		if (password.length < 6) {
			Alert.alert("Error", "Password minimal 6 karakter");
			return;
		}

		// Email format validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email.trim())) {
			Alert.alert("Error", "Format email tidak valid");
			return;
		}

		setIsLoading(true);
		try {
			await register(fullName.trim(), email.trim(), password);
			// Navigate to email verification screen
			// @ts-ignore
			navigation.replace("EmailVerification", { email: email.trim() });
		} catch (err: any) {
			Alert.alert("Register Gagal", err.message);
		} finally {
			setIsLoading(false);
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
				<Text style={styles.title}>{"Let's Register"}</Text>
				<Text style={styles.subtitle}>And start taking notes</Text>

				<Text style={styles.label}>Full Name</Text>
				<TextInput
					style={styles.input}
					placeholder="Example: John Doe"
					placeholderTextColor={Colors.TEXT_LIGHT_GREY}
					value={fullName}
					onChangeText={setFullName}
					autoCapitalize="words"
					editable={!isLoading}
				/>

				<Text style={styles.label}>Email Address</Text>
				<TextInput
					style={styles.input}
					placeholder="Example: johndoe@gmail.com"
					placeholderTextColor={Colors.TEXT_LIGHT_GREY}
					value={email}
					onChangeText={setEmail}
					keyboardType="email-address"
					autoCapitalize="none"
					autoCorrect={false}
					editable={!isLoading}
				/>

				<Text style={styles.label}>Password</Text>
				<View style={styles.passwordContainer}>
					<TextInput
						style={styles.passwordInput}
						placeholder="**************"
						placeholderTextColor={Colors.TEXT_LIGHT_GREY}
						value={password}
						onChangeText={setPassword}
						secureTextEntry={!isPasswordVisible}
						autoCapitalize="none"
						editable={!isLoading}
					/>
					<TouchableOpacity
						onPress={() => setIsPasswordVisible(!isPasswordVisible)}
						style={styles.eyeIcon}
						disabled={isLoading}
					>
						<Ionicons
							name={isPasswordVisible ? "eye-off" : "eye"}
							size={24}
							color={Colors.TEXT_LIGHT_GREY}
						/>
					</TouchableOpacity>
				</View>
				<Text style={styles.helperText}>Minimal 6 karakter</Text>

				<TouchableOpacity
					style={[styles.registerBtn, isLoading && styles.btnDisabled]}
					onPress={handleRegister}
					disabled={isLoading}
				>
					{isLoading ? (
						<ActivityIndicator color={Colors.WHITE} />
					) : (
						<>
							<Text style={styles.registerText}>Register</Text>
							<Ionicons name="arrow-forward" size={24} color={Colors.WHITE} />
						</>
					)}
				</TouchableOpacity>

				<Text style={styles.or}>Or</Text>

				<TouchableOpacity
					style={[styles.googleBtn, isLoading && styles.btnDisabled]}
					onPress={googleLogin}
					disabled={isLoading}
				>
					<Text style={styles.googleText}>Continue with Google</Text>
				</TouchableOpacity>

				<View style={styles.loginContainer}>
					<Text style={styles.loginText}>Already have an account? </Text>
					<TouchableOpacity
						onPress={() => navigation.navigate("Login")}
						disabled={isLoading}
					>
						<Text style={styles.loginLink}>Login here</Text>
					</TouchableOpacity>
				</View>

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
	passwordContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderColor: Colors.INPUT_BORDER,
		borderRadius: 12,
		backgroundColor: Colors.INPUT_BG,
		paddingHorizontal: 16,
	},
	passwordInput: {
		flex: 1,
		paddingVertical: 16,
		fontSize: 16,
		color: Colors.TEXT_DARK,
	},
	eyeIcon: {
		marginLeft: 10,
	},
	helperText: {
		fontSize: 14,
		color: Colors.TEXT_GREY,
		marginTop: 8,
	},
	registerBtn: {
		backgroundColor: Colors.PRIMARY_PURPLE,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 18,
		borderRadius: 30,
		marginTop: 30,
		gap: 10,
	},
	registerText: {
		color: Colors.WHITE,
		fontSize: 18,
		fontWeight: "600",
	},
	or: {
		textAlign: "center",
		marginVertical: 20,
		color: Colors.TEXT_LIGHT_GREY,
		fontSize: 16,
	},
	googleBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: Colors.GOOGLE_BORDER,
		paddingVertical: 14,
		borderRadius: 30,
		gap: 12,
		backgroundColor: Colors.WHITE,
	},
	googleText: {
		fontSize: 16,
		color: Colors.GOOGLE_TEXT,
	},
	loginContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginTop: 30,
	},
	loginText: {
		color: Colors.TEXT_GREY,
	},
	loginLink: {
		color: Colors.DARK_PURPLE,
		fontWeight: "bold",
	},
	btnDisabled: {
		opacity: 0.6,
	},
});

export default RegisterScreen;
