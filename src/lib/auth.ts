import { auth, storage } from "@/config/firebase";
import {
	createUserWithEmailAndPassword,
	EmailAuthProvider,
	GoogleAuthProvider,
	reauthenticateWithCredential,
	sendPasswordResetEmail,
	signInWithCredential,
	signInWithEmailAndPassword,
	updateEmail,
	updatePassword,
	updateProfile,
} from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Alert } from "react-native";

export const login = async (email: string, password: string): Promise<void> => {
	try {
		await signInWithEmailAndPassword(auth, email.trim(), password);
	} catch (err: any) {
		throw new Error(getErrorMessage(err));
	}
};

export const register = async (
	fullName: string,
	email: string,
	password: string
): Promise<void> => {
	try {
		const cred = await createUserWithEmailAndPassword(auth, email, password);
		await updateProfile(cred.user, { displayName: fullName });
	} catch (err: any) {
		throw new Error(getErrorMessage(err));
	}
};

export const googleLogin = async (idToken: string): Promise<void> => {
	try {
		const credential = GoogleAuthProvider.credential(idToken);
		await signInWithCredential(auth, credential);
	} catch (err: any) {
		Alert.alert("Google Login Gagal", err.message);
	}
};

export const logout = async (): Promise<void> => {
	await auth.signOut();
};

export const resetPassword = async (email: string): Promise<void> => {
	try {
		await sendPasswordResetEmail(auth, email.trim());
	} catch (err: any) {
		throw new Error(getErrorMessage(err));
	}
};

export const changePassword = async (
	currentPassword: string,
	newPassword: string
): Promise<void> => {
	const user = auth.currentUser;
	if (!user || !user.email) throw new Error("User tidak ditemukan");

	const credential = EmailAuthProvider.credential(user.email, currentPassword);
	await reauthenticateWithCredential(user, credential);
	await updatePassword(user, newPassword);
};

export const updateUserProfile = async (updates: {
	displayName?: string;
	photoURL?: string;
}): Promise<void> => {
	const user = auth.currentUser;
	if (!user) throw new Error("User tidak ditemukan");
	await updateProfile(user, updates);
};

export const updateUserEmail = async (newEmail: string): Promise<void> => {
	const user = auth.currentUser;
	if (!user) throw new Error("User tidak ditemukan");
	await updateEmail(user, newEmail);
};

export const uploadAvatar = async (uri: string): Promise<string> => {
	const user = auth.currentUser;
	if (!user) throw new Error("User tidak ditemukan");

	const response = await fetch(uri);
	const blob = await response.blob();
	const storageRef = ref(storage, `avatars/${user.uid}.jpg`);

	await uploadBytes(storageRef, blob);
	const url = await getDownloadURL(storageRef);
	await updateProfile(user, { photoURL: url });
	return url;
};

const getErrorMessage = (err: any): string => {
	switch (err.code) {
		case "auth/invalid-credential":
		case "auth/wrong-password":
			return "Email atau password salah";
		case "auth/user-not-found":
			return "Akun tidak ditemukan";
		case "auth/email-already-in-use":
			return "Email sudah digunakan";
		case "auth/weak-password":
			return "Password terlalu lemah (min 6 karakter)";
		default:
			return err.message || "Terjadi kesalahan";
	}
};
