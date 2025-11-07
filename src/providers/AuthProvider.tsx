import { auth } from "@/config/firebase";
import { AuthContext, AuthContextType } from "@/hooks/useAuth";
import {
	changePassword,
	googleLogin,
	login,
	logout,
	register,
	resetPassword,
	updateUserEmail,
	updateUserProfile,
	uploadAvatar,
} from "@/lib/auth";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

WebBrowser.maybeCompleteAuthSession();

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<AuthContextType["user"]>(null);
	const [loading, setLoading] = useState(true);

	const [, response, promptAsync] = Google.useAuthRequest({
		clientId: process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID,
		webClientId: process.env.EXPO_PUBLIC_FIREBASE_WEB_CLIENT_ID,
	});

	useEffect(() => {
		if (response?.type === "success") {
			const { id_token } = response.params;
			googleLogin(id_token);
		}
	}, [response]);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			setUser(user);
			setLoading(false);
		});
		return unsubscribe;
	}, []);

	const value: AuthContextType = {
		user,
		loading,
		login,
		register,
		googleLogin: async () => {
			await promptAsync();
		},
		logout,
		resetPassword,
		changePassword,
		updateUserProfile,
		updateUserEmail,
		uploadAvatar,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
