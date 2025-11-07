import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useState } from "react";
import {
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

import colors from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { createTodo, TodoItem } from "@/lib/todos";
import { AddTodoScreenProps } from "@/types/navigation";

const COLOR_OPTIONS = [
	colors.CARD_PURPLE,
	colors.CARD_BLUE,
	colors.CARD_GREEN,
	colors.CARD_YELLOW,
	colors.CARD_PINK,
];

export default function AddTodoScreen({}: AddTodoScreenProps) {
	const { user } = useAuth();
	const navigation = useNavigation();
	const [title, setTitle] = useState("");
	const [items, setItems] = useState<TodoItem[]>([]);
	const [currentItem, setCurrentItem] = useState("");
	const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
	const [saving, setSaving] = useState(false);

	const addItem = () => {
		if (currentItem.trim()) {
			setItems([...items, { text: currentItem.trim(), checked: false }]);
			setCurrentItem("");
		}
	};

	const toggleItem = (index: number) => {
		const updated = [...items];
		updated[index].checked = !updated[index].checked;
		setItems(updated);
	};

	const deleteItem = (index: number) => {
		setItems(items.filter((_, i) => i !== index));
	};

	const handleSave = async () => {
		if (!title.trim()) {
			Alert.alert("Error", "Title tidak boleh kosong");
			return;
		}
		if (items.length === 0) {
			Alert.alert("Error", "Tambahkan minimal 1 item");
			return;
		}

		setSaving(true);
		try {
			await createTodo(user!.uid, title.trim(), items, selectedColor);
			navigation.goBack();
		} catch (error) {
			Alert.alert("Error", "Gagal menyimpan todo");
			setSaving(false);
		}
	};

	return (
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				{/* Title Input */}
				<TextInput
					style={styles.titleInput}
					placeholder="Judul Todo..."
					placeholderTextColor={colors.TEXT_GREY}
					value={title}
					onChangeText={setTitle}
					maxLength={50}
				/>

				{/* Color Picker */}
				<Text style={styles.label}>Pilih Warna:</Text>
				<View style={styles.colorRow}>
					{COLOR_OPTIONS.map((color) => (
						<TouchableOpacity
							key={color}
							style={[
								styles.colorCircle,
								{ backgroundColor: color },
								selectedColor === color && styles.colorSelected,
							]}
							onPress={() => setSelectedColor(color)}
						>
							{selectedColor === color && (
								<Ionicons name="checkmark" size={20} color={colors.WHITE} />
							)}
						</TouchableOpacity>
					))}
				</View>

				{/* Add Item Input */}
				<Text style={styles.label}>Item Checklist:</Text>
				<View style={styles.inputRow}>
					<TextInput
						style={styles.itemInput}
						placeholder="Tambah item..."
						placeholderTextColor={colors.TEXT_GREY}
						value={currentItem}
						onChangeText={setCurrentItem}
						onSubmitEditing={addItem}
						returnKeyType="done"
					/>
					<TouchableOpacity style={styles.addButton} onPress={addItem}>
						<Ionicons name="add" size={24} color={colors.WHITE} />
					</TouchableOpacity>
				</View>

				{/* Items List */}
				{items.map((item, index) => (
					<View key={index} style={styles.itemCard}>
						<TouchableOpacity
							style={styles.itemContent}
							onPress={() => toggleItem(index)}
						>
							<Ionicons
								name={item.checked ? "checkbox" : "square-outline"}
								size={22}
								color={colors.PRIMARY_PURPLE}
							/>
							<Text
								style={[
									styles.itemText,
									item.checked && styles.itemTextChecked,
								]}
							>
								{item.text}
							</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => deleteItem(index)}>
							<Ionicons name="trash-outline" size={20} color={colors.DANGER} />
						</TouchableOpacity>
					</View>
				))}
			</ScrollView>

			{/* Save Button */}
			<TouchableOpacity
				style={[styles.saveButton, saving && styles.saveButtonDisabled]}
				onPress={handleSave}
				disabled={saving}
			>
				<Text style={styles.saveButtonText}>
					{saving ? "Menyimpan..." : "Simpan Todo"}
				</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.BACKGROUND,
	},
	scrollContent: {
		padding: 16,
		paddingBottom: 100,
	},
	titleInput: {
		fontSize: 24,
		fontWeight: "bold",
		color: colors.TEXT_DARK,
		borderBottomWidth: 2,
		borderBottomColor: colors.PRIMARY_PURPLE,
		paddingVertical: 8,
		marginBottom: 20,
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
		color: colors.TEXT_DARK,
		marginBottom: 8,
		marginTop: 12,
	},
	colorRow: {
		flexDirection: "row",
		gap: 12,
		marginBottom: 20,
	},
	colorCircle: {
		width: 50,
		height: 50,
		borderRadius: 25,
		justifyContent: "center",
		alignItems: "center",
		elevation: 2,
		shadowColor: colors.SHADOW,
		shadowOpacity: 0.2,
		shadowOffset: { width: 0, height: 1 },
		shadowRadius: 2,
	},
	colorSelected: {
		borderWidth: 3,
		borderColor: colors.TEXT_DARK,
	},
	inputRow: {
		flexDirection: "row",
		gap: 8,
		marginBottom: 16,
	},
	itemInput: {
		flex: 1,
		backgroundColor: colors.WHITE,
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 16,
		color: colors.TEXT_DARK,
		borderWidth: 1,
		borderColor: colors.INPUT_BORDER,
	},
	addButton: {
		backgroundColor: colors.PRIMARY_PURPLE,
		width: 44,
		height: 44,
		borderRadius: 8,
		justifyContent: "center",
		alignItems: "center",
	},
	itemCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: colors.WHITE,
		padding: 12,
		borderRadius: 8,
		marginBottom: 8,
		elevation: 1,
		shadowColor: colors.SHADOW,
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 1 },
		shadowRadius: 2,
	},
	itemContent: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	itemText: {
		fontSize: 16,
		color: colors.TEXT_DARK,
	},
	itemTextChecked: {
		textDecorationLine: "line-through",
		color: colors.TEXT_GREY,
	},
	saveButton: {
		position: "absolute",
		bottom: 20,
		left: 16,
		right: 16,
		backgroundColor: colors.PRIMARY_PURPLE,
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: "center",
		elevation: 4,
		shadowColor: colors.SHADOW,
		shadowOpacity: 0.3,
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 4,
	},
	saveButtonDisabled: {
		backgroundColor: colors.TEXT_GREY,
	},
	saveButtonText: {
		color: colors.WHITE,
		fontSize: 18,
		fontWeight: "bold",
	},
});
