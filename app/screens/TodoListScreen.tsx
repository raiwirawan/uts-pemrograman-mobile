import React from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import FloatingActionButton from "@/components/to-do/to-doButten";

const TodoListScreen = () => {
	const handleAddTodo = () => {
    // Ganti Alert dengan navigasi atau modal untuk menambah To-Do
    Alert.alert("Tombol FAB Ditekan", "Siap untuk menambahkan To-Do baru!");
  };
	return (
		<View style={styles.container}>
			<Text style={styles.text}>Halaman To-do List ✅</Text>
			<FloatingActionButton onPress={handleAddTodo} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: "center", alignItems: "center" },
	text: { fontSize: 20 },
});

export default TodoListScreen;
