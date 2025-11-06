import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as React from "react";

import NotesScreen from "./NotesScreen";
import ProfileScreen from "./ProfileScreen";
import TodoListScreen from "./TodoListScreen";

const Tab = createBottomTabNavigator();

function HomeScreen() {
    return (
        <Tab.Navigator
            initialRouteName="Todo"
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    if (route.name === "Notes") {
                        iconName = focused ? "document-text" : "document-text-outline";
                    } else if (route.name === "Todo") {
                        iconName = focused ? "checkmark-circle" : "checkmark-circle-outline";
                    } else if (route.name === "Profile") {
                        iconName = focused ? "person" : "person-outline";
                    } else {
                        iconName = "help-outline";
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: "#007AFF",
                tabBarInactiveTintColor: "gray",
                headerTitleAlign: "center",
                headerShown: true,
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