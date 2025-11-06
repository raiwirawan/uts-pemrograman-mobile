import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const PRIMARY_COLOR = '#673AB7';
const GREY_TEXT = '#757575';

function ChangePasswordScreen({ navigation }: { navigation: any }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Incomplete', 'Please fill in all fields.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New passwords do not match.');
      return;
    }
    Alert.alert('Success', 'Your password has been updated.', [{ text: 'OK', onPress: () => navigation.goBack?.() }]);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentPadding}>
        <Text style={styles.sectionHint}>Please input your current password first</Text>

        <Text style={styles.label}>Current Password</Text>
        <TextInput
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          placeholder="********"
          placeholderTextColor="#BDBDBD"
          style={styles.input}
        />

        <View style={styles.divider} />

        <Text style={styles.sectionHint}>Now, create your new password</Text>

        <Text style={styles.label}>New Password</Text>
        <TextInput
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholder="********"
          placeholderTextColor="#BDBDBD"
          style={styles.input}
        />
        <Text style={styles.helperText}>Password should contain a-z, A-Z, 0-9</Text>

        <Text style={[styles.label, { marginTop: 16 }]}>Retype New Password</Text>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="********"
          placeholderTextColor="#BDBDBD"
          style={styles.input}
        />
      </ScrollView>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit New Password</Text>
        <Feather name="arrow-right" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentPadding: {
    padding: 16,
    paddingBottom: 96,
  },
  sectionHint: {
    color: PRIMARY_COLOR,
    fontSize: 12,
    marginBottom: 8,
  },
  label: {
    color: '#111',
    fontWeight: '600',
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
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 16,
  },
  submitBtn: {
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
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginRight: 10,
  },
});

export default ChangePasswordScreen;