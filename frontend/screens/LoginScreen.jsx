import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME = {
  colors: {
    primary: "#8DE8CF",
    secondary: "#B7F5AA",
    text: "#2D3748",
    textLight: "#4A5568",
    white: "#FFFFFF",
    inputBg: "#F7FAFC",
    border: "#E2E8F0",
  },
};

const LoginScreen = ({ setIsLoggedIn }) => {
  const navigation = useNavigation();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  // Vérifie si l'utilisateur est déjà connecté
  const checkLoginStatus = async () => {
    const storedUser = await AsyncStorage.getItem("userToken");
    if (storedUser) {
      setIsLoggedIn(true);
      navigation.replace("MainDashboard");
    }
  };

  // Fonction de connexion
  const handleLogin = async () => {
    if (code.length < 4) {
      Alert.alert(
        "Erreur",
        "Le code secret doit contenir au moins 4 caractères"
      );
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(
      `http://172.16.9.161:3000/warehousemans?secretKey=${code}`
    );
    const data = response.data;

      if (data.length > 0) {
        // Stocke l'utilisateur dans AsyncStorage
        await AsyncStorage.setItem("userToken", JSON.stringify(data[0]));
        setIsLoggedIn(true);
        navigation.replace("MainDashboard");
      } else {
        Alert.alert("Erreur", "Clé secrète incorrecte. Réessayez.");
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[THEME.colors.primary, THEME.colors.secondary]}
      style={styles.container}
    >
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.contentContainer}>
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => navigation.replace("Start")}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={THEME.colors.text} />
          </TouchableOpacity>

          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Connexion</Text>
              <Text style={styles.subtitle}>
                Entrez votre code secret pour accéder à l'application
              </Text>
            </View>

            {/* Login Form */}
            <View style={styles.form}>
              <View>
                <Text style={styles.label}>Code Secret</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="key-outline"
                    size={24}
                    color={THEME.colors.textLight}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Entrez votre code"
                    placeholderTextColor={THEME.colors.textLight}
                    value={code}
                    onChangeText={(text) =>
                      setCode(text.replace(/[^A-Z0-9]/gi, ""))
                    }
                    keyboardType="default"
                    autoCapitalize="characters"
                    secureTextEntry
                    maxLength={10}
                    autoFocus
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading}
                style={styles.loginButton}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? "Connexion..." : "Se connecter"}
                </Text>
                {!isLoading && (
                  <Ionicons
                    name="arrow-forward"
                    size={24}
                    color={THEME.colors.white}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  contentContainer: { flex: 1, marginTop: 60 },
  content: {
    flex: 1,
    backgroundColor: THEME.colors.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 20,
    zIndex: 1,
    padding: 8,
  },
  header: { marginTop: 20, marginBottom: 40 },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: THEME.colors.text,
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: THEME.colors.textLight },
  form: { gap: 32 },
  label: {
    fontSize: 16,
    color: THEME.colors.text,
    marginBottom: 8,
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  inputIcon: { padding: 12 },
  input: { flex: 1, color: THEME.colors.text, fontSize: 18, padding: 12 },
  loginButton: {
    backgroundColor: THEME.colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    elevation: 8,
  },
  buttonText: { color: THEME.colors.white, fontSize: 18, fontWeight: "600" },
});

export default LoginScreen;
