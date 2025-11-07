import { Text, TouchableOpacity, View } from "react-native";

function NotesButton({ buttonText }: { buttonText: string }) {
	return (
		<View>
			<TouchableOpacity>
				<Text>{buttonText}</Text>
			</TouchableOpacity>
		</View>
	);
}

export default NotesButton;
