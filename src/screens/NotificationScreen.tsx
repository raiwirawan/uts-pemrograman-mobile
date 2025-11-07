import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
	KeyboardAvoidingView,
	Modal,
	Platform,
	Pressable,
	StyleSheet,
	Switch,
	Text,
	View,
} from "react-native";

import Colors from "@/constants/colors";
import { NotificationScreenProps } from "@/types/navigation";

function NotificationScreen({ navigation }: NotificationScreenProps) {
	const [emailEnabled, setEmailEnabled] = useState(true);
	const [pushEnabled, setPushEnabled] = useState(true);

	const close = () => navigation.goBack();

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={styles.container}
		>
			<Modal transparent animationType="fade" visible onRequestClose={close}>
				{/* Backdrop */}
				<Pressable style={styles.backdrop} onPress={close} />

				{/* Bottom Sheet */}
				<View style={styles.sheet}>
					{/* Close Button */}
					<Pressable style={styles.closeBtn} onPress={close}>
						<Ionicons name="close" size={20} color={Colors.TEXT_GREY} />
					</Pressable>

					{/* Title */}
					<Text style={styles.title}>Notifications</Text>
					<Text style={styles.subtitle}>
						Atur notifikasi yang ingin kamu terima
					</Text>

					{/* Email Notifications */}
					<View style={styles.row}>
						<View>
							<Text style={styles.label}>Email Notifications</Text>
							<Text style={styles.desc}>Dapatkan update via email</Text>
						</View>
						<Switch
							value={emailEnabled}
							onValueChange={setEmailEnabled}
							trackColor={{ false: Colors.INPUT_BORDER, true: "#E1D4FF" }}
							thumbColor={emailEnabled ? Colors.PRIMARY_PURPLE : Colors.WHITE}
							ios_backgroundColor={Colors.INPUT_BORDER}
						/>
					</View>

					{/* Push Notifications */}
					<View style={styles.row}>
						<View>
							<Text style={styles.label}>Push Notifications</Text>
							<Text style={styles.desc}>Notifikasi langsung di ponsel</Text>
						</View>
						<Switch
							value={pushEnabled}
							onValueChange={setPushEnabled}
							trackColor={{ false: Colors.INPUT_BORDER, true: "#E1D4FF" }}
							thumbColor={pushEnabled ? Colors.PRIMARY_PURPLE : Colors.WHITE}
							ios_backgroundColor={Colors.INPUT_BORDER}
						/>
					</View>

					{/* Extra space untuk iPhone notch */}
					<View style={{ height: 20 }} />
				</View>
			</Modal>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "transparent",
	},
	backdrop: {
		flex: 1,
		backgroundColor: Colors.OVERLAY, // rgba(0,0,0,0.4)
	},
	sheet: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: Colors.BACKGROUND,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		paddingHorizontal: 30,
		paddingTop: 20,
		paddingBottom: 40,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: -4 },
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 20,
	},
	closeBtn: {
		position: "absolute",
		right: 20,
		top: 16,
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: "#F5F5F5",
		alignItems: "center",
		justifyContent: "center",
		zIndex: 10,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: Colors.DARK_PURPLE,
		marginBottom: 8,
		textAlign: "center",
	},
	subtitle: {
		fontSize: 16,
		color: Colors.TEXT_GREY,
		marginBottom: 30,
		textAlign: "center",
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 20,
		borderBottomWidth: 1,
		borderBottomColor: Colors.DIVIDER,
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
		color: Colors.TEXT_DARK,
	},
	desc: {
		fontSize: 14,
		color: Colors.TEXT_GREY,
		marginTop: 4,
	},
});

export default NotificationScreen;
