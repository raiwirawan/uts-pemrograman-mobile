import { auth } from "@/config/firebase";
import {
	createUserWithEmailAndPassword,
	EmailAuthProvider,
	GoogleAuthProvider,
	reauthenticateWithCredential,
	sendEmailVerification,
	sendPasswordResetEmail,
	signInWithCredential,
	signInWithEmailAndPassword,
	updateEmail,
	updatePassword,
	updateProfile,
} from "firebase/auth";
import { Alert } from "react-native";
import { updateUserProfileImage } from "./userStorage";

export const login = async (email: string, password: string): Promise<void> => {
	try {
		const userCredential = await signInWithEmailAndPassword(
			auth,
			email.trim(),
			password
		);

		// Check if email is verified
		if (!userCredential.user.emailVerified) {
			await auth.signOut();
			throw new Error(
				"Email belum diverifikasi. Silakan cek email Anda untuk link verifikasi."
			);
		}
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
		const cred = await createUserWithEmailAndPassword(
			auth,
			email.trim(),
			password
		);
		await updateProfile(cred.user, { displayName: fullName });

		// Send email verification
		await sendEmailVerification(cred.user);

		// Sign out user until they verify their email
		await auth.signOut();

		Alert.alert(
			"Verifikasi Email",
			`Link verifikasi telah dikirim ke ${email}. Silakan cek email Anda dan klik link verifikasi sebelum login.`,
			[{ text: "OK" }]
		);
	} catch (err: any) {
		throw new Error(getErrorMessage(err));
	}
};

export const googleLogin = async (idToken: string): Promise<void> => {
	try {
		const credential = GoogleAuthProvider.credential(idToken);
		await signInWithCredential(auth, credential);
	} catch (err: any) {
		throw new Error(getErrorMessage(err));
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
	try {
		const user = auth.currentUser;
		if (!user || !user.email) {
			throw new Error("User tidak ditemukan");
		}

		// Validate new password
		if (newPassword.length < 6) {
			throw new Error("Password baru minimal 6 karakter");
		}

		if (currentPassword === newPassword) {
			throw new Error("Password baru tidak boleh sama dengan password lama");
		}

		// Reauthenticate user
		const credential = EmailAuthProvider.credential(
			user.email,
			currentPassword
		);
		await reauthenticateWithCredential(user, credential);

		// Update password
		await updatePassword(user, newPassword);
	} catch (err: any) {
		throw new Error(getErrorMessage(err));
	}
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
	try {
		const user = auth.currentUser;
		if (!user) throw new Error("User tidak ditemukan");

		// Update email
		await updateEmail(user, newEmail.trim());

		// Send verification email to new address
		await sendEmailVerification(user);

		Alert.alert(
			"Verifikasi Email Baru",
			`Link verifikasi telah dikirim ke ${newEmail}. Silakan verifikasi email baru Anda.`
		);
	} catch (err: any) {
		throw new Error(getErrorMessage(err));
	}
};

/**
 * Upload new avatar and delete old one
 * @param uri - Local URI of new image
 * @returns New public URL
 */
export const uploadAvatar = async (uri: string): Promise<string> => {
	try {
		const user = auth.currentUser;
		if (!user) throw new Error("User tidak ditemukan");

		// Get old photo URL before updating
		const oldPhotoURL = user.photoURL;

		// Upload new image and delete old one
		const newPhotoURL = await updateUserProfileImage(
			user.uid,
			oldPhotoURL,
			uri
		);

		// Update Firebase Auth profile
		await updateProfile(user, { photoURL: newPhotoURL });

		return newPhotoURL;
	} catch (err: any) {
		throw new Error(getErrorMessage(err));
	}
};

export const resendVerificationEmail = async (): Promise<void> => {
	try {
		const user = auth.currentUser;
		if (!user) {
			throw new Error("User tidak ditemukan. Silakan login kembali.");
		}

		if (user.emailVerified) {
			throw new Error("Email sudah terverifikasi");
		}

		await sendEmailVerification(user);
	} catch (err: any) {
		throw new Error(getErrorMessage(err));
	}
};

export const checkEmailVerification = async (): Promise<boolean> => {
	try {
		const user = auth.currentUser;
		if (!user) return false;

		// Reload user to get latest emailVerified status
		await user.reload();
		return user.emailVerified;
	} catch (err: any) {
		console.error("Error checking email verification:", err);
		return false;
	}
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
		case "auth/invalid-email":
			return "Format email tidak valid";
		case "auth/user-disabled":
			return "Akun Anda telah dinonaktifkan";
		case "auth/too-many-requests":
			return "Terlalu banyak percobaan. Silakan coba lagi nanti";
		case "auth/network-request-failed":
			return "Koneksi internet bermasalah";
		case "auth/requires-recent-login":
			return "Silakan login ulang untuk melanjutkan";
		default:
			return err.message || "Terjadi kesalahan";
	}
};
