import { db } from "@/config/firebase";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute } from "@react-navigation/native";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import colors from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { deleteTodo, Subtask, updateTodo } from "@/lib/todos";

export default function EditTodoScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const headerHeight = useHeaderHeight();

  const todoParam = route.params?.todo;

  // === STATE DATA ===
  const [title, setTitle] = useState(todoParam?.title ?? "");
  const [description, setDescription] = useState(todoParam?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Subtasks State
  const [subtasks, setSubtasks] = useState<Subtask[]>(
    todoParam?.subtasks ?? []
  );
  const [newSubtask, setNewSubtask] = useState("");

  // === DATE STATE & LOGIC PERBAIKAN ===
  const [dueDate, setDueDate] = useState<Date | null>(() => {
    if (!todoParam?.dueDate) return null;

    // Jika data berupa Angka (Milliseconds) - Hasil perbaikan serialisasi
    if (typeof todoParam.dueDate === "number") {
      return new Date(todoParam.dueDate);
    }

    // Jika data berupa Timestamp (Firestore Object) - Fallback
    if (todoParam.dueDate.seconds) {
      return new Date(todoParam.dueDate.seconds * 1000);
    }

    return null;
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [isEditing, setIsEditing] = useState(!todoParam);

  // === HEADER ===
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: isEditing
        ? todoParam
          ? "Edit Detail"
          : "Tugas Baru"
        : "Detail Tugas",
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            if (isEditing) Keyboard.dismiss();
            setIsEditing((prev) => !prev);
          }}
          style={{ marginRight: 15 }}
          disabled={saving}
        >
          <Ionicons
            name={isEditing ? "eye-outline" : "create-outline"}
            size={24}
            color={colors.PRIMARY_PURPLE}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, isEditing, saving, todoParam]);

  // Back Handler
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e: any) => {
      if (!hasChanges || saving) return;
      e.preventDefault();
      Alert.alert("Buang perubahan?", "Keluar tanpa simpan?", [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya",
          style: "destructive",
          onPress: () => navigation.dispatch(e.data.action),
        },
      ]);
    });
    return unsubscribe;
  }, [navigation, hasChanges, saving]);

  // === SUBTASK FUNCTIONS ===
  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    const item: Subtask = {
      id: Date.now().toString(),
      title: newSubtask.trim(),
      completed: false,
    };
    setSubtasks([...subtasks, item]);
    setNewSubtask("");
    setHasChanges(true);
  };

  const toggleSubtask = (id: string) => {
    const updated = subtasks.map((s) =>
      s.id === id ? { ...s, completed: !s.completed } : s
    );
    setSubtasks(updated);
    setHasChanges(true);
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
    setHasChanges(true);
  };

  // === DATE FUNCTIONS ===
  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
      setHasChanges(true);
    }
  };

  // === SAVE LOGIC ===
  const handleSave = async () => {
    if (!title.trim())
      return Alert.alert("Kosong", "Judul tugas tidak boleh kosong");
    if (!user?.uid) return;

    setSaving(true);
    Keyboard.dismiss();

    try {
      if (todoParam?.id) {
        // Update
        await updateTodo(user.uid, todoParam.id, {
          title: title.trim(),
          description: description.trim(),
          dueDate: dueDate, // Kirim Date object, Firestore SDK akan handle konversinya
          subtasks: subtasks,
        });
      } else {
        // Create New
        const todosRef = collection(db, "users", user.uid, "todos");
        const newTodoData = {
          userId: user.uid,
          title: title.trim(),
          description: description.trim(),
          checked: false,
          isFavorite: false,
          dueDate: dueDate,
          subtasks: subtasks,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        const docRef = await addDoc(todosRef, newTodoData);

        // Update params dengan ID baru (dan konversi date ke angka agar aman di nav state)
        navigation.setParams({
          todo: {
            id: docRef.id,
            ...newTodoData,
            dueDate: dueDate ? dueDate.getTime() : null, // Konversi ke number
            createdAt: Date.now(), // Konversi ke number
            updatedAt: Date.now(), // Konversi ke number
          },
        });
      }

      setHasChanges(false);
      setIsEditing(false);
      Alert.alert("Sukses", "Tugas disimpan.");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!todoParam?.id) return navigation.goBack();
    Alert.alert("Hapus", "Hapus tugas ini?", [
      { text: "Batal" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          if (user?.uid) await deleteTodo(user.uid, todoParam.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  useEffect(() => {
    const kShow = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true)
    );
    const kHide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false)
    );
    return () => {
      kShow.remove();
      kHide.remove();
    };
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: isKeyboardVisible ? 400 : 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isEditing ? (
          <>
            {/* --- 1. TITLE --- */}
            <Text style={styles.label}>Judul</Text>
            <TextInput
              style={styles.inputTitle}
              placeholder="Apa yang ingin dikerjakan?"
              value={title}
              onChangeText={(t) => {
                setTitle(t);
                setHasChanges(true);
              }}
              autoFocus={!todoParam}
              placeholderTextColor={colors.TEXT_LIGHT_GREY}
            />

            {/* --- 2. DUE DATE --- */}
            <Text style={styles.label}>Tenggat Waktu</Text>
            <TouchableOpacity
              style={styles.datePickerBtn}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.PRIMARY_PURPLE}
              />
              <Text style={styles.dateText}>
                {dueDate ? formatDate(dueDate) : "Atur Tanggal"}
              </Text>
              {dueDate && (
                <TouchableOpacity
                  onPress={() => {
                    setDueDate(null);
                    setHasChanges(true);
                  }}
                  style={{ marginLeft: "auto" }}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={colors.TEXT_LIGHT_GREY}
                  />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dueDate || new Date()}
                mode="date"
                display="default"
                onChange={onChangeDate}
              />
            )}

            {/* --- 3. SUBTASKS --- */}
            <Text style={styles.label}>
              Sub-tasks ({subtasks.filter((s) => s.completed).length}/
              {subtasks.length})
            </Text>

            {subtasks.map((item) => (
              <View key={item.id} style={styles.subtaskItem}>
                <TouchableOpacity onPress={() => toggleSubtask(item.id)}>
                  <Ionicons
                    name={item.completed ? "checkbox" : "square-outline"}
                    size={22}
                    color={
                      item.completed
                        ? colors.PRIMARY_PURPLE
                        : colors.TEXT_LIGHT_GREY
                    }
                  />
                </TouchableOpacity>
                <Text
                  style={[
                    styles.subtaskText,
                    item.completed && styles.completedText,
                  ]}
                >
                  {item.title}
                </Text>
                <TouchableOpacity onPress={() => removeSubtask(item.id)}>
                  <Ionicons
                    name="close"
                    size={18}
                    color={colors.TEXT_LIGHT_GREY}
                  />
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.addSubtaskContainer}>
              <Ionicons name="add" size={22} color={colors.TEXT_GREY} />
              <TextInput
                style={styles.inputSubtask}
                placeholder="Tambah langkah baru..."
                value={newSubtask}
                onChangeText={setNewSubtask}
                onSubmitEditing={addSubtask}
                placeholderTextColor={colors.TEXT_LIGHT_GREY}
              />
              {newSubtask.length > 0 && (
                <TouchableOpacity onPress={addSubtask}>
                  <Text
                    style={{ color: colors.PRIMARY_PURPLE, fontWeight: "bold" }}
                  >
                    Add
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* --- 4. DESCRIPTION --- */}
            <Text style={styles.label}>Catatan Tambahan</Text>
            <TextInput
              style={styles.inputDesc}
              placeholder="Deskripsi detail..."
              value={description}
              onChangeText={(t) => {
                setDescription(t);
                setHasChanges(true);
              }}
              multiline
              textAlignVertical="top"
              placeholderTextColor={colors.TEXT_LIGHT_GREY}
            />
          </>
        ) : (
          // === VIEW MODE ===
          <>
            {/* Title Only (Tanpa Bullet/Checkbox) */}
            <Text
              style={[
                styles.viewTitle,
                todoParam?.checked && styles.completedText,
              ]}
            >
              {title}
            </Text>

            {/* Date Info */}
            {dueDate && (
              <View style={styles.viewMetaRow}>
                <Ionicons name="calendar" size={18} color="#D1453B" />
                <Text style={styles.viewMetaText}>{formatDate(dueDate)}</Text>
              </View>
            )}

            <View
              style={{
                height: 1,
                backgroundColor: colors.DIVIDER,
                marginVertical: 15,
              }}
            />

            {/* Subtasks View */}
            {subtasks.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <Text style={styles.viewSectionTitle}>Sub-tasks</Text>
                {subtasks.map((item) => (
                  <View key={item.id} style={styles.subtaskItemView}>
                    <Ionicons
                      name={
                        item.completed
                          ? "checkmark-circle-outline"
                          : "radio-button-off"
                      }
                      size={18}
                      color={
                        item.completed ? colors.TEXT_GREY : colors.TEXT_DARK
                      }
                    />
                    <Text
                      style={[
                        styles.subtaskTextView,
                        item.completed && styles.completedText,
                      ]}
                    >
                      {item.title}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Description View */}
            {description ? (
              <>
                <Text style={styles.viewSectionTitle}>Catatan</Text>
                <Text style={styles.viewContent}>{description}</Text>
              </>
            ) : null}
          </>
        )}
      </ScrollView>

      {/* FOOTER BUTTONS (Edit Mode) */}
      {isEditing && (
        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={handleDelete}
              disabled={saving}
            >
              <Ionicons name="trash" size={20} color={colors.DANGER} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#FFF" />
                  <Text style={styles.saveText}>Simpan</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.WHITE },
  content: { padding: 20 },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.TEXT_GREY,
    marginBottom: 8,
    marginTop: 20,
  },

  // EDIT STYLES
  inputTitle: {
    fontSize: 22,
    fontWeight: "bold",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.DIVIDER,
    color: colors.TEXT_DARK,
  },

  datePickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: colors.CARD_BG,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.DIVIDER,
  },
  dateText: { marginLeft: 10, fontSize: 16, color: colors.TEXT_DARK },

  // Subtasks
  subtaskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  subtaskText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: colors.TEXT_DARK,
  },
  completedText: {
    textDecorationLine: "line-through",
    color: colors.TEXT_LIGHT_GREY,
  },

  addSubtaskContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingVertical: 5,
  },
  inputSubtask: { flex: 1, marginLeft: 10, fontSize: 16 },

  inputDesc: {
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.DIVIDER,
    borderRadius: 12,
    minHeight: 120,
    backgroundColor: colors.CARD_BG,
    lineHeight: 24,
    textAlignVertical: "top",
  },

  // VIEW STYLES
  viewTitle: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: colors.TEXT_DARK,
    marginBottom: 5,
  }, // Hapus flex:1 karena tidak dalam row
  viewMetaRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  viewMetaText: {
    marginLeft: 8,
    color: "#D1453B",
    fontSize: 14,
    fontWeight: "600",
  },

  viewSectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.TEXT_GREY,
    marginBottom: 8,
  },
  viewContent: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: colors.TEXT_DARK,
    lineHeight: 24,
  },

  subtaskItemView: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  subtaskTextView: { marginLeft: 10, fontSize: 16, color: colors.TEXT_DARK },

  // FOOTER
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.WHITE,
    borderTopWidth: 1,
    borderTopColor: colors.DIVIDER,
  },
  buttonRow: { flexDirection: "row", gap: 10 },
  iconBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.CARD_BG,
    borderWidth: 1,
    borderColor: colors.DIVIDER,
  },
  saveBtn: {
    flex: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.FAB_BG,
    gap: 10,
  },
  saveText: { color: colors.WHITE, fontSize: 16, fontWeight: "600" },
});
