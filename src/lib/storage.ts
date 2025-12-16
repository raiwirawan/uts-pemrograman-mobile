import { supabase } from "@/config/supabase";
import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";

const BUCKET_NAME = "note_images";

/**
 * Upload image to Supabase Storage
 * @param userId - User ID untuk folder organization
 * @param noteId - Note ID untuk naming
 * @param imageUri - Local URI dari image
 * @returns Public URL of uploaded image
 */
export const uploadNoteImage = async (
	userId: string,
	noteId: string,
	imageUri: string
): Promise<string> => {
	try {
		const file = new File(imageUri);
		const arrayBuffer = await file.arrayBuffer();
		const uint8Array = new Uint8Array(arrayBuffer);

		const fileExt = imageUri.split(".").pop() || "jpg";
		const mimeType = `image/${fileExt}`;
		const filePath = `${userId}/${noteId}_${Date.now()}.${fileExt}`;

		const { data, error } = await supabase.storage
			.from("note_images")
			.upload(filePath, uint8Array, {
				contentType: mimeType,
			});

		if (error) throw error;

		return supabase.storage.from("note_images").getPublicUrl(data.path).data
			.publicUrl;
	} catch (e) {
		console.error("UPLOAD FAILED:", e);
		throw e;
	}
};

/**
 * Delete image from Supabase Storage
 * @param imageUrl - Full URL of the image
 */
export const deleteNoteImage = async (imageUrl: string): Promise<void> => {
	try {
		// Extract path from URL
		const urlParts = imageUrl.split(`${BUCKET_NAME}/`);
		if (urlParts.length < 2) {
			throw new Error("Invalid image URL");
		}
		const filePath = urlParts[1];

		const { error } = await supabase.storage
			.from(BUCKET_NAME)
			.remove([filePath]);

		if (error) {
			throw new Error(`Delete failed: ${error.message}`);
		}
	} catch (error: any) {
		console.error("Error deleting image:", error);
		// Don't throw error, just log it
		// Image deletion failure shouldn't block note deletion
	}
};

/**
 * Pick image from gallery
 */
export const pickImage = async (): Promise<string | null> => {
	try {
		// Request permission
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (status !== "granted") {
			throw new Error("Permission untuk akses galeri ditolak");
		}

		// Launch image picker
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			aspect: [4, 3],
			quality: 0.8, // Compress to reduce size
		});

		if (result.canceled) {
			return null;
		}

		return result.assets[0].uri;
	} catch (error: any) {
		throw new Error(error.message || "Gagal memilih gambar");
	}
};

/**
 * Take photo with camera
 */
export const takePhoto = async (): Promise<string | null> => {
	try {
		// Request permission
		const { status } = await ImagePicker.requestCameraPermissionsAsync();

		if (status !== "granted") {
			throw new Error("Permission untuk akses kamera ditolak");
		}

		// Launch camera
		const result = await ImagePicker.launchCameraAsync({
			allowsEditing: true,
			aspect: [4, 3],
			quality: 0.8,
		});

		if (result.canceled) {
			return null;
		}

		return result.assets[0].uri;
	} catch (error: any) {
		throw new Error(error.message || "Gagal mengambil foto");
	}
};
