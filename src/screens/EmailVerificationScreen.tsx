import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
	Alert,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	ActivityIndicator,
} from "react-native";

import Colors from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { EmailVerificationScreenProps } from "@/types/navigation";

function EmailVerificationScreen({
	navigation,
	route,
}: EmailVerificationScreenProps) {
	const [isChecking, setIsChecking] = useState(false);
	const [isResending, setIsResending] = useState(false);
	const { checkEmailVerification, resendVerificationEmail, logout } = useAuth();
	const email = route.params?.email || "";

	const handleCheckVerification = async () => {
		setIsChecking(true);
		try {
			const isVerified = await checkEmailVerification();
			if (isVerified) {
				Alert.alert(
					"Berhasil!",
					"Email Anda sudah terverifikasi. Silakan login.",
					[
						{
							text: "OK",
							onPress: () => {
								logout();
								navigation.replace("Login");
							},
						},
					]
				);
			} else {
				Alert.alert(
					"Belum Terverifikasi",
					"Email Anda belum terverifikasi. Silakan cek inbox atau spam folder Anda dan klik link verifikasi."
				);
			}
		} catch (err: any) {
			Alert.alert("Error", err.message);
		} finally {
			setIsChecking(false);
		}
	};

	const handleResendEmail = async () => {
		setIsResending(true);
		try {
			await resendVerificationEmail();
			Alert.alert(
				"Email Terkirim",
				"Link verifikasi telah dikirim ulang ke email Anda. Silakan cek inbox atau spam folder."
			);
		} catch (err: any) {
			Alert.alert("Gagal", err.message);
		} finally {
			setIsResending(false);
		}
	};

	const handleBackToLogin = () => {
		Alert.alert(
			"Kembali ke Login",
			"Anda harus memverifikasi email sebelum dapat login. Yakin ingin kembali?",
			[
				{ text: "Batal", style: "cancel" },
				{
					text: "Ya",
					onPress: async () => {
						await logout();
						navigation.replace("Login");
					},
				},
			]
		);
	};

	return (
		<View style={styles.container}>
			<View style={styles.content}>
				{/* Icon */}
				<View style={styles.iconContainer}>
					<Ionicons
						name="mail-outline"
						size={100}
						color={Colors.PRIMARY_PURPLE}
					/>
				</View>

				{/* Title */}
				<Text style={styles.title}>Verifikasi Email Anda</Text>

				{/* Subtitle */}
				<Text style={styles.subtitle}>
					Kami telah mengirimkan link verifikasi ke
				</Text>
				<Text style={styles.email}>{email}</Text>

				{/* Instructions */}
				<View style={styles.instructionsContainer}>
					<Text style={styles.instructionText}>
						1. Cek inbox atau spam folder email Anda
					</Text>
					<Text style={styles.instructionText}>
						2. Klik link verifikasi yang kami kirim
					</Text>
					<Text style={styles.instructionText}>
						3. Kembali ke aplikasi dan tekan tombol {"Saya Sudah Verifikasi"}
					</Text>
				</View>

				{/* Check Verification Button */}
				<TouchableOpacity
					style={[styles.verifyBtn, isChecking && styles.btnDisabled]}
					onPress={handleCheckVerification}
					disabled={isChecking}
				>
					{isChecking ? (
						<ActivityIndicator color={Colors.WHITE} />
					) : (
						<>
							<Text style={styles.verifyText}>Saya Sudah Verifikasi</Text>
							<Ionicons
								name="checkmark-circle"
								size={24}
								color={Colors.WHITE}
							/>
						</>
					)}
				</TouchableOpacity>

				{/* Resend Email */}
				<TouchableOpacity
					style={[styles.resendBtn, isResending && styles.btnDisabled]}
					onPress={handleResendEmail}
					disabled={isResending}
				>
					{isResending ? (
						<ActivityIndicator color={Colors.PRIMARY_PURPLE} />
					) : (
						<>
							<Ionicons
								name="refresh"
								size={20}
								color={Colors.PRIMARY_PURPLE}
							/>
							<Text style={styles.resendText}>Kirim Ulang Email</Text>
						</>
					)}
				</TouchableOpacity>

				{/* Back to Login */}
				<TouchableOpacity style={styles.backBtn} onPress={handleBackToLogin}>
					<Ionicons name="arrow-back" size={20} color={Colors.TEXT_GREY} />
					<Text style={styles.backText}>Kembali ke Login</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.BACKGROUND,
	},
	content: {
		flex: 1,
		padding: 30,
		justifyContent: "center",
		alignItems: "center",
	},
	iconContainer: {
		marginBottom: 30,
	},
	title: {
		fontSize: 28,
		fontWeight: "bold",
		color: Colors.DARK_PURPLE,
		marginBottom: 16,
		textAlign: "center",
	},
	subtitle: {
		fontSize: 16,
		color: Colors.TEXT_GREY,
		textAlign: "center",
		marginBottom: 8,
	},
	email: {
		fontSize: 16,
		fontWeight: "600",
		color: Colors.PRIMARY_PURPLE,
		marginBottom: 40,
		textAlign: "center",
	},
	instructionsContainer: {
		backgroundColor: Colors.WHITE,
		padding: 20,
		borderRadius: 12,
		marginBottom: 40,
		width: "100%",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 3,
	},
	instructionText: {
		fontSize: 14,
		color: Colors.TEXT_DARK,
		marginBottom: 12,
		lineHeight: 20,
	},
	verifyBtn: {
		backgroundColor: Colors.PRIMARY_PURPLE,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 18,
		borderRadius: 30,
		width: "100%",
		gap: 10,
		marginBottom: 16,
	},
	verifyText: {
		color: Colors.WHITE,
		fontSize: 18,
		fontWeight: "600",
	},
	resendBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 14,
		borderWidth: 2,
		borderColor: Colors.PRIMARY_PURPLE,
		borderRadius: 30,
		width: "100%",
		gap: 8,
		marginBottom: 16,
	},
	resendText: {
		color: Colors.PRIMARY_PURPLE,
		fontSize: 16,
		fontWeight: "600",
	},
	backBtn: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		paddingVertical: 12,
	},
	backText: {
		color: Colors.TEXT_GREY,
		fontSize: 16,
	},
	btnDisabled: {
		opacity: 0.6,
	},
});

export default EmailVerificationScreen;
