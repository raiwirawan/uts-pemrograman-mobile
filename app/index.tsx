import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";

import ChangePasswordScreen from "./screens/ChangePasswordScreen";
import EditProfileScreen from "./screens/EditProfileScreen";
import HomeScreen from "./screens/HomeScreen";
import NotificationScreen from "./screens/NotificationScreen";

const Stack = createNativeStackNavigator();

export default function App() {
	return (
		<Stack.Navigator screenOptions={{ headerTitleAlign: "center" }}>
			<Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
			<Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: "Edit Profile" }} />
			<Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: "Change Password" }} />
			<Stack.Screen name="Notification" component={NotificationScreen} options={{ title: "Notifications" }} />
		</Stack.Navigator>
	);
}
