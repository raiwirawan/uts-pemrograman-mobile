// types/navigation.ts
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

// === STACK PARAM LIST ===
export type RootStackParamList = {
	Onboarding: undefined;
	Login: undefined;
	Register: undefined;
	ForgotPassword: undefined;
	Home: undefined;
	EditProfile: undefined;
	ChangePassword: undefined;
	Notification: undefined;
};

// === TAB PARAM LIST (BARU!) ===
export type RootTabParamList = {
	Notes: undefined;
	Todo: undefined;
	Profile: undefined;
};

// === STACK SCREEN PROPS ===
export type OnboardingScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"Onboarding"
>;
export type LoginScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"Login"
>;
export type RegisterScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"Register"
>;
export type ForgotPasswordScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"ForgotPassword"
>;
export type HomeScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"Home"
>;
export type EditProfileScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"EditProfile"
>;
export type ChangePasswordScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"ChangePassword"
>;
export type NotificationScreenProps = NativeStackScreenProps<
	RootStackParamList,
	"Notification"
>;

// === TAB SCREEN PROPS (BARU!) ===
export type NotesScreenProps = BottomTabScreenProps<RootTabParamList, "Notes">;
export type TodoListScreenProps = BottomTabScreenProps<
	RootTabParamList,
	"Todo"
>;
export type ProfileScreenProps = BottomTabScreenProps<
	RootTabParamList,
	"Profile"
>;
