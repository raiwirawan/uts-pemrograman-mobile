import React from 'react';
import {
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
// Ikon Feather via Expo (preinstalled & typed)
import { Feather as Icon } from '@expo/vector-icons';

// Warna-warna utama dari desain
const PRIMARY_COLOR = '#673AB7'; // Ungu untuk tombol dan aksen
const LOGOUT_COLOR = '#E53935';  // Merah
const GREY_TEXT = '#757575';     // Abu-abu untuk detail

// --- KOMPONEN ITEM PENGATURAN ---
type SettingItemProps = {
  iconName: React.ComponentProps<typeof Icon>['name'];
  title: string;
  trailingText?: string;
  onPress: () => void;
  isLogout?: boolean;
};

const SettingItem: React.FC<SettingItemProps> = ({ iconName, title, trailingText, onPress, isLogout = false }) => (
  <TouchableOpacity style={styles.listItem} onPress={onPress}>
    <View style={styles.listIconTextContainer}>
      <Icon
        name={iconName}
        size={20}
        color={isLogout ? LOGOUT_COLOR : '#000'} // Warna ikon
        style={styles.listIcon}
      />
      <Text style={[styles.listItemTitle, isLogout && { color: LOGOUT_COLOR }]}>
        {title}
      </Text>
    </View>
    <View style={styles.trailingContainer}>
      {trailingText && <Text style={styles.trailingText}>{trailingText}</Text>}
      {!isLogout && <Icon name="chevron-right" size={20} color="#BDBDBD" />}
      {isLogout && <View style={{ width: 20 }} />} // Placeholder agar Log Out sejajar
    </View>
  </TouchableOpacity>
);

// --- MAIN COMPONENT ---
const SettingsScreen = ({ navigation }: { navigation: any }) => {
  
  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Apakah Anda yakin ingin keluar?",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Ya, Keluar", 
          onPress: () => console.log("User Logged Out"),
          style: "destructive"
        }
      ],
      { cancelable: true }
    );
  };

  const handleAction = (actionName: string) => {
    console.log(`Action: ${actionName}`);
    // Di sini Anda dapat menambahkan logika navigasi atau fungsi lainnya
  };

  return (
    <View style={styles.container}>
      {/* ScrollView agar konten bisa di-scroll jika panjang */}
      <ScrollView contentContainerStyle={styles.contentPadding}>
        
        {/* === BAGIAN PROFIL PENGGUNA === */}
        <View style={styles.profileSection}>
          <View style={styles.avatar} /> 
          <View>
            <Text style={styles.profileName}>Roberto Plerr</Text>
            <View style={styles.profileEmailContainer}>
              <Icon name="mail" size={14} color={GREY_TEXT} />
              <Text style={styles.profileEmail}>roberto_plerr@gmail.com</Text>
            </View>
          </View>
        </View>

        {/* === TOMBOL EDIT PROFIL === */}
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => handleAction('Edit Profile')}
        >
          <Icon name="edit-3" size={20} color={PRIMARY_COLOR} />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <View style={styles.sectionSpacer} />

        {/* === APP SETTINGS === */}
        <Text style={styles.settingsHeader}>APP SETTINGS</Text>
        <View style={styles.listContainer}>
          <SettingItem
            iconName="lock"
            title="Change Password"
            onPress={() => handleAction('Change Password')}
          />
          <SettingItem
            // Ikon 'Aa' (text-fields) dari Feather
            iconName="type" 
            title="Text Size"
            trailingText="Medium"
            onPress={() => handleAction('Text Size')}
          />
          <SettingItem
            iconName="bell"
            title="Notifications"
            trailingText="All active"
            onPress={() => handleAction('Notifications')}
          />
          {/* Divider/pemisah antara item sudah ada di style listItem */}
        </View>

        <View style={styles.sectionSpacer} />
        
        {/* === LOG OUT === */}
        <SettingItem
          iconName="log-out"
          title="Log Out"
          onPress={handleLogout}
          isLogout={true}
        />
        
      </ScrollView>

      {/* === VERSI APLIKASI DI BAWAH === */}
      <Text style={styles.versionText}>Makarya Notes v1.1</Text>
    </View>
  );
};

// --- STYLESHEET ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentPadding: {
    padding: 20,
  },
  sectionSpacer: {
    height: 30,
  },
  
  // Profil
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0E0E0',
    marginRight: 16,
    // Gunakan Image component di sini untuk gambar profil
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileEmailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: GREY_TEXT,
    marginLeft: 4,
  },
  
  // Tombol Edit
  editButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: PRIMARY_COLOR, 
    borderRadius: 25,
  },
  editButtonText: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  
  // Pengaturan
  settingsHeader: {
    color: GREY_TEXT,
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 10,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5', // Pemisah sangat tipis
  },
  listContainer: {
    // container untuk daftar item pengaturan
  },
  listIconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listIcon: {
    marginRight: 15,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500', // Setara dengan medium
  },
  trailingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trailingText: {
    color: GREY_TEXT,
    marginRight: 5,
  },

  // Versi
  versionText: {
    textAlign: 'center',
    color: '#BDBDBD',
    fontSize: 12,
    paddingBottom: 20,
  },
});

export default SettingsScreen;