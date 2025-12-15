import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { storage } from "@/config/firebase";
import colors from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { createNote } from "@/lib/notes";
import { AddNoteScreenProps } from "@/types/navigation";

export default function AddNoteScreen({}: AddNoteScreenProps) {
  const { user } = useAuth();
  const navigation = useNavigation<AddNoteScreenProps["navigation"]>();

  // Hook Izin Kamera
  const [permission, requestPermission] = ImagePicker.useCameraPermissions();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // === BACK HANDLER ===
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      if (!hasChanges || saving) return;
      e.preventDefault();
      Alert.alert(
        "Buang perubahan?",
        "Catatan belum disimpan. Keluar tanpa simpan?",
        [
          { text: "Tetap di sini", style: "cancel" },
          {
            text: "Buang",
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });
    return unsubscribe;
  }, [navigation, hasChanges, saving]);

  // === FUNGSI: AMBIL DARI GALERI ===
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        setHasChanges(true);
      }
    } catch (error) {
      Alert.alert("Error", "Gagal membuka galeri");
    }
  };

  // === FUNGSI BARU: AMBIL DARI KAMERA ===
  const takePhoto = async () => {
    try {
      // 1. Cek & Minta Izin
      if (!permission?.granted) {
        const request = await requestPermission();
        if (!request.granted) {
          Alert.alert("Izin Ditolak", "Anda perlu mengizinkan akses kamera.");
          return;
        }
      }

      // 2. Buka Kamera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
        // aspect: [4, 3], // Opsional: Rasio foto
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        setHasChanges(true);
      }
    } catch (error) {
      Alert.alert("Error", "Gagal membuka kamera");
    }
  };

  // === FUNGSI UPLOAD (HARDCODE BUCKET FIX) ===
  const uploadImage = async (uri: string, userId: string) => {
    try {
      const blob: any = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function (e) {
          console.log("XHR Error:", e);
          reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send(null);
      });

      // HARDCODE URL BUCKET
      const bucketUrl = "gs://notenote-129d8.firebasestorage.app";
      const filename = `notes/${userId}/${Date.now()}.jpg`;
      const storageRef = ref(storage, `${bucketUrl}/${filename}`);

      const metadata = { contentType: "image/jpeg" };
      await uploadBytes(storageRef, blob, metadata);
      blob.close();
      return await getDownloadURL(storageRef);
    } catch (error: any) {
      console.error("Upload error:", error);
      throw new Error(`Gagal upload: ${error.message}`);
    }
  };

  // === SIMPAN CATATAN ===
  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("Error", "Judul dan isi catatan wajib diisi");
      return;
    }
    if (!user?.uid) {
      Alert.alert("Error", "User tidak ditemukan");
      return;
    }

    setSaving(true);
    try {
      let finalImageUrl = null;
      if (imageUri) {
        finalImageUrl = await uploadImage(imageUri, user.uid);
      }
      await createNote(user.uid, title.trim(), content.trim(), finalImageUrl);
      setHasChanges(false);
      navigation.goBack();
    } catch (err: any) {
      Alert.alert("Gagal menyimpan", err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 50}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>Judul</Text>
        <TextInput
          style={styles.titleInput}
          placeholder="Masukkan judul..."
          placeholderTextColor={colors.TEXT_LIGHT_GREY}
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            setHasChanges(true);
          }}
        />

        {/* PREVIEW GAMBAR */}
        {imageUri && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <TouchableOpacity
              style={styles.removeImageBtn}
              onPress={() => {
                setImageUri(null);
                setHasChanges(true);
              }}
            >
              <Ionicons name="close-circle" size={28} color={colors.DANGER} />
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.label}>Isi Catatan</Text>
        <TextInput
          style={styles.contentInput}
          placeholder="Tulis isi catatan di sini..."
          placeholderTextColor={colors.TEXT_LIGHT_GREY}
          value={content}
          onChangeText={(text) => {
            setContent(text);
            setHasChanges(true);
          }}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          {/* TOMBOL 1: KAMERA */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={takePhoto}
            disabled={saving}
          >
            <Ionicons
              name="camera-outline"
              size={24}
              color={colors.PRIMARY_PURPLE}
            />
          </TouchableOpacity>

          {/* TOMBOL 2: GALERI */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={pickImage}
            disabled={saving}
          >
            <Ionicons
              name="image-outline"
              size={24}
              color={colors.PRIMARY_PURPLE}
            />
          </TouchableOpacity>

          {/* TOMBOL 3: SIMPAN */}
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={colors.WHITE} />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color={colors.WHITE} />
                <Text style={styles.saveText}>Simpan</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.WHITE },
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.TEXT_GREY,
    marginBottom: 8,
  },
  titleInput: {
    fontSize: 20,
    fontWeight: "bold",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.DIVIDER,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: colors.CARD_BG,
  },
  imageContainer: { marginBottom: 20, position: "relative" },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    resizeMode: "cover",
    borderWidth: 1,
    borderColor: colors.DIVIDER,
  },
  removeImageBtn: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: colors.WHITE,
    borderRadius: 15,
  },
  contentInput: {
    fontSize: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.DIVIDER,
    borderRadius: 12,
    minHeight: 320,
    backgroundColor: colors.CARD_BG,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.WHITE,
    borderTopWidth: 1,
    borderTopColor: colors.DIVIDER,
    elevation: 8,
    shadowColor: colors.SHADOW,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },

  // Update Style Tombol Icon (Kotak Kecil)
  iconBtn: {
    flex: 0.5,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.CARD_BG,
    borderWidth: 1,
    borderColor: colors.DIVIDER,
  },

  saveBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.FAB_BG,
    gap: 10,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveText: { color: colors.WHITE, fontSize: 16, fontWeight: "600" },
});
