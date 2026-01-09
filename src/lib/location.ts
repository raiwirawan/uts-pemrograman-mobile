// src/lib/location.ts
import * as Location from "expo-location";
import { Alert } from "react-native";

export interface NoteLocation {
	latitude: number;
	longitude: number;
	address?: string;
	timestamp: number;
}

/**
 * Request location permissions
 */
export const requestLocationPermission = async (): Promise<boolean> => {
	try {
		const { status } = await Location.requestForegroundPermissionsAsync();
		return status === "granted";
	} catch (error) {
		console.error("Error requesting location permission:", error);
		return false;
	}
};

/**
 * Get current location with address
 */
export const getCurrentLocation = async (): Promise<NoteLocation | null> => {
	try {
		// Check if permission is granted
		const hasPermission = await requestLocationPermission();

		if (!hasPermission) {
			Alert.alert(
				"Izin Lokasi Ditolak",
				"Aplikasi memerlukan izin lokasi untuk menambahkan lokasi ke catatan."
			);
			return null;
		}

		// Get current position
		const location = await Location.getCurrentPositionAsync({
			accuracy: Location.Accuracy.Balanced,
		});

		const { latitude, longitude } = location.coords;

		// Try to get address from coordinates
		let address: string | undefined;
		try {
			const [result] = await Location.reverseGeocodeAsync({
				latitude,
				longitude,
			});

			if (result) {
				// Format address
				const parts = [
					result.name,
					result.street,
					result.district,
					result.city,
					result.region,
				].filter(Boolean);

				address = parts.join(", ");
			}
		} catch (error) {
			console.error("Error getting address:", error);
			// Continue without address
		}

		return {
			latitude,
			longitude,
			address,
			timestamp: Date.now(),
		};
	} catch (error: any) {
		console.error("Error getting location:", error);
		Alert.alert("Error", "Gagal mendapatkan lokasi: " + error.message);
		return null;
	}
};

/**
 * Format location for display
 */
export const formatLocation = (location: NoteLocation): string => {
	if (location.address) {
		return location.address;
	}
	return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
};

/**
 * Open location in maps app
 */
export const openInMaps = (location: NoteLocation) => {
	const { latitude, longitude } = location;
	const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

	// You can use Linking from react-native to open the URL
	// import { Linking } from 'react-native';
	// Linking.openURL(url);

	return url;
};
