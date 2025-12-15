import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider } from "@/providers/AuthProvider";
import GuestRoute from "@/routes/GuestRoute";
import ProtectedRoute from "@/routes/ProtectedRoute";

import type {
  AddNoteScreenProps,
  AddTodoScreenProps,
  ChangePasswordScreenProps,
  EditNoteScreenProps,
  EditProfileScreenProps,
  EditTodoScreenProps,
  ForgotPasswordScreenProps,
  HomeScreenProps,
  LoginScreenProps,
  NotificationScreenProps,
  OnboardingScreenProps,
  RegisterScreenProps,
} from "@/types/navigation";

import AddNoteScreen from "@/screens/AddNoteScreen";
import AddTodoScreen from "@/screens/AddTodoScreen";
import ChangePasswordScreen from "@/screens/ChangePasswordScreen";
import EditNoteScreen from "@/screens/EditNoteScreen";
import EditProfileScreen from "@/screens/EditProfileScreen";
import EditTodoScreen from "@/screens/EditTodoScreen";
import ForgotPasswordScreen from "@/screens/ForgotPasswordScreen";
import HomeScreen from "@/screens/HomeScreen";
import LoginScreen from "@/screens/LoginScreen";
import NotificationScreen from "@/screens/NotificationScreen";
import OnboardingScreen from "@/screens/OnboardingScreen";
import RegisterScreen from "@/screens/RegisterScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <Stack.Navigator
          screenOptions={{
            headerTitleAlign: "center",
            animation: "fade_from_bottom",
            animationDuration: 0,
          }}
          initialRouteName="Onboarding"
        >
          {/* GUEST SCREENS */}
          <Stack.Screen name="Onboarding" options={{ headerShown: false }}>
            {(props) => (
              <GuestRoute>
                <OnboardingScreen {...(props as OnboardingScreenProps)} />
              </GuestRoute>
            )}
          </Stack.Screen>

          <Stack.Screen name="Login" options={{ headerShown: false }}>
            {(props) => (
              <GuestRoute>
                <LoginScreen {...(props as LoginScreenProps)} />
              </GuestRoute>
            )}
          </Stack.Screen>

          <Stack.Screen name="Register" options={{ headerShown: false }}>
            {(props) => (
              <GuestRoute>
                <RegisterScreen {...(props as RegisterScreenProps)} />
              </GuestRoute>
            )}
          </Stack.Screen>

          <Stack.Screen name="ForgotPassword" options={{ headerShown: false }}>
            {(props) => (
              <GuestRoute>
                <ForgotPasswordScreen
                  {...(props as ForgotPasswordScreenProps)}
                />
              </GuestRoute>
            )}
          </Stack.Screen>

          {/* PROTECTED SCREENS */}
          <Stack.Screen name="Home" options={{ headerShown: false }}>
            {(props) => (
              <ProtectedRoute>
                <HomeScreen {...(props as HomeScreenProps)} />
              </ProtectedRoute>
            )}
          </Stack.Screen>

          <Stack.Screen name="EditProfile" options={{ title: "Edit Profile" }}>
            {(props) => (
              <ProtectedRoute>
                <EditProfileScreen {...(props as EditProfileScreenProps)} />
              </ProtectedRoute>
            )}
          </Stack.Screen>

          <Stack.Screen
            name="ChangePassword"
            options={{ title: "Change Password" }}
          >
            {(props) => (
              <ProtectedRoute>
                <ChangePasswordScreen
                  {...(props as ChangePasswordScreenProps)}
                />
              </ProtectedRoute>
            )}
          </Stack.Screen>

          <Stack.Screen
            name="Notification"
            options={{
              title: "Notifications",
              headerShown: false,
              presentation: "transparentModal",
              animation: "fade",
              contentStyle: { backgroundColor: "transparent" },
            }}
          >
            {(props) => (
              <ProtectedRoute>
                <NotificationScreen {...(props as NotificationScreenProps)} />
              </ProtectedRoute>
            )}
          </Stack.Screen>

          <Stack.Screen name="AddNote" options={{ title: "Buat Catatan" }}>
            {(props) => (
              <ProtectedRoute>
                <AddNoteScreen {...(props as AddNoteScreenProps)} />
              </ProtectedRoute>
            )}
          </Stack.Screen>

          <Stack.Screen name="EditNote" options={{ title: "Edit Catatan" }}>
            {(props) => (
              <ProtectedRoute>
                <EditNoteScreen {...(props as EditNoteScreenProps)} />
              </ProtectedRoute>
            )}
          </Stack.Screen>
          <Stack.Screen name="AddTodo" options={{ title: "Tambah Todo" }}>
            {(props) => (
              <ProtectedRoute>
                <AddTodoScreen {...(props as AddTodoScreenProps)} />
              </ProtectedRoute>
            )}
          </Stack.Screen>
          <Stack.Screen name="EditTodo" options={{ title: "Edit Todo" }}>
            {(props) => (
              <ProtectedRoute>
                <EditTodoScreen {...(props as EditTodoScreenProps)} />
              </ProtectedRoute>
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
