import React, { useState, useLayoutEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TodoItem {
  text: string;
  checked: boolean;
}

interface TodoType {
  id: number;
  title: string;
  items: TodoItem[];
  color: string;
  date: string;
}

export default function TodoListScreen({ route, navigation }: any) {
  const [todos, setTodos] = useState<TodoType[]>([]);

  // menerima data dari AddTodoScreen
  useLayoutEffect(() => {
    if (route.params?.newTodo) {
      setTodos((prev) => [...prev, route.params.newTodo]);
    }
  }, [route.params?.newTodo]);

  return (
    <View style={styles.container}>
      {/* tombol tambah */}
      <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate("AddTodo")}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* list todo */}
      <FlatList
        data={todos}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: item.color }]}>
            <Text style={styles.title}>{item.title}</Text>
            {item.items.map((task, index) => (
              <View key={index} style={styles.row}>
                <Ionicons
                  name={task.checked ? "checkbox" : "square-outline"}
                  size={18}
                  color="#000"
                />
                <Text style={styles.taskText}>{task.text}</Text>
              </View>
            ))}
            <Text style={styles.date}>{item.date}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f4f4", padding: 16 },
  addBtn: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: "#007AFF",
    width: 60,
    height: 60,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99,
  },
  card: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "center", marginTop: 3 },
  taskText: { marginLeft: 8, fontSize: 14 },
  date: { marginTop: 8, opacity: 0.7, fontSize: 12 },
});
