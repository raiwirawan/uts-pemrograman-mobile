import { User } from "firebase/auth";
import { createContext, useContext } from "react";

export type AuthContextType = {
	user: User | null;
	loading: boolean;
	login: (email: string, password: string) => Promise<void>;
	register: (
		fullName: string,
		email: string,
		password: string
	) => Promise<void>;
	googleLogin: () => Promise<void>;
	logout: () => Promise<void>;
	resetPassword: (email: string) => Promise<void>;
	changePassword: (
		currentPassword: string,
		newPassword: string
	) => Promise<void>;
	updateUserProfile: (updates: {
		displayName?: string;
		photoURL?: string;
	}) => Promise<void>;
	updateUserEmail: (newEmail: string) => Promise<void>;
	uploadAvatar: (uri: string) => Promise<string>;
};

export const AuthContext = createContext<AuthContextType | undefined>(
	undefined
);

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within AuthProvider");
	}
	return context;
};
