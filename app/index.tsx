// App.js

import { Ionicons } from "@expo/vector-icons"; // Untuk ikon
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as React from "react";

// Import Layar
import NotesScreen from "./screens/NotesScreen";
import ProfileScreen from "./screens/ProfileScreen";
import TodoListScreen from "./screens/TodoListScreen";

const Tab = createBottomTabNavigator();

export default function App() {
	return (
		// NavigationContainer adalah wadah untuk semua navigasi

		<Tab.Navigator
			initialRouteName="Todo" // Menentukan tab default saat aplikasi dimulai
			screenOptions={({ route }) => ({
				// Fungsi ini mengatur tampilan tab (Icon, Warna, dll.)
				tabBarIcon: ({ focused, color, size }) => {
					let iconName: keyof typeof Ionicons.glyphMap;

					if (route.name === "Notes") {
						iconName = focused ? "document-text" : "document-text-outline";
					} else if (route.name === "Todo") {
						iconName = focused
							? "checkmark-circle"
							: "checkmark-circle-outline";
					} else if (route.name === "Profile") {
						iconName = focused ? "person" : "person-outline";
					} else {
						iconName = "help-outline";
					}

					// Anda bisa menggunakan komponen ikon dari @expo/vector-icons
					return <Ionicons name={iconName} size={size} color={color} />;
				},
				tabBarActiveTintColor: "#007AFF", // Warna ikon/label aktif (misal: Biru)
				tabBarInactiveTintColor: "gray", // Warna ikon/label tidak aktif
				headerShown: true, // Menampilkan header di atas tab
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
