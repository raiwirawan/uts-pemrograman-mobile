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
// Pastikan toggleFavoriteNote sudah dibuat di lib/notes.ts sesuai langkah 1
import {
  deleteNote,
  getUserNotes,
  Note,
  toggleFavoriteNote,
} from "@/lib/notes";
import { NotesScreenProps } from "@/types/navigation";

type SortOption = "newest" | "oldest" | "az" | "za";

// eslint-disable-next-line no-empty-pattern
function NotesScreen({}: NotesScreenProps) {
  const { user } = useAuth();
  const navigation = useNavigation<NotesScreenProps["navigation"]>();

  // === STATE ===
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter, Search, Sort
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);

  // State Baru: Menampilkan Hanya Favorite
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // === HEADER BUTTONS ===
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: "row", gap: 15, marginRight: 15 }}>
          {/* 1. Tombol Filter Favorite (Header) */}
          <TouchableOpacity
            onPress={() => setShowFavoritesOnly((prev) => !prev)}
          >
            <Ionicons
              name={showFavoritesOnly ? "heart" : "heart-outline"}
              size={24}
              color={showFavoritesOnly ? colors.DANGER : colors.PRIMARY_PURPLE}
            />
          </TouchableOpacity>

          {/* 2. Tombol Filter Sort */}
          <TouchableOpacity onPress={() => setShowSortMenu(true)}>
            <Ionicons name="filter" size={24} color={colors.PRIMARY_PURPLE} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, showFavoritesOnly]); // Update header saat state berubah

  // === LOAD DATA ===
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

  // === FUNGSI TOGGLE FAVORITE (AKSI KLIK LOVE DI KARTU) ===
  const handleToggleFavorite = async (note: Note) => {
    if (!user?.uid) return;

    // 1. Update UI Optimistic (Langsung berubah biar cepat)
    const newStatus = !note.isFavorite;
    setNotes((prevNotes) =>
      prevNotes.map((n) =>
        n.id === note.id ? { ...n, isFavorite: newStatus } : n
      )
    );

    // 2. Update ke Firebase di background
    try {
      await toggleFavoriteNote(user.uid, note.id, note.isFavorite || false);
    } catch (error) {
      // Jika gagal, kembalikan UI ke semula
      setNotes((prevNotes) =>
        prevNotes.map((n) =>
          n.id === note.id ? { ...n, isFavorite: !newStatus } : n
        )
      );
      Alert.alert("Error", "Gagal mengupdate favorite");
    }
  };

  // === LOGIKA FILTER LENGKAP (SEARCH + FAVORITE + SORT) ===
  const filteredAndSortedNotes = useMemo(() => {
    let data = [...notes];

    // A. Filter Favorite Only
    if (showFavoritesOnly) {
      data = data.filter((note) => note.isFavorite === true);
    }

    // B. Filter Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      data = data.filter(
        (note) =>
          note.title.toLowerCase().includes(lowerQuery) ||
          note.content.toLowerCase().includes(lowerQuery)
      );
    }

    // C. Sorting
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
  }, [notes, searchQuery, sortOption, showFavoritesOnly]);

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
      <View style={styles.cardHeader}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>

        {/* TOMBOL LOVE DI KARTU */}
        <TouchableOpacity onPress={() => handleToggleFavorite(item)}>
          <Ionicons
            name={item.isFavorite ? "heart" : "heart-outline"}
            size={22}
            color={item.isFavorite ? colors.DANGER : colors.TEXT_LIGHT_GREY}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.description}>
        {item.content.length > 100
          ? `${item.content.substring(0, 100)}...`
          : item.content}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.date}>
          {new Date(item.updatedAt.seconds * 1000).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </Text>
        <TouchableOpacity
          onPress={() =>
            Alert.alert("Hapus", "Yakin hapus?", [
              { text: "Batal", style: "cancel" },
              {
                text: "Hapus",
                style: "destructive",
                onPress: () => handleDelete(item.id),
              },
            ])
          }
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color={colors.DANGER} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading)
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color={colors.PRIMARY_PURPLE} />
      </View>
    );

  return (
    <View style={styles.container}>
      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={colors.TEXT_GREY}
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={
            showFavoritesOnly ? "Cari di favorite..." : "Cari judul atau isi..."
          }
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.TEXT_LIGHT_GREY}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color={colors.TEXT_GREY} />
          </TouchableOpacity>
        )}
      </View>

      {/* INFO BAR: JIKA MODE FAVORITE AKTIF */}
      {showFavoritesOnly && (
        <View style={styles.filterInfo}>
          <Text style={styles.filterInfoText}>Menampilkan Favorite</Text>
          <TouchableOpacity onPress={() => setShowFavoritesOnly(false)}>
            <Text style={styles.clearFilterText}>Reset</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={filteredAndSortedNotes}
        renderItem={renderNote}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name={
                showFavoritesOnly ? "heart-dislike-outline" : "document-outline"
              }
              size={80}
              color={colors.DIVIDER}
            />
            <Text style={styles.emptyTitle}>
              {showFavoritesOnly ? "Tidak ada favorite" : "Belum ada catatan"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {showFavoritesOnly
                ? "Tandai catatan dengan ❤️ untuk melihatnya di sini"
                : "Tekan tombol + untuk membuat catatan baru"}
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => navigation.navigate("AddNote" as never)}
      >
        <Ionicons name="add" size={30} color={colors.WHITE} />
      </TouchableOpacity>

      {/* MODAL SORT */}
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
  container: { flex: 1, backgroundColor: colors.BACKGROUND },
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

  // Info Bar Style (New)
  filterInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 10,
    alignItems: "center",
  },
  filterInfoText: {
    fontSize: 12,
    color: colors.DANGER,
    fontFamily: "Poppins-Bold",
  },
  clearFilterText: {
    fontSize: 12,
    color: colors.TEXT_GREY,
    textDecorationLine: "underline",
    fontFamily: "Poppins-Regular",
  },

  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  // Card Style Updated
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
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: colors.TEXT_DARK,
    flex: 1,
    marginRight: 10,
  },

  description: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: colors.TEXT_GREY,
    lineHeight: 20,
    marginBottom: 10,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  date: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: colors.TEXT_LIGHT_GREY,
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

  // Modal
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
