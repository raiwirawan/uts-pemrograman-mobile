import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	RefreshControl,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import DraggableFlatList, {
	RenderItemParams,
} from "react-native-draggable-flatlist";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Animated, { FadeIn } from "react-native-reanimated";

import colors from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { deleteTodo, getUserTodos, Todo, updateTodo } from "@/lib/todos";
import { TodoListScreenProps } from "@/types/navigation";

export default function TodoListScreen() {
	const { user } = useAuth();
	const navigation = useNavigation<TodoListScreenProps["navigation"]>();
	const [todos, setTodos] = useState<Todo[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	const loadTodos = useCallback(() => {
		if (!user?.uid) {
			setLoading(false);
			return;
		}
		setRefreshing(true);
		const unsubscribe = getUserTodos(user.uid, (data) => {
			setTodos(data);
			setLoading(false);
			setRefreshing(false);
		});

		// unsubscribe setelah beberapa detik supaya snapshot tidak ganda
		setTimeout(() => unsubscribe(), 1000);
	}, [user?.uid]);

	useEffect(() => {
		loadTodos();
	}, [user?.uid, loadTodos]);

	const onRefresh = () => {
		setRefreshing(true);
		loadTodos();
	};

	const handleDelete = (id: string) => {
		Alert.alert("Hapus Todo", "Yakin ingin menghapus?", [
			{ text: "Batal", style: "cancel" },
			{
				text: "Hapus",
				style: "destructive",
				onPress: () => deleteTodo(user!.uid, id),
			},
		]);
	};

	const renderRightActions = (id: string) => (
		<TouchableOpacity
			style={styles.deleteAction}
			onPress={() => handleDelete(id)}
		>
			<Ionicons name="trash" size={24} color={colors.WHITE} />
		</TouchableOpacity>
	);

	const renderTodo = ({ item, drag }: RenderItemParams<Todo>) => (
		<Swipeable
			renderRightActions={() => renderRightActions(item.id!)}
			overshootRight={false}
		>
			<Animated.View
				entering={FadeIn}
				style={[styles.card, { backgroundColor: item.color }]}
			>
				<TouchableOpacity
					onPress={() => {
						// @ts-ignore
						navigation.navigate("EditTodo", { todoId: item.id });
					}}
					onLongPress={drag}
					style={{ flex: 1 }}
				>
					<Text style={styles.title}>{item.title}</Text>
					{item.items.map((task, i) => (
						<View key={i} style={styles.row}>
							<Ionicons
								name={task.checked ? "checkbox" : "square-outline"}
								size={18}
								color={colors.TEXT_DARK}
							/>
							<Text style={styles.taskText}>{task.text}</Text>
						</View>
					))}
					<Text style={styles.date}>
						{new Date(
							item.updatedAt?.seconds * 1000 || Date.now()
						).toLocaleDateString()}
					</Text>
				</TouchableOpacity>
			</Animated.View>
		</Swipeable>
	);

	if (loading) {
		return (
			<View style={styles.center}>
				<ActivityIndicator size="large" color={colors.PRIMARY_PURPLE} />
				<Text style={styles.loadingText}>Memuat todos...</Text>
			</View>
		);
	}

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<View style={styles.container}>
				<DraggableFlatList
					data={todos}
					keyExtractor={(item) => item.id!}
					renderItem={renderTodo}
					onDragEnd={({ data }) => {
						data.forEach((todo) => {
							if (todo.id) {
								updateTodo(user!.uid, todo.id, { updatedAt: new Date() });
							}
						});
						setTodos(data);
					}}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={onRefresh}
							colors={[colors.PRIMARY_PURPLE]}
						/>
					}
					contentContainerStyle={{ paddingBottom: 100 }}
				/>

				<TouchableOpacity
					style={styles.fab}
					onPress={() => navigation.navigate("AddTodo" as never)}
				>
					<Ionicons name="add" size={30} color={colors.WHITE} />
				</TouchableOpacity>
			</View>
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.BACKGROUND,
	},
	center: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		marginTop: 16,
		color: colors.TEXT_GREY,
		fontSize: 16,
	},
	card: {
		padding: 16,
		borderRadius: 12,
		marginHorizontal: 12,
		marginVertical: 6,
		elevation: 2,
		shadowColor: colors.SHADOW,
		shadowOpacity: 0.1,
		shadowOffset: { width: 0, height: 1 },
		shadowRadius: 3,
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 6,
		color: colors.TEXT_DARK,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 3,
	},
	taskText: {
		marginLeft: 8,
		fontSize: 14,
		color: colors.TEXT_DARK,
	},
	date: {
		marginTop: 8,
		fontSize: 12,
		color: colors.TEXT_LIGHT_GREY,
	},
	fab: {
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
	deleteAction: {
		backgroundColor: colors.DANGER,
		justifyContent: "center",
		alignItems: "center",
		width: 80,
		marginVertical: 6,
		borderRadius: 12,
		marginRight: 12,
	},
});
