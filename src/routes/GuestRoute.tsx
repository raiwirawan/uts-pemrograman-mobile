import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/hooks/useAuth";
import Navigate from "../components/Navigate";

export type GuestRouteProps = {
	children: React.ReactNode;
};

export default function GuestRoute({ children }: GuestRouteProps) {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<View style={styles.container}>
				<ActivityIndicator size="large" color="#6A1B9A" />
				<Text style={styles.text}>Loading...</Text>
			</View>
		);
	}

	if (user) {
		return <Navigate to="Home" replace />;
	}

	return <>{children}</>;
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#fff",
	},
	text: { marginTop: 20, fontSize: 18, color: "#6A1B9A" },
});
