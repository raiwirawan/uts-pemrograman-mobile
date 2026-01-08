import { supabase } from "@/config/supabase";
import { File } from "expo-file-system";

const BUCKET_NAME = "user_images";

/**
 * Extract file path from Supabase public URL
 */
const extractPathFromUrl = (url: string): string | null => {
	try {
		const urlParts = url.split(`${BUCKET_NAME}/`);
		if (urlParts.length < 2) {
			return null;
		}
		return urlParts[1].split("?")[0]; // Remove query params if any
	} catch (error) {
		console.error("Error extracting path from URL:", error);
		return null;
	}
};

/**
 * Check if URL is from Supabase storage
 */
const isSupabaseUrl = (url: string): boolean => {
	return url.includes("supabase") && url.includes(BUCKET_NAME);
};

/**
 * Delete user profile image from Supabase Storage
 * @param imageUrl - Full URL of the image
 */
export const deleteUserImage = async (imageUrl: string): Promise<void> => {
	try {
		// Skip deletion for default avatars or non-Supabase URLs
		if (!imageUrl || !isSupabaseUrl(imageUrl)) {
			console.log("Skipping deletion - not a Supabase image");
			return;
		}

		const filePath = extractPathFromUrl(imageUrl);
		if (!filePath) {
			console.log("Could not extract file path from URL");
			return;
		}

		const { error } = await supabase.storage
			.from(BUCKET_NAME)
			.remove([filePath]);

		if (error) {
			console.error("Error deleting image:", error.message);
			// Don't throw - deletion failure shouldn't block profile update
		} else {
			console.log("Successfully deleted old profile image:", filePath);
		}
	} catch (error: any) {
		console.error("Error in deleteUserImage:", error);
		// Don't throw - deletion failure shouldn't block profile update
	}
};

/**
 * Upload user profile image to Supabase Storage
 * @param userId - User ID for folder organization
 * @param imageUri - Local URI of the image
 * @returns Public URL of uploaded image
 */
export const uploadUserImage = async (
	userId: string,
	imageUri: string
): Promise<string> => {
	try {
		const file = new File(imageUri);
		const arrayBuffer = await file.arrayBuffer();
		const uint8Array = new Uint8Array(arrayBuffer);

		const fileExt = imageUri.split(".").pop() || "jpg";
		const mimeType = `image/${fileExt}`;
		// Use timestamp to ensure unique filename
		const filePath = `${userId}/avatar_${Date.now()}.${fileExt}`;

		const { data, error } = await supabase.storage
			.from(BUCKET_NAME)
			.upload(filePath, uint8Array, {
				contentType: mimeType,
				upsert: false, // Don't overwrite, create new file
			});

		if (error) throw error;

		const { data: urlData } = supabase.storage
			.from(BUCKET_NAME)
			.getPublicUrl(data.path);

		return urlData.publicUrl;
	} catch (error: any) {
		console.error("Upload failed:", error);
		throw new Error(error.message || "Gagal mengupload gambar");
	}
};

/**
 * Update user profile image (delete old, upload new)
 * @param userId - User ID
 * @param oldImageUrl - Previous image URL (to be deleted)
 * @param newImageUri - New local image URI (to be uploaded)
 * @returns New public URL
 */
export const updateUserProfileImage = async (
	userId: string,
	oldImageUrl: string | null,
	newImageUri: string
): Promise<string> => {
	try {
		// 1. Upload new image first
		const newImageUrl = await uploadUserImage(userId, newImageUri);

		// 2. Delete old image after successful upload
		// This order ensures user always has a valid image
		if (oldImageUrl) {
			await deleteUserImage(oldImageUrl);
		}

		return newImageUrl;
	} catch (error: any) {
		console.error("Error updating profile image:", error);
		throw error;
	}
};
