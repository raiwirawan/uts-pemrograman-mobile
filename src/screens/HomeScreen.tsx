import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Colors from "@/constants/colors";
import { HomeScreenProps } from "@/types/navigation";

import NotesScreen from "./NotesScreen";
import ProfileScreen from "./ProfileScreen";
import TodoListScreen from "./TodoListScreen";

type RootTabParamList = {
	Notes: undefined;
	Todo: undefined;
	Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

function HomeScreen({ navigation }: HomeScreenProps) {
	return (
		<Tab.Navigator
			initialRouteName="Notes"
			screenOptions={({ route }) => ({
				tabBarIcon: ({ focused, color, size }) => {
					let iconName: keyof typeof Ionicons.glyphMap = "help-outline";

					if (route.name === "Notes") {
						iconName = focused ? "document-text" : "document-text-outline";
					} else if (route.name === "Todo") {
						iconName = focused
							? "checkmark-circle"
							: "checkmark-circle-outline";
					} else if (route.name === "Profile") {
						iconName = focused ? "person" : "person-outline";
					}

					return <Ionicons name={iconName} size={size} color={color} />;
				},
				tabBarActiveTintColor: Colors.TAB_ACTIVE,
				tabBarInactiveTintColor: Colors.TAB_INACTIVE,
				tabBarStyle: {
					backgroundColor: Colors.TAB_BACKGROUND,
					borderTopWidth: 1,
					borderTopColor: "#EEEEEE",
					height: 80,
					paddingBottom: 16,
					paddingTop: 8,
				},
				tabBarLabelStyle: {
					fontSize: 12,
					fontWeight: "600",
				},
				headerTitleAlign: "center",
				headerShown: true,
				headerTintColor: Colors.HEADER_TINT,
				headerTitleStyle: {
					fontWeight: "bold",
					fontSize: 18,
				},
			})}
		>
			<Tab.Screen
				name="Notes"
				component={NotesScreen}
				options={{ title: "Catatan" }}
			/>
			<Tab.Screen
				name="Todo"
				component={TodoListScreen}
				options={{ title: "To-do List" }}
			/>
			<Tab.Screen
				name="Profile"
				component={ProfileScreen}
				options={{ title: "Profil" }}
			/>
		</Tab.Navigator>
	);
}

export default HomeScreen;
