import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Colors from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { RegisterScreenProps } from "@/types/navigation";

function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 1. State untuk Show/Hide Password
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { register, googleLogin } = useAuth();

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert("Error", "Semua field harus diisi");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password minimal 6 karakter");
      return;
    }

    try {
      await register(fullName.trim(), email.trim(), password);
      // Auto redirect otomatis dari AuthContext
    } catch (err: any) {
      Alert.alert("Register Gagal", err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{"Let's Register"}</Text>
        <Text style={styles.subtitle}>And start taking notes</Text>

        {/* Full Name */}
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Example: John Doe"
          placeholderTextColor={Colors.TEXT_LIGHT_GREY}
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />

        {/* Email Address */}
        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Example: johndoe@gmail.com"
          placeholderTextColor={Colors.TEXT_LIGHT_GREY}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Password (DIMODIFIKASI) */}
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="••••••••"
            placeholderTextColor={Colors.TEXT_LIGHT_GREY}
            value={password}
            onChangeText={setPassword}
            // 2. Ubah secureTextEntry berdasarkan state
            secureTextEntry={!isPasswordVisible}
            autoCapitalize="none"
          />
          {/* 3. Tombol Mata */}
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={isPasswordVisible ? "eye-off" : "eye"}
              size={24}
              color={Colors.TEXT_LIGHT_GREY}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
          <Text style={styles.registerText}>Register</Text>
          <Ionicons name="arrow-forward" size={24} color={Colors.WHITE} />
        </TouchableOpacity>

        <Text style={styles.or}>Or</Text>

        <TouchableOpacity style={styles.googleBtn} onPress={googleLogin}>
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginLink}>Login here</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 30,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.DARK_PURPLE,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.TEXT_GREY,
    marginBottom: 40,
  },
  label: {
    fontSize: 16,
    color: Colors.TEXT_DARK,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.INPUT_BORDER,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: Colors.INPUT_BG,
  },
  // --- Style Baru untuk Password ---
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.INPUT_BORDER,
    borderRadius: 12,
    backgroundColor: Colors.INPUT_BG,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.TEXT_DARK,
  },
  eyeIcon: {
    marginLeft: 10,
  },
  // -------------------------------
  registerBtn: {
    backgroundColor: Colors.PRIMARY_PURPLE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 30,
    marginTop: 30,
    gap: 10,
  },
  registerText: {
    color: Colors.WHITE,
    fontSize: 18,
    fontWeight: "600",
  },
  or: {
    textAlign: "center",
    marginVertical: 20,
    color: Colors.TEXT_LIGHT_GREY,
    fontSize: 16,
  },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.GOOGLE_BORDER,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 12,
    backgroundColor: Colors.WHITE,
  },
  googleText: {
    fontSize: 16,
    color: Colors.GOOGLE_TEXT,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  loginText: {
    color: Colors.TEXT_GREY,
  },
  loginLink: {
    color: Colors.DARK_PURPLE,
    fontWeight: "bold",
  },
});

export default RegisterScreen;
