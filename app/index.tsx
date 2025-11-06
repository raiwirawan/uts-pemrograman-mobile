import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import ChangePasswordScreen from "./screens/ChangePasswordScreen";
import EditProfileScreen from "./screens/EditProfileScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import NotificationScreen from "./screens/NotificationScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import RegisterScreen from "./screens/RegisterScreen";

const Stack = createNativeStackNavigator();

export default function App() {
	return (
		<SafeAreaProvider>
			<Stack.Navigator
				screenOptions={{ headerTitleAlign: "center" }}
				initialRouteName="Onboarding"
			>
				<Stack.Screen
					name="Onboarding"
					component={OnboardingScreen}
					options={{ headerShown: false }}
				/>
				<Stack.Screen
					name="Register"
					component={RegisterScreen}
					options={{ headerShown: false }}
				/>
				<Stack.Screen
					name="Login"
					component={LoginScreen}
					options={{ headerShown: false }}
				/>
				<Stack.Screen
					name="ForgotPassword"
					component={ForgotPasswordScreen}
					options={{ headerShown: false }}
				/>
				<Stack.Screen
					name="Home"
					component={HomeScreen}
					options={{ headerShown: false }}
				/>
				<Stack.Screen
					name="EditProfile"
					component={EditProfileScreen}
					options={{ title: "Edit Profile" }}
				/>
				<Stack.Screen
					name="ChangePassword"
					component={ChangePasswordScreen}
					options={{ title: "Change Password" }}
				/>
				<Stack.Screen
					name="Notification"
					component={NotificationScreen}
					options={{
						title: "Notifications",
						headerShown: false,
						presentation: "transparentModal",
						animation: "fade",
						contentStyle: { backgroundColor: "transparent" },
					}}
				/>
			</Stack.Navigator>
		</SafeAreaProvider>
	);
}
