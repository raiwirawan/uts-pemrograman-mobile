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
	ActivityIndicator,
} from "react-native";

import Colors from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { LoginScreenProps } from "@/types/navigation";

function LoginScreen({ navigation }: LoginScreenProps) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isPasswordVisible, setIsPasswordVisible] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const { login, googleLogin } = useAuth();

	const handleLogin = async () => {
		if (!email || !password) {
			Alert.alert("Error", "Email dan password harus diisi");
			return;
		}

		setIsLoading(true);
		try {
			await login(email.trim(), password);
		} catch (err: any) {
			// Check if error is about unverified email
			if (err.message.includes("belum diverifikasi")) {
				Alert.alert("Email Belum Diverifikasi", err.message, [
					{ text: "Batal", style: "cancel" },
					{
						text: "Verifikasi Sekarang",
						onPress: () => {
							// @ts-ignore
							navigation.navigate("EmailVerification", { email: email.trim() });
						},
					},
				]);
			} else {
				Alert.alert("Login Gagal", err.message);
			}
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
				<Text style={styles.title}>{"Let's Login"}</Text>
				<Text style={styles.subtitle}>And notes your idea</Text>

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

				<TouchableOpacity
					onPress={() => navigation.navigate("ForgotPassword")}
					disabled={isLoading}
				>
					<Text style={styles.forgot}>Forgot Password?</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={[styles.loginBtn, isLoading && styles.btnDisabled]}
					onPress={handleLogin}
					disabled={isLoading}
				>
					{isLoading ? (
						<ActivityIndicator color={Colors.WHITE} />
					) : (
						<>
							<Text style={styles.loginText}>Login</Text>
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
					<Text style={styles.googleText}>Login with Google</Text>
				</TouchableOpacity>

				<View style={styles.registerContainer}>
					<Text style={styles.registerText}>{"Don't have any account? "}</Text>
					<TouchableOpacity
						onPress={() => navigation.navigate("Register")}
						disabled={isLoading}
					>
						<Text style={styles.registerLink}>Register here</Text>
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
	forgot: {
		color: Colors.DARK_PURPLE,
		textAlign: "right",
		marginTop: 8,
		fontWeight: "600",
	},
	loginBtn: {
		backgroundColor: Colors.PRIMARY_PURPLE,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 18,
		borderRadius: 30,
		marginTop: 30,
		gap: 10,
	},
	loginText: {
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
	},
	googleText: {
		fontSize: 16,
		color: Colors.GOOGLE_TEXT,
	},
	registerContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginTop: 30,
	},
	registerText: {
		color: Colors.TEXT_GREY,
	},
	registerLink: {
		color: Colors.DARK_PURPLE,
		fontWeight: "bold",
	},
	btnDisabled: {
		opacity: 0.6,
	},
});

export default LoginScreen;
