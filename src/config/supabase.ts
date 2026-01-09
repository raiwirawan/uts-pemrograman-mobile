// prettier-ignore

import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";

// Custom lock with longer timeout to prevent lock acquisition warnings
const customLock = async <R>(name: string, acquireTimeout: number, fn: () => Promise<R>): Promise<R> => {
	return processLock(name, 10000, fn); // 10 second timeout instead of default 0ms
};

export const supabase = createClient(
	process.env.EXPO_PUBLIC_SUPABASE_URL!,
	process.env.EXPO_PUBLIC_SUPABASE_KEY!,
	{
		auth: {
			storage: AsyncStorage,
			autoRefreshToken: true,
			persistSession: true,
			detectSessionInUrl: false,
			lock: customLock,
		},
	}
);
