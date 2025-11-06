import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
	Alert,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View
} from 'react-native';

const PRIMARY_COLOR = '#673AB7';
const GREY_TEXT = '#757575';

function EditProfileScreen({ navigation }: { navigation: any }) {
	const [fullName, setFullName] = useState('Roberto Plerr');
	const [email, setEmail] = useState('roberto_plerr@gmail.com');

	const onChangeImage = () => {
		Alert.alert('Change Image', 'Image picker not implemented in this demo.');
	};

	const onSave = () => {
		Alert.alert('Saved', 'Your changes have been saved.');
		navigation?.goBack?.();
	};

	return (
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.contentPadding}>
				<View style={styles.centered}>
					<Image
						style={styles.avatar}
						source={{ uri: 'https://i.pravatar.cc/128?img=12' }}
					/>
					<TouchableOpacity style={styles.changeImageBtn} onPress={onChangeImage}>
						<Feather name="edit-3" size={16} color={PRIMARY_COLOR} />
						<Text style={styles.changeImageText}>Change Image</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.divider} />
				<Text style={styles.label}>Full Name</Text>
				<TextInput
					value={fullName}
					onChangeText={setFullName}
					style={styles.input}
					placeholder="Full Name"
					placeholderTextColor="#BDBDBD"
				/>

				<Text style={[styles.label, { marginTop: 16 }]}>Email Address</Text>
				<TextInput
					value={email}
					onChangeText={setEmail}
					autoCapitalize="none"
					keyboardType="email-address"
					style={styles.input}
					placeholder="Email Address"
					placeholderTextColor="#BDBDBD"
				/>

				<Text style={styles.helperText}>
					Changing email address information means you need to re-login to the apps.
				</Text>
			</ScrollView>

			<TouchableOpacity style={styles.saveBtn} onPress={onSave}>
				<Feather name="check" size={18} color="#fff" />
				<Text style={styles.saveBtnText}>Save Changes</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},
	contentPadding: {
		padding: 16,
		paddingBottom: 96,
	},
	centered: {
		alignItems: 'center',
		marginTop: 16,
	},
	avatar: {
		width: 120,
		height: 120,
		borderRadius: 60,
	},
	changeImageBtn: {
		marginTop: 16,
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1.5,
		borderColor: PRIMARY_COLOR,
		borderRadius: 24,
		paddingVertical: 10,
		paddingHorizontal: 14,
	},
	changeImageText: {
		marginLeft: 8,
		color: PRIMARY_COLOR,
		fontWeight: '600',
	},
	divider: {
		height: 1,
		backgroundColor: '#EEEEEE',
		marginVertical: 16,
	},
	label: {
		fontWeight: '600',
		color: '#333',
		marginBottom: 8,
	},
	input: {
		borderWidth: 1,
		borderColor: '#E0E0E0',
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 12,
		fontSize: 16,
		backgroundColor: '#fff',
	},
	helperText: {
		color: GREY_TEXT,
		fontSize: 12,
		marginTop: 6,
	},
	saveBtn: {
		position: 'absolute',
		left: 16,
		right: 16,
		bottom: 16,
		height: 52,
		borderRadius: 26,
		backgroundColor: PRIMARY_COLOR,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
	},
	saveBtnText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
		marginLeft: 10,
	},
});

export default EditProfileScreen;


