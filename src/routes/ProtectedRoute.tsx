import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import Navigate from "../components/Navigate";
import { useAuth } from "../hooks/useAuth";

export type ProtectedRouteProps = {
	children: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<View style={styles.container}>
				<ActivityIndicator size="large" color="#6A1B9A" />
				<Text style={styles.text}>Loading...</Text>
			</View>
		);
	}

	if (!user) {
		return <Navigate to="Onboarding" replace />;
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
