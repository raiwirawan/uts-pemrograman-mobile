import React from "react";
import { StyleSheet, Text, View } from "react-native";

const NotesScreen = () => {
	return (
		<View style={styles.container}>
			<Text style={styles.text}>Halaman Catatan 📝</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: "center", alignItems: "center" },
	text: { fontSize: 20 },
});

export default NotesScreen;
