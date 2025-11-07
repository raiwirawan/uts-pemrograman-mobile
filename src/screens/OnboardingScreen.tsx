import { Ionicons } from "@expo/vector-icons";
import {
	Dimensions,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

import Colors from "@/constants/colors";
import { OnboardingScreenProps } from "@/types/navigation";

function OnboardingScreen({ navigation }: OnboardingScreenProps) {
	const { width, height } = Dimensions.get("window");

	return (
		<View style={styles.container}>
			<Image
				style={{
					width: width * 0.9,
					height: height * 0.5,
					resizeMode: "contain",
				}}
				source={require("../../assets/images/onboarding-illustration.png")}
			/>

			<Text style={styles.title}>NoteNote</Text>

			<View style={styles.dots}>
				<View style={[styles.dot, styles.dotActive]} />
				<View style={styles.dot} />
				<View style={styles.dot} />
			</View>

			<TouchableOpacity
				style={styles.button}
				onPress={() => navigation.navigate("Login")}
			>
				<Text style={styles.buttonText}>{"Let's Get Started"}</Text>
				<Ionicons name="arrow-forward" size={24} color={Colors.BUTTON_TEXT} />
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.ONBOARDING_BG,
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 60,
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		color: Colors.TITLE_WHITE,
		marginTop: -50,
	},
	dots: {
		flexDirection: "row",
		gap: 10,
	},
	dot: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: Colors.DOT_INACTIVE,
	},
	dotActive: {
		backgroundColor: Colors.DOT_ACTIVE,
	},
	button: {
		backgroundColor: Colors.WHITE,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 18,
		paddingHorizontal: 40,
		borderRadius: 30,
		gap: 15,
		shadowColor: Colors.SHADOW,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 6,
		elevation: 10,
	},
	buttonText: {
		fontSize: 18,
		fontWeight: "600",
		color: Colors.BUTTON_TEXT,
	},
});

export default OnboardingScreen;
