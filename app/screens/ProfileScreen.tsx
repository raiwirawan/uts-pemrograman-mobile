import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const PRIMARY_COLOR = '#673AB7';
const LOGOUT_COLOR = '#E53935';
const GREY_TEXT = '#757575';

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
        color={isLogout ? LOGOUT_COLOR : '#000'}
        style={styles.listIcon}
      />
      <Text style={[styles.listItemTitle, isLogout && { color: LOGOUT_COLOR }]}>
        {title}
      </Text>
    </View>
    <View style={styles.trailingContainer}>
      {trailingText && <Text style={styles.trailingText}>{trailingText}</Text>}
      {!isLogout && <Icon name="chevron-right" size={20} color="#BDBDBD" />}
      {isLogout && <View style={{ width: 20 }} />}
    </View>
  </TouchableOpacity>
);

function ProfileScreen(){
  const navigation = useNavigation();
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

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentPadding}>
        <View style={styles.profileSection}>
          <Image
            style={styles.avatar}
            source={{ uri: 'https://i.pravatar.cc/128?img=12' }}
          />
          <View>
            <Text style={styles.profileName}>Roberto Plerr</Text>
            <View style={styles.profileEmailContainer}>
              <Icon name="mail" size={14} color={GREY_TEXT} />
              <Text style={styles.profileEmail}>roberto_plerr@gmail.com</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile' as never)}
        >
          <Icon name="edit-3" size={20} color={PRIMARY_COLOR} />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <View style={styles.sectionSpacer} />
        <Text style={styles.settingsHeader}>APP SETTINGS</Text>

        <View style={styles.listContainer}>
          <SettingItem
            iconName="lock"
            title="Change Password"
            onPress={() => navigation.navigate('ChangePassword' as never)}
          />
          <SettingItem
            iconName="type"
            title="Text Size"
            trailingText="Medium"
            onPress={() => {}}
          />
          <SettingItem
            iconName="bell"
            title="Notifications"
            trailingText="All active"
            onPress={() => navigation.navigate('Notifications' as never)}
          />
        </View>

        <View style={styles.sectionSpacer} />
        <SettingItem
          iconName="log-out"
          title="Log Out"
          onPress={handleLogout}
          isLogout={true}
        />
      </ScrollView>
      <Text style={styles.versionText}>Makarya Notes v1.1</Text>
    </View>
  );
}

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
    borderBottomColor: '#F5F5F5',
  },
  listContainer: {},
  listIconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listIcon: {
    marginRight: 15,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  trailingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trailingText: {
    color: GREY_TEXT,
    marginRight: 5,
  },
  versionText: {
    textAlign: 'center',
    color: '#BDBDBD',
    fontSize: 12,
    paddingBottom: 20,
  },
});

export default ProfileScreen;