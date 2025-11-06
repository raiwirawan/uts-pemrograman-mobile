// screens/todo/TodoListScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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

export default function TodoListScreen({ navigation, route }: any) {
  const [lists, setLists] = useState<TodoList[]>([]);

  // terima data dari AddTodo
  useEffect(() => {
    if (route.params?.newList) {
      setLists((prev) => [route.params.newList, ...prev]);
      navigation.setParams({ newList: undefined });
    }
    if (route.params?.updatedList) {
      setLists((prev) =>
        prev.map((l) =>
          l.id === route.params.updatedList.id ? route.params.updatedList : l
        )
      );
      navigation.setParams({ updatedList: undefined });
    }
  }, [route.params]);

  const toggleItem = (listId: number, itemId: number) => {
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              items: l.items.map((it) =>
                it.id === itemId ? { ...it, completed: !it.completed } : it
              ),
            }
          : l
      )
    );
  };

  const handleDeleteList = (listId: number) => {
    Alert.alert("Hapus daftar", "Yakin ingin menghapus daftar ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: () => setLists((prev) => prev.filter((l) => l.id !== listId)),
      },
    ]);
  };

  const openEdit = (list: TodoList) => {
    navigation.navigate("AddTodo", { listToEdit: list });
  };

  const renderListCard = ({ item: list }: { item: TodoList }) => {
    const previewItems = list.items.slice(0, 4);
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: list.color || "#fff" }]}
        onPress={() => openEdit(list)}
        activeOpacity={0.9}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{list.title}</Text>
          <TouchableOpacity onPress={() => handleDeleteList(list.id)}>
            <Ionicons name="trash-outline" size={20} color="#444" />
          </TouchableOpacity>
        </View>

        <View style={styles.cardBody}>
          {previewItems.map((it) => (
            <TouchableOpacity
              key={it.id}
              style={styles.itemRow}
              onPress={() => toggleItem(list.id, it.id)}
            >
              <Ionicons
                name={it.completed ? "checkbox" : "square-outline"}
                size={20}
                color={it.completed ? "#007AFF" : "#333"}
              />
              <Text
                style={[styles.itemText, it.completed && styles.completedText]}
              >
                {it.text}
              </Text>
            </TouchableOpacity>
          ))}

          {list.items.length > previewItems.length && (
            <Text style={styles.moreText}>
              +{list.items.length - previewItems.length} lagi
            </Text>
          )}
        </View>

        {list.date && (
          <Text style={styles.dateText}>
            🗓 {new Date(list.date).toLocaleDateString()}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={lists}
        keyExtractor={(l) => l.id.toString()}
        renderItem={renderListCard}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Belum ada to-do list. Tekan + untuk membuat.
          </Text>
        }
        contentContainerStyle={
          lists.length === 0 ? { flex: 1, justifyContent: "center" } : undefined
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddTodo")}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5", padding: 10 },
  emptyText: { textAlign: "center", color: "#777" },
  card: {
    flex: 0.48,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#111" },
  cardBody: { marginTop: 4 },
  itemRow: { flexDirection: "row", alignItems: "center", marginVertical: 3 },
  itemText: { marginLeft: 8, fontSize: 14, color: "#222" },
  completedText: { textDecorationLine: "line-through", color: "#999" },
  moreText: { color: "#555", fontSize: 12, marginTop: 4 },
  dateText: { marginTop: 8, color: "#333", fontSize: 12 },
  fab: {
    backgroundColor: "#007AFF",
    width: 60,
    height: 60,
    borderRadius: 30,
    position: "absolute",
    bottom: 25,
    right: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
});
