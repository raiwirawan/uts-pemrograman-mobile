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
  BackHandler,
  Dimensions,
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
import {
  deleteMultipleNotes,
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

  // === STATE DATA ===
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // === STATE FILTER & SORT & VIEW ===
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // State Tampilan: True = Grid (2 Kolom), False = List (1 Kolom)
  const [isGridView, setIsGridView] = useState(true);

  // === STATE SELECTION MODE ===
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const isSelectionMode = selectedNotes.length > 0;

  // === HEADER LOGIC ===
  useLayoutEffect(() => {
    if (isSelectionMode) {
      navigation.setOptions({
        title: `${selectedNotes.length} Dipilih`,
        headerLeft: () => (
          <TouchableOpacity
            onPress={cancelSelection}
            style={{ marginLeft: 15 }}
          >
            <Ionicons name="close" size={24} color={colors.TEXT_DARK} />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity
            onPress={handleDeleteSelected}
            style={{ marginRight: 15 }}
          >
            <Ionicons name="trash" size={24} color={colors.DANGER} />
          </TouchableOpacity>
        ),
      });
    } else {
      navigation.setOptions({
        title: "Catatan",
        headerLeft: undefined,
        headerRight: () => (
          <View style={{ flexDirection: "row", gap: 15, marginRight: 15 }}>
            <TouchableOpacity
              onPress={() => setShowFavoritesOnly((prev) => !prev)}
            >
              <Ionicons
                name={showFavoritesOnly ? "heart" : "heart-outline"}
                size={24}
                color={
                  showFavoritesOnly ? colors.DANGER : colors.PRIMARY_PURPLE
                }
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowSortMenu(true)}>
              <Ionicons name="filter" size={24} color={colors.PRIMARY_PURPLE} />
            </TouchableOpacity>
          </View>
        ),
      });
    }
  }, [
    navigation,
    isSelectionMode,
    selectedNotes,
    showFavoritesOnly,
    isGridView,
  ]);

  useEffect(() => {
    const backAction = () => {
      if (isSelectionMode) {
        cancelSelection();
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [isSelectionMode]);

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

  // === LOGIKA INTERAKSI ===
  const handleLongPress = (noteId: string) => {
    if (!isSelectionMode) {
      setSelectedNotes([noteId]);
    }
  };

  const handlePressNote = (note: Note) => {
    if (isSelectionMode) {
      if (selectedNotes.includes(note.id)) {
        const newSelection = selectedNotes.filter((id) => id !== note.id);
        setSelectedNotes(newSelection);
      } else {
        setSelectedNotes([...selectedNotes, note.id]);
      }
    } else {
      // @ts-ignore
      navigation.navigate("EditNote", { noteId: note.id, note: note });
    }
  };

  const cancelSelection = () => {
    setSelectedNotes([]);
  };

  const handleDeleteSingle = async (id: string) => {
    Alert.alert(
      "Hapus Catatan",
      "Apakah Anda yakin ingin menghapus catatan ini?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            if (!user?.uid) return;
            try {
              await deleteNote(user.uid, id);
              setNotes((prev) => prev.filter((n) => n.id !== id));
            } catch (err: any) {
              Alert.alert("Gagal", err.message);
            }
          },
        },
      ]
    );
  };

  const handleDeleteSelected = () => {
    Alert.alert(
      "Hapus Catatan",
      `Yakin ingin menghapus ${selectedNotes.length} catatan ini?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            if (!user?.uid) return;
            try {
              await deleteMultipleNotes(user.uid, selectedNotes);
              setNotes((prev) =>
                prev.filter((n) => !selectedNotes.includes(n.id))
              );
              cancelSelection();
            } catch (err: any) {
              Alert.alert("Gagal", "Terjadi kesalahan saat menghapus.");
            }
          },
        },
      ]
    );
  };

  const handleToggleFavorite = async (note: Note) => {
    if (isSelectionMode) return;
    if (!user?.uid) return;

    const newStatus = !note.isFavorite;
    setNotes((prevNotes) =>
      prevNotes.map((n) =>
        n.id === note.id ? { ...n, isFavorite: newStatus } : n
      )
    );

    try {
      await toggleFavoriteNote(user.uid, note.id, note.isFavorite || false);
    } catch (error) {
      setNotes((prevNotes) =>
        prevNotes.map((n) =>
          n.id === note.id ? { ...n, isFavorite: !newStatus } : n
        )
      );
    }
  };

  const filteredAndSortedNotes = useMemo(() => {
    let data = [...notes];
    if (showFavoritesOnly)
      data = data.filter((note) => note.isFavorite === true);
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      data = data.filter(
        (note) =>
          note.title.toLowerCase().includes(lowerQuery) ||
          note.content.toLowerCase().includes(lowerQuery)
      );
    }
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

  // === RENDER ITEM ===
  const renderNote = ({ item }: { item: Note }) => {
    const isSelected = selectedNotes.includes(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.noteCard,
          isGridView ? styles.cardGrid : styles.cardList,
          isSelected && styles.selectedCard,
        ]}
        onLongPress={() => handleLongPress(item.id)}
        onPress={() => handlePressNote(item)}
        activeOpacity={0.7}
      >
        {isSelectionMode && (
          <View style={styles.selectionOverlay}>
            <Ionicons
              name={isSelected ? "checkbox" : "square-outline"}
              size={24}
              color={
                isSelected ? colors.PRIMARY_PURPLE : colors.TEXT_LIGHT_GREY
              }
            />
          </View>
        )}

        <View style={styles.cardHeader}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          {!isSelectionMode && (
            <TouchableOpacity onPress={() => handleToggleFavorite(item)}>
              <Ionicons
                name={item.isFavorite ? "heart" : "heart-outline"}
                size={20}
                color={item.isFavorite ? colors.DANGER : colors.TEXT_LIGHT_GREY}
              />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.description} numberOfLines={isGridView ? 5 : 2}>
          {item.content}
        </Text>

        <View style={styles.cardFooter}>
          {/* === UPDATE FORMAT TANGGAL DI SINI === */}
          <Text style={styles.date}>
            {new Date(item.updatedAt.seconds * 1000).toLocaleString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>

          {!isSelectionMode && (
            <TouchableOpacity
              onPress={() => handleDeleteSingle(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={20} color={colors.DANGER} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading)
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color={colors.PRIMARY_PURPLE} />
      </View>
    );

  return (
    <View style={styles.container}>
      {/* === HEADER ROW === */}
      <View style={styles.headerRow}>
        <View
          style={[styles.searchContainer, isSelectionMode && { opacity: 0.5 }]}
        >
          <Ionicons
            name="search"
            size={20}
            color={colors.TEXT_GREY}
            style={{ marginRight: 8 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={showFavoritesOnly ? "Cari di favorite..." : "Cari..."}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.TEXT_LIGHT_GREY}
            editable={!isSelectionMode}
          />
          {searchQuery.length > 0 && !isSelectionMode && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.TEXT_GREY}
              />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.viewToggleBtn, isSelectionMode && { opacity: 0.5 }]}
          onPress={() => !isSelectionMode && setIsGridView((prev) => !prev)}
          disabled={isSelectionMode}
        >
          <Ionicons
            name={isGridView ? "list" : "grid-outline"}
            size={22}
            color={colors.PRIMARY_PURPLE}
          />
        </TouchableOpacity>
      </View>

      {showFavoritesOnly && (
        <View style={styles.filterInfo}>
          <Text style={styles.filterInfoText}>❤️ Favorite</Text>
          <TouchableOpacity onPress={() => setShowFavoritesOnly(false)}>
            <Text style={styles.clearFilterText}>Reset</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        key={isGridView ? "grid" : "list"}
        numColumns={isGridView ? 2 : 1}
        columnWrapperStyle={isGridView ? styles.row : undefined}
        data={filteredAndSortedNotes}
        renderItem={renderNote}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 12 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="document-outline"
              size={60}
              color={colors.DIVIDER}
            />
            <Text style={styles.emptyTitle}>Kosong</Text>
          </View>
        }
      />

      {!isSelectionMode && (
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate("AddNote" as never)}
        >
          <Ionicons name="add" size={30} color={colors.WHITE} />
        </TouchableOpacity>
      )}

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

  // Header Row
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 8,
    marginTop: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.WHITE,
    height: 45,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.DIVIDER,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: colors.TEXT_DARK,
  },

  viewToggleBtn: {
    width: 45,
    height: 45,
    backgroundColor: colors.WHITE,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.DIVIDER,
  },

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

  // Note Card
  noteCard: {
    backgroundColor: colors.WHITE,
    padding: 12,
    borderRadius: 12,
    shadowColor: colors.SHADOW,
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: "transparent",
  },
  cardGrid: {
    width: Dimensions.get("window").width / 2 - 18,
    flexGrow: 0,
    minHeight: 120,
    marginBottom: 0,
  },
  cardList: {
    width: "100%",
    marginBottom: 10,
    minHeight: 80,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 10,
  },

  selectedCard: {
    backgroundColor: "#F3E5F5",
    borderColor: colors.PRIMARY_PURPLE,
  },
  selectionOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: colors.TEXT_DARK,
    flex: 1,
    marginRight: 5,
  },
  description: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: colors.TEXT_GREY,
    lineHeight: 18,
    marginBottom: 10,
  },
  cardFooter: {
    marginTop: "auto",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    fontSize: 10,
    fontFamily: "Poppins-Regular",
    color: colors.TEXT_LIGHT_GREY,
  },

  addBtn: {
    position: "absolute",
    bottom: 30,
    right: 20,
    backgroundColor: colors.FAB_BG,
    width: 56,
    height: 56,
    borderRadius: 28,
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
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    color: colors.TEXT_DARK,
    marginTop: 20,
  },

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
