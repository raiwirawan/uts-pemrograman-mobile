import NotesButton from "@/components/notes/NotesButton";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

function NotesScreen(){
	return (
		<View style={styles.container}>
			<Text style={styles.text}>Halaman Catatan 📝</Text>
			<NotesButton buttonText="Tambah Catatan Baru" />
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: "center", alignItems: "center" },
	text: { fontSize: 20 },
});

export default NotesScreen;
