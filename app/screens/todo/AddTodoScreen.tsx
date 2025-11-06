// screens/todo/AddTodoScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Alert,
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type TodoItem = {
  id: number;
  text: string;
  completed: boolean;
};

type TodoList = {
  id: number;
  title: string;
  items: TodoItem[];
  date: string | null;
  color: string;
};

const COLORS = ["#FFF9C4", "#C8E6C9", "#BBDEFB", "#F8BBD0", "#FFE0B2", "#E1BEE7"];

export default function AddTodoScreen({ navigation, route }: any) {
  const editing: TodoList | undefined = route.params?.listToEdit;
  const [title, setTitle] = useState(editing ? editing.title : "");
  const [items, setItems] = useState<TodoItem[]>(editing ? editing.items : []);
  const [inputItem, setInputItem] = useState("");
  const [date, setDate] = useState<Date | null>(
    editing && editing.date ? new Date(editing.date) : null
  );
  const [showPicker, setShowPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>(
    editing ? editing.color : COLORS[0]
  );

  const addItemToList = () => {
    if (inputItem.trim() === "") return;
    const newItem: TodoItem = {
      id: Date.now(),
      text: inputItem.trim(),
      completed: false,
    };
    setItems((prev) => [...prev, newItem]);
    setInputItem("");
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const saveList = () => {
    if (title.trim() === "") {
      Alert.alert("Judul kosong", "Masukkan judul daftar terlebih dahulu!");
      return;
    }
    if (items.length === 0) {
      Alert.alert("Item kosong", "Tambahkan minimal satu item!");
      return;
    }

    const list: TodoList = {
      id: editing ? editing.id : Date.now(),
      title: title.trim(),
      items,
      date: date ? date.toISOString() : null,
      color: selectedColor,
    };

    navigation.navigate("TodoList", {
      [editing ? "updatedList" : "newList"]: list,
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.titleInput}
        placeholder="Judul daftar (mis. Target November)"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Tema warna</Text>
      <View style={styles.colorRow}>
        {COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorCircle,
              { backgroundColor: color },
              selectedColor === color && styles.colorSelected,
            ]}
            onPress={() => setSelectedColor(color)}
          />
        ))}
      </View>

      <View style={styles.addRow}>
        <TextInput
          style={styles.itemInput}
          placeholder="Tambahkan item (mis. Beli sepatu)"
          value={inputItem}
          onChangeText={setInputItem}
          onSubmitEditing={addItemToList}
        />
        <TouchableOpacity style={styles.addBtn} onPress={addItemToList}>
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(it) => it.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.listRow}>
            <Text style={styles.listText}>{item.text}</Text>
            <TouchableOpacity onPress={() => removeItem(item.id)}>
              <Ionicons name="trash-outline" size={20} color="#f44336" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: "#777", marginTop: 8 }}>Belum ada item</Text>
        }
      />

      <TouchableOpacity
        style={styles.dateBtn}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.dateBtnText}>
          Pilih tanggal: {date ? date.toLocaleDateString() : "Belum"}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display="default"
          onChange={(e, d) => {
            setShowPicker(false);
            if (d) setDate(d);
          }}
        />
      )}

      <View style={{ marginTop: 16 }}>
        <Button
          title={editing ? "Simpan Perubahan" : "Simpan Daftar"}
          onPress={saveList}
          color="#007AFF"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#FAFAFA" },
  titleInput: {
    fontSize: 18,
    fontWeight: "600",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 8,
    marginBottom: 10,
  },
  label: { fontWeight: "600", color: "#333", marginTop: 10, marginBottom: 6 },
  colorRow: { flexDirection: "row", marginBottom: 10 },
  colorCircle: {
    width: 35,
    height: 35,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: "#007AFF",
  },
  addRow: { flexDirection: "row", marginTop: 8 },
  itemInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
  },
  addBtn: {
    backgroundColor: "#007AFF",
    padding: 10,
    marginLeft: 8,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  listRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    borderRadius: 8,
    marginVertical: 6,
  },
  listText: { fontSize: 15 },
  dateBtn: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  dateBtnText: { color: "#333" },
});
