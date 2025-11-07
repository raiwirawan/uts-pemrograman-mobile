import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const COLORS = ["#FFEB3B", "#FFCDD2", "#C8E6C9", "#BBDEFB", "#D1C4E9"];

export default function AddTodoScreen({ navigation }: any) {
  const [title, setTitle] = useState("");
  const [checklist, setChecklist] = useState([{ text: "", checked: false }]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleAddChecklist = () => {
    setChecklist([...checklist, { text: "", checked: false }]);
  };

  const saveTodo = () => {
    if (!title.trim()) return;

    navigation.navigate("TodoList", {
      newTodo: {
        id: Date.now(),
        title,
        items: checklist,
        color: selectedColor,
        date: new Date().toLocaleDateString(),
      },
    });
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Judul" style={styles.titleInput} value={title} onChangeText={setTitle} />

      <FlatList
        data={checklist}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.itemRow}>
            <Ionicons name="square-outline" size={20} color="black" />
            <TextInput
              placeholder="Tulis tugas..."
              style={styles.taskInput}
              value={item.text}
              onChangeText={(text) => {
                const updated = [...checklist];
                updated[index].text = text;
                setChecklist(updated);
              }}
            />
          </View>
        )}
      />

      <TouchableOpacity onPress={handleAddChecklist}>
        <Text style={styles.addText}>+ Tambah daftar</Text>
      </TouchableOpacity>

      <View style={styles.colorPicker}>
        {COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            onPress={() => setSelectedColor(color)}
            style={[styles.colorDot, { backgroundColor: color }]}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={saveTodo}>
        <Text style={styles.saveText}>Simpan</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  titleInput: { fontSize: 20, borderBottomWidth: 1, paddingVertical: 10 },
  itemRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  taskInput: { marginLeft: 8, borderBottomWidth: 1, flex: 1, paddingVertical: 4 },
  addText: { marginTop: 20, color: "#007AFF", fontSize: 16 },
  saveBtn: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  saveText: { textAlign: "center", color: "#fff", fontSize: 16, fontWeight: "bold" },
  colorPicker: { flexDirection: "row", marginTop: 20 },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
  },
});
