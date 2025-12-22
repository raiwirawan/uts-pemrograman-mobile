import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Colors from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { ProfileScreenProps } from "@/types/navigation";

type SettingItemProps = {
  iconName: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  trailingText?: string;
  onPress: () => void;
  isLogout?: boolean;
};

const SettingItem: React.FC<SettingItemProps> = ({
  iconName,
  title,
  trailingText,
  onPress,
  isLogout = false,
}) => (
  <TouchableOpacity style={styles.listItem} onPress={onPress}>
    <View style={styles.listIconTextContainer}>
      <Ionicons
        name={iconName}
        size={22}
        color={isLogout ? Colors.LOGOUT_RED : Colors.TEXT_DARK}
        style={styles.listIcon}
      />
      <Text style={[styles.listItemTitle, isLogout && styles.logoutText]}>
        {title}
      </Text>
    </View>
    <View style={styles.trailingContainer}>
      {trailingText && <Text style={styles.trailingText}>{trailingText}</Text>}
      {!isLogout && (
        <Ionicons
          name="chevron-forward"
          size={22}
          color={Colors.TEXT_LIGHT_GREY}
        />
      )}
    </View>
  </TouchableOpacity>
);

function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, logout } = useAuth();

  const displayName = user?.displayName || "User";
  const email = user?.email || "email@domain.com";
  const photoURL = user?.photoURL;

  const handleLogout = () => {
    Alert.alert(
      "Keluar",
      "Apakah Anda yakin ingin keluar dari akun?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Keluar",
          style: "destructive",
          onPress: async () => {
            await logout();
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Fallback avatar dengan inisial
  const AvatarFallback = () => (
    <View style={styles.avatarFallback}>
      <Text style={styles.avatarInitials}>
        {displayName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          {photoURL ? (
            <Image source={{ uri: photoURL }} style={styles.avatar} />
          ) : (
            <AvatarFallback />
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <View style={styles.emailContainer}>
              <Ionicons
                name="mail-outline"
                size={16}
                color={Colors.TEXT_GREY}
              />
              <Text style={styles.profileEmail}>{email}</Text>
            </View>
          </View>
        </View>

        {/* Edit Profile Button */}
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate("EditProfile" as never)}
        >
          <Ionicons
            name="create-outline"
            size={20}
            color={Colors.PRIMARY_PURPLE}
          />
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Settings Section */}
        <Text style={styles.sectionTitle}>PENGATURAN</Text>

        <View style={styles.settingsList}>
          <SettingItem
            iconName="lock-closed-outline"
            title="Ubah Password"
            onPress={() => navigation.navigate("ChangePassword" as never)}
          />
          <SettingItem
            iconName="text-outline"
            title="Ukuran Teks"
            trailingText="Sedang"
            onPress={() => {}}
          />
          <SettingItem
            iconName="notifications-outline"
            title="Notifikasi"
            trailingText="Semua aktif"
            onPress={() => navigation.navigate("Notification" as never)}
          />
        </View>

        {/* Logout */}
        <View style={styles.logoutContainer}>
          <SettingItem
            iconName="log-out-outline"
            title="Keluar"
            onPress={handleLogout}
            isLogout={true}
          />
        </View>
      </ScrollView>

      {/* App Version */}
      <Text style={styles.version}>NoteNote</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  scrollContent: {
    padding: 30,
    paddingTop: 60,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: Colors.PRIMARY_PURPLE,
    marginRight: 20,
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.PRIMARY_PURPLE,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
    borderWidth: 4,
    borderColor: Colors.PRIMARY_PURPLE,
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.WHITE,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.DARK_PURPLE,
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  profileEmail: {
    fontSize: 16,
    color: Colors.TEXT_GREY,
    marginLeft: 6,
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: Colors.PRIMARY_PURPLE,
    borderRadius: 30,
    marginBottom: 40,
  },
  editBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.PRIMARY_PURPLE,
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.TEXT_GREY,
    marginBottom: 16,
    letterSpacing: 1,
  },
  settingsList: {
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  listIconTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  listIcon: {
    marginRight: 16,
  },
  listItemTitle: {
    fontSize: 16,
    color: Colors.TEXT_DARK,
  },
  logoutText: {
    color: Colors.LOGOUT_RED,
    fontWeight: "600",
  },
  trailingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  trailingText: {
    fontSize: 14,
    color: Colors.TEXT_GREY,
    marginRight: 8,
  },
  logoutContainer: {
    marginTop: 10,
  },
  version: {
    textAlign: "center",
    color: Colors.TEXT_LIGHT_GREY,
    fontSize: 12,
    paddingVertical: 20,
    fontWeight: "500",
  },
});

export default ProfileScreen;
