import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import colors from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { deleteNote, getUserNotes, Note } from "@/lib/notes";
import { NotesScreenProps } from "@/types/navigation";

// Tipe untuk pilihan urutan
type SortOption = "newest" | "oldest" | "az" | "za";

// eslint-disable-next-line no-empty-pattern
function NotesScreen({}: NotesScreenProps) {
  const { user } = useAuth();
  const navigation = useNavigation<NotesScreenProps["navigation"]>();

  // === 1. STATE MANAGEMENT ===
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State untuk Search & Sort
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);

  // === 2. HEADER BUTTON (Tombol Filter) ===
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setShowSortMenu(true)}
          style={{ marginRight: 15 }}
        >
          <Ionicons name="filter" size={24} color={colors.PRIMARY_PURPLE} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // === 3. LOAD DATA DARI FIREBASE ===
  const loadNotes = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const data = await getUserNotes(user.uid);
      setNotes(data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch notes:", err);
      setError(err.message || "Gagal memuat catatan");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      setLoading(true);
      loadNotes();
    } else {
      setLoading(false);
    }
  }, [user?.uid, loadNotes]);

  // === 4. LOGIKA PINTAR: SEARCH + SORT (GABUNGAN) ===
  const filteredAndSortedNotes = useMemo(() => {
    let data = [...notes];

    // A. Filter Search (Jika ada ketikan di search bar)
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      data = data.filter(
        (note) =>
          note.title.toLowerCase().includes(lowerQuery) ||
          note.content.toLowerCase().includes(lowerQuery)
      );
    }

    // B. Sorting (Mengurutkan hasil filter tadi)
    switch (sortOption) {
      case "newest":
        return data.sort((a, b) => b.updatedAt.seconds - a.updatedAt.seconds);
      case "oldest":
        return data.sort((a, b) => a.updatedAt.seconds - b.updatedAt.seconds);
      case "az":
        return data.sort((a, b) => a.title.localeCompare(b.title));
      case "za":
        return data.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return data;
    }
  }, [notes, searchQuery, sortOption]); // <-- Kode akan jalan ulang otomatis jika 3 hal ini berubah

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotes();
  }, [loadNotes]);

  const handleDelete = async (id: string) => {
    if (!user?.uid) return;
    try {
      await deleteNote(user.uid, id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err: any) {
      Alert.alert("Gagal", err.message);
    }
  };

  const renderNote = ({ item }: { item: Note }) => (
    <TouchableOpacity
      style={styles.noteCard}
      onPress={() => {
        // @ts-ignore
        navigation.navigate("EditNote", { noteId: item.id, note: item });
      }}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>
        {item.content.length > 100
          ? `${item.content.substring(0, 100)}...`
          : item.content}
      </Text>
      <Text style={styles.date}>
        Updated: {new Date(item.updatedAt.seconds * 1000).toLocaleString()}
      </Text>
      <TouchableOpacity
        onPress={() =>
          Alert.alert("Hapus Catatan", "Yakin hapus catatan ini?", [
            { text: "Batal", style: "cancel" },
            {
              text: "Hapus",
              style: "destructive",
              onPress: () => handleDelete(item.id),
            },
          ])
        }
        style={styles.deleteBtn}
      >
        <Ionicons name="trash-outline" size={24} color={colors.DANGER} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color={colors.PRIMARY_PURPLE} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContent}>
        <Ionicons name="alert-circle-outline" size={80} color={colors.DANGER} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* === SEARCH BAR UI === */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={colors.TEXT_GREY}
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari judul atau isi..."
          value={searchQuery}
          onChangeText={setSearchQuery} // <-- Update state saat mengetik
          placeholderTextColor={colors.TEXT_LIGHT_GREY}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color={colors.TEXT_GREY} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredAndSortedNotes} // <-- PENTING: Pakai data hasil filter!
        renderItem={renderNote}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name={searchQuery ? "search" : "document-outline"}
              size={80}
              color={colors.DIVIDER}
            />
            <Text style={styles.emptyTitle}>
              {searchQuery ? "Tidak ditemukan" : "Belum ada catatan"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? `Tidak ada hasil untuk "${searchQuery}"`
                : "Tekan tombol + untuk membuat catatan baru"}
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate("AddNote" as never)}
      >
        <Ionicons name="add" size={30} color={colors.WHITE} />
      </TouchableOpacity>

      {/* MODAL SORT UI */}
      <Modal
        visible={showSortMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSortMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortMenu(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Urutkan Catatan</Text>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setSortOption("newest");
                setShowSortMenu(false);
              }}
            >
              <Ionicons
                name={
                  sortOption === "newest"
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={20}
                color={colors.PRIMARY_PURPLE}
              />
              <Text style={styles.optionText}>Terbaru</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setSortOption("oldest");
                setShowSortMenu(false);
              }}
            >
              <Ionicons
                name={
                  sortOption === "oldest"
                    ? "radio-button-on"
                    : "radio-button-off"
                }
                size={20}
                color={colors.PRIMARY_PURPLE}
              />
              <Text style={styles.optionText}>Terlama</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setSortOption("az");
                setShowSortMenu(false);
              }}
            >
              <Ionicons
                name={
                  sortOption === "az" ? "radio-button-on" : "radio-button-off"
                }
                size={20}
                color={colors.PRIMARY_PURPLE}
              />
              <Text style={styles.optionText}>A-Z</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => {
                setSortOption("za");
                setShowSortMenu(false);
              }}
            >
              <Ionicons
                name={
                  sortOption === "za" ? "radio-button-on" : "radio-button-off"
                }
                size={20}
                color={colors.PRIMARY_PURPLE}
              />
              <Text style={styles.optionText}>Z-A</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  // Styles untuk Search Bar
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.WHITE,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.DIVIDER,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: colors.TEXT_DARK,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noteCard: {
    backgroundColor: colors.WHITE,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: colors.SHADOW,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: "relative",
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: colors.TEXT_DARK,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: colors.TEXT_GREY,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: colors.TEXT_LIGHT_GREY,
    marginTop: 8,
  },
  deleteBtn: {
    position: "absolute",
    right: 12,
    top: 12,
    padding: 4,
  },
  addBtn: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: colors.FAB_BG,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: colors.FAB_SHADOW,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: colors.TEXT_DARK,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: colors.TEXT_GREY,
    textAlign: "center",
  },
  errorText: {
    color: colors.DANGER,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.FAB_BG,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: { color: colors.WHITE, fontSize: 16, fontWeight: "600" },

  // Styles Modal Sort
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  optionText: {
    marginLeft: 10,
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: colors.TEXT_DARK,
  },
});

export default NotesScreen;
