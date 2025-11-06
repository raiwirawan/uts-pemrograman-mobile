import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import React from "react";
import {
	Dimensions,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

const { width, height } = Dimensions.get("window");

type OnboardingScreenProps = {
	navigation: StackNavigationProp<any>;
};

export default function OnboardingScreen({
	navigation,
}: OnboardingScreenProps) {
	return (
		<View style={styles.container}>
			{/* Ilustrasi */}
			{/* <SvgUri
				width={width * 0.9}
				height={height * 0.5}
				source={require("../../assets/images/onboarding-illustration.png")}
			/> */}

			<Image
				style={{
					width: width * 0.9,
					height: height * 0.5,
					resizeMode: "contain",
				}}
				source={require("../../assets/images/onboarding-illustration.png")}
			/>

			{/* Judul */}
			<Text style={styles.title}>NoteNote</Text>

			{/* Pager dots */}
			<View style={styles.dots}>
				<View style={[styles.dot, styles.dotActive]} />
				<View style={styles.dot} />
				<View style={styles.dot} />
			</View>

			{/* Tombol */}
			<TouchableOpacity
				style={styles.button}
				onPress={() => navigation.replace("Login")} // ganti 'Home' ke screen utama kamu
			>
				<Text style={styles.buttonText}>{"Let's Get Started"}</Text>
				<Text style={styles.arrow}>
					<Ionicons name="arrow-forward" size={24} color="#6A1B9A" />
				</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#6A1B9A", // purple gelap
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 60,
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		color: "white",
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
		backgroundColor: "#C19BEF",
	},
	dotActive: {
		backgroundColor: "#FFD54F", // kuning
	},
	button: {
		backgroundColor: "white",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 18,
		paddingHorizontal: 40,
		borderRadius: 30,
		gap: 15,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 6,
		elevation: 10,
	},
	buttonText: {
		fontSize: 18,
		fontWeight: "600",
		color: "#6A1B9A",
	},
	arrow: {
		fontSize: 24,
		color: "#6A1B9A",
	},
});
