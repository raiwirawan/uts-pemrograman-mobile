import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	BackHandler,
	Dimensions,
	FlatList,
	Modal,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

// === TAMBAHAN IMPORT UNTUK FIX WARNING ===
import { Timestamp } from "firebase/firestore";

import colors from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import {
	deleteMultipleTodos,
	deleteTodo,
	getUserTodos,
	Todo,
	toggleFavoriteTodo,
	updateTodo,
} from "@/lib/todos";

type SortOption = "newest" | "oldest" | "az" | "za";

export default function TodoListScreen() {
	const { user } = useAuth();
	const navigation = useNavigation<any>();

	// === STATE ===
	const [todos, setTodos] = useState<Todo[]>([]);
	const [loading, setLoading] = useState(true);

	const [searchQuery, setSearchQuery] = useState("");
	const [sortOption, setSortOption] = useState<SortOption>("newest");
	const [showSortMenu, setShowSortMenu] = useState(false);

	// Filter Favorite
	const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

	// Tampilan Grid/List
	const [isGridView, setIsGridView] = useState(false);

	// Selection Mode
	const [selectedTodos, setSelectedTodos] = useState<string[]>([]);
	const isSelectionMode = selectedTodos.length > 0;

	// === HEADER LOGIC ===
	useLayoutEffect(() => {
		if (isSelectionMode) {
			navigation.setOptions({
				title: `${selectedTodos.length} Dipilih`,
				headerStyle: { backgroundColor: colors.WHITE },
				headerLeft: () => (
					<TouchableOpacity
						onPress={() => setSelectedTodos([])}
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
				title: "Tasks",
				headerStyle: {
					shadowColor: "transparent",
					elevation: 0,
					borderBottomWidth: 0,
				},
				headerTitleStyle: { fontFamily: "Poppins-Bold", fontSize: 20 },
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
	}, [navigation, isSelectionMode, selectedTodos, showFavoritesOnly]);

	// Back Handler
	useEffect(() => {
		const backAction = () => {
			if (isSelectionMode) {
				setSelectedTodos([]);
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

	// === LOAD DATA (REALTIME) ===
	useEffect(() => {
		if (!user?.uid) return;
		setLoading(true);
		const unsubscribe = getUserTodos(user.uid, (data) => {
			setTodos(data);
			setLoading(false);
		});
		return () => unsubscribe();
	}, [user?.uid]);

	// === ACTIONS ===
	const handleToggleFavorite = async (todo: Todo) => {
		if (isSelectionMode || !user?.uid) return;
		try {
			await toggleFavoriteTodo(user.uid, todo.id!, todo.isFavorite);
		} catch (error) {
			console.error(error);
		}
	};

	const handleToggleCheck = async (todo: Todo) => {
		if (isSelectionMode || !user?.uid) return;
		try {
			await updateTodo(user.uid, todo.id!, { checked: !todo.checked });
		} catch (error) {
			console.error(error);
		}
	};

	const handleDeleteSingle = async (id: string) => {
		Alert.alert("Hapus Tugas", "Yakin hapus tugas ini?", [
			{ text: "Batal", style: "cancel" },
			{
				text: "Hapus",
				style: "destructive",
				onPress: async () => {
					if (user?.uid) await deleteTodo(user.uid, id);
				},
			},
		]);
	};

	const handleDeleteSelected = () => {
		Alert.alert(
			"Hapus Tugas",
			`Hapus ${selectedTodos.length} tugas terpilih?`,
			[
				{ text: "Batal", style: "cancel" },
				{
					text: "Hapus",
					style: "destructive",
					onPress: async () => {
						if (user?.uid) await deleteMultipleTodos(user.uid, selectedTodos);
						setSelectedTodos([]);
					},
				},
			]
		);
	};

	// === FILTER & SORT ===
	const filteredTodos = useMemo(() => {
		let data = [...todos];

		if (showFavoritesOnly) data = data.filter((t) => t.isFavorite);

		if (searchQuery) {
			const q = searchQuery.toLowerCase();
			data = data.filter(
				(t) =>
					t.title.toLowerCase().includes(q) ||
					(t.description && t.description.toLowerCase().includes(q))
			);
		}

		switch (sortOption) {
			case "newest":
				return data.sort((a, b) => b.updatedAt?.seconds - a.updatedAt?.seconds);
			case "oldest":
				return data.sort((a, b) => a.updatedAt?.seconds - b.updatedAt?.seconds);
			case "az":
				return data.sort((a, b) => a.title.localeCompare(b.title));
			case "za":
				return data.sort((a, b) => b.title.localeCompare(a.title));
			default:
				return data;
		}
	}, [todos, searchQuery, sortOption, showFavoritesOnly]);

	// === RENDER ITEM ===
	const renderTodo = ({ item }: { item: Todo }) => {
		const isSelected = selectedTodos.includes(item.id!);
		const containerStyle = isGridView ? styles.cardGrid : styles.cardList;
		const totalSubtasks = item.subtasks ? item.subtasks.length : 0;
		const completedSubtasks = item.subtasks
			? item.subtasks.filter((s) => s.completed).length
			: 0;

		return (
			<TouchableOpacity
				style={[containerStyle, isSelected && styles.selectedCard]}
				onLongPress={() => {
					if (!isSelectionMode && item.id) setSelectedTodos([item.id]);
				}}
				onPress={() => {
					if (isSelectionMode && item.id) {
						setSelectedTodos((prev) =>
							prev.includes(item.id!)
								? prev.filter((id) => id !== item.id)
								: [...prev, item.id!]
						);
					} else {
						// === PERBAIKAN UTAMA: SERIALISASI DATA ===
						// Mengubah Timestamp menjadi angka (milliseconds) sebelum dikirim
						// agar tidak menyebabkan warning "Non-serializable values"
						const serializedTodo = {
							...item,
							dueDate:
								item.dueDate instanceof Timestamp
									? item.dueDate.toMillis()
									: item.dueDate,
							createdAt:
								item.createdAt instanceof Timestamp
									? item.createdAt.toMillis()
									: item.createdAt,
							updatedAt:
								item.updatedAt instanceof Timestamp
									? item.updatedAt.toMillis()
									: item.updatedAt,
						};

						navigation.navigate("EditTodo", { todo: serializedTodo });
					}
				}}
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

				<View
					style={[
						styles.innerContent,
						isGridView && { flexDirection: "column", alignItems: "flex-start" },
					]}
				>
					{!isSelectionMode && (
						<TouchableOpacity
							onPress={() => handleToggleCheck(item)}
							style={[
								styles.checkboxContainer,
								isGridView && { marginBottom: 8 },
							]}
							hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
						>
							<Ionicons
								name={item.checked ? "checkmark-circle" : "ellipse-outline"}
								size={26}
								color={item.checked ? "#4CAF50" : colors.TEXT_LIGHT_GREY}
							/>
						</TouchableOpacity>
					)}

					<View style={{ flex: 1, marginLeft: isGridView ? 0 : 4 }}>
						<Text
							style={[styles.title, item.checked && styles.textCompleted]}
							numberOfLines={isGridView ? 2 : 1}
						>
							{item.title}
						</Text>

						<View style={styles.metaContainer}>
							{item.dueDate && (
								<View style={styles.metaItem}>
									<Ionicons
										name="calendar-outline"
										size={12}
										color={item.checked ? colors.TEXT_LIGHT_GREY : "#D1453B"}
									/>
									<Text
										style={[
											styles.metaText,
											item.checked && { color: colors.TEXT_LIGHT_GREY },
										]}
									>
										{new Date(item.dueDate.seconds * 1000).toLocaleDateString(
											"id-ID",
											{ day: "numeric", month: "short" }
										)}
									</Text>
								</View>
							)}
							{totalSubtasks > 0 && (
								<View style={[styles.metaItem, { marginLeft: 12 }]}>
									<Ionicons
										name="git-branch-outline"
										size={12}
										color={colors.TEXT_GREY}
									/>
									<Text style={[styles.metaText, { color: colors.TEXT_GREY }]}>
										{completedSubtasks}/{totalSubtasks}
									</Text>
								</View>
							)}
						</View>

						{item.description ? (
							<Text style={styles.description} numberOfLines={1}>
								{item.description}
							</Text>
						) : null}
					</View>

					{!isSelectionMode && !isGridView && (
						<View style={styles.actionsRow}>
							<TouchableOpacity
								onPress={() => handleToggleFavorite(item)}
								style={{ marginRight: 10 }}
							>
								<Ionicons
									name={item.isFavorite ? "heart" : "heart-outline"}
									size={20}
									color={
										item.isFavorite ? colors.DANGER : colors.TEXT_LIGHT_GREY
									}
								/>
							</TouchableOpacity>
						</View>
					)}

					{!isSelectionMode && isGridView && (
						<View
							style={{
								flexDirection: "row",
								justifyContent: "space-between",
								width: "100%",
								marginTop: 10,
							}}
						>
							<TouchableOpacity onPress={() => handleToggleFavorite(item)}>
								<Ionicons
									name={item.isFavorite ? "heart" : "heart-outline"}
									size={20}
									color={
										item.isFavorite ? colors.DANGER : colors.TEXT_LIGHT_GREY
									}
								/>
							</TouchableOpacity>
						</View>
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
			{/* SEARCH BAR & VIEW TOGGLE */}
			<View style={styles.headerControl}>
				<View
					style={[styles.searchContainer, isSelectionMode && { opacity: 0.5 }]}
				>
					<Ionicons
						name="search"
						size={18}
						color={colors.TEXT_GREY}
						style={{ marginRight: 8 }}
					/>
					<TextInput
						style={styles.searchInput}
						placeholder={
							showFavoritesOnly ? "Cari favorite..." : "Cari tugas..."
						}
						value={searchQuery}
						onChangeText={setSearchQuery}
						placeholderTextColor={colors.TEXT_LIGHT_GREY}
						editable={!isSelectionMode}
					/>
					{searchQuery.length > 0 && !isSelectionMode && (
						<TouchableOpacity onPress={() => setSearchQuery("")}>
							<Ionicons
								name="close-circle"
								size={18}
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
						size={20}
						color={colors.PRIMARY_PURPLE}
					/>
				</TouchableOpacity>
			</View>

			{/* === PEMISAH (DIVIDER) BARU === */}
			<View style={styles.headerSeparator} />

			{/* Info Filter Favorite */}
			{showFavoritesOnly && (
				<View style={styles.filterInfo}>
					<Text style={styles.filterInfoText}>❤️ Tasks</Text>
					<TouchableOpacity onPress={() => setShowFavoritesOnly(false)}>
						<Text style={styles.clearFilterText}>Reset</Text>
					</TouchableOpacity>
				</View>
			)}

			<FlatList
				key={isGridView ? "grid" : "list"}
				numColumns={isGridView ? 2 : 1}
				columnWrapperStyle={isGridView ? styles.row : undefined}
				data={filteredTodos}
				renderItem={renderTodo}
				contentContainerStyle={{
					paddingBottom: 100,
					paddingHorizontal: isGridView ? 12 : 0,
				}}
				ListEmptyComponent={
					<View style={styles.emptyContainer}>
						<Ionicons
							name="checkmark-done-circle-outline"
							size={60}
							color="#eee"
						/>
						<Text style={styles.emptyTitle}>Semua tugas selesai!</Text>
						<Text style={styles.emptySub}>Atau tidak ada yang cocok.</Text>
					</View>
				}
			/>

			{!isSelectionMode && (
				<TouchableOpacity
					style={styles.addBtn}
					onPress={() => navigation.navigate("EditTodo" as never)}
				>
					<Ionicons name="add" size={32} color={colors.WHITE} />
				</TouchableOpacity>
			)}

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
						<Text style={styles.modalTitle}>Urutkan Tugas</Text>
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
	container: { flex: 1, backgroundColor: colors.WHITE },
	centerContent: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},

	headerControl: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		marginTop: 12,
	},

	// === STYLE PEMISAH ===
	headerSeparator: {
		height: 1,
		backgroundColor: "#EEEEEE", // Warna abu-abu sangat muda
		marginTop: 12,
		marginBottom: 4,
		width: "100%",
	},

	searchContainer: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#f5f5f5",
		height: 40,
		borderRadius: 8,
		paddingHorizontal: 12,
		marginRight: 10,
	},
	searchInput: {
		flex: 1,
		top: 5,
		fontSize: 14,
		fontFamily: "Poppins-Regular",
		color: colors.TEXT_DARK,
	},
	viewToggleBtn: {
		width: 40,
		height: 40,
		backgroundColor: "#f5f5f5",
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
	},

	filterInfo: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		marginBottom: 10,
		alignItems: "center",
		marginTop: 8,
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

	cardList: {
		width: "100%",
		backgroundColor: colors.WHITE,
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#f0f0f0",
		flexDirection: "row",
		alignItems: "center",
	},
	cardGrid: {
		width: Dimensions.get("window").width / 2 - 18,
		flexGrow: 0,
		backgroundColor: colors.WHITE,
		borderRadius: 12,
		padding: 12,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: "#f0f0f0",
		elevation: 2,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 3,
	},

	row: { justifyContent: "space-between", marginBottom: 10 },
	innerContent: { flexDirection: "row", alignItems: "flex-start", flex: 1 },
	checkboxContainer: { marginRight: 10, paddingTop: 0 },
	selectedCard: { backgroundColor: "#F0F4FF" },
	selectionOverlay: { position: "absolute", top: "40%", right: 10, zIndex: 10 },

	title: {
		fontSize: 16,
		fontFamily: "Poppins-Regular",
		color: colors.TEXT_DARK,
		marginBottom: 2,
	},
	textCompleted: {
		textDecorationLine: "line-through",
		color: colors.TEXT_LIGHT_GREY,
	},

	metaContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 2,
		marginBottom: 2,
	},
	metaItem: { flexDirection: "row", alignItems: "center" },
	metaText: {
		marginLeft: 4,
		color: "#D1453B",
		fontSize: 11,
		fontWeight: "600",
	},

	description: {
		fontSize: 11,
		fontFamily: "Poppins-Regular",
		color: colors.TEXT_GREY,
		marginTop: 2,
	},
	actionsRow: { flexDirection: "row", alignItems: "center" },

	addBtn: {
		position: "absolute",
		bottom: 30,
		right: 20,
		backgroundColor: colors.PRIMARY_PURPLE,
		width: 56,
		height: 56,
		borderRadius: 28,
		justifyContent: "center",
		alignItems: "center",
		elevation: 6,
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
	emptySub: {
		fontSize: 14,
		fontFamily: "Poppins-Regular",
		color: colors.TEXT_LIGHT_GREY,
		marginTop: 4,
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
