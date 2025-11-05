import { Text, TouchableOpacity, View } from "react-native";

export default function NotesButton({ buttonText }: { buttonText: string }) {
	return (
		<View>
			<TouchableOpacity>
				<Text>{buttonText}</Text>
			</TouchableOpacity>
		</View>
	);
}
