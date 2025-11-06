import React from "react";
import { StyleSheet, Text, View } from "react-native";

function TodoListScreen(){
	return (
		<View style={styles.container}>
			<Text style={styles.text}>Halaman To-do List ✅</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: "center", alignItems: "center" },
	text: { fontSize: 20 },
});

export default TodoListScreen;
