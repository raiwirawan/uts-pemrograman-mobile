import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

const PRIMARY_COLOR = '#673AB7';

function NotificationScreen({ navigation }: { navigation: any }){
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);

  const close = () => navigation.goBack?.();

  return (
    <View style={styles.root}>
      <Modal transparent animationType="fade" visible onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close} />
        <View style={styles.sheet}>
          <Pressable style={styles.closeBtn} onPress={close}>
            <Feather name="x" size={16} color="#9E9E9E" />
          </Pressable>

          <View style={styles.row}>
            <Text style={styles.label}>Email Notifications</Text>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: '#E0E0E0', true: '#E1D4FF' }}
              thumbColor={emailEnabled ? PRIMARY_COLOR : '#FAFAFA'}
            />
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Push Notifications</Text>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: '#E0E0E0', true: '#E1D4FF' }}
              thumbColor={pushEnabled ? PRIMARY_COLOR : '#FAFAFA'}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  closeBtn: {
    position: 'absolute',
    right: 12,
    top: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F2',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  label: {
    fontSize: 16,
    color: '#111',
  },
});

export default NotificationScreen;