import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import axios from "axios";

const colors = {
  primary: "#8DE8CF",
  secondary: "#B7F5AA",
  accent: "#7B61FF",
  background: "#F8FAFF",
  text: "#FFFFFF",
  dark: "#2D3748",
  gray: "#A0AEC0",
};

const gradients = {
  scanner: ["#FF6B6B", "#FFA06B"],
  products: ["#4facfe", "#00f2fe"],
  statistics: ["#7B61FF", "#9C8FFF"],
  reports: ["#43E97B", "#38F9D7"],
};

const ScanScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [barcode, setBarcode] = useState("");
  const [scanned, setScanned] = useState(false);

  // Vérifier et demander la permission de la caméra
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  // Fonction pour gérer la détection du code-barres
  const handleBarcodeScanned = ({ data }) => {
    if (!scanned) {
      setScanned(true);
      setBarcode(data);
      checkProduct(data);
    }
  };

  // Fonction pour vérifier si le produit existe dans la base de données
  const checkProduct = async (barcode) => {
    try {
      const response = await axios.get("http://172.16.9.161:3000/products");
      const products = response.data;

      // Chercher le produit correspondant au barcode
      const product = products.find((p) => p.barcode === barcode);

      if (product) {
        navigation.navigate("ProductDetail", { product });
      } else {
        navigation.navigate("AddProduct", { barcode });
      }
    } catch (error) {
      console.error("Erreur de requête API :", error);
      Alert.alert("Erreur", "Impossible de récupérer les données du produit.");
    }
  };

  // Fonction pour gérer la validation du code-barres saisi manuellement
  const handleValidate = () => {
    if (barcode.trim() === "") {
      Alert.alert("Veuillez entrer un code-barres.");
    } else {
      checkProduct(barcode);
    }
  };

  // Fonction pour réinitialiser le scan
  const resetScan = () => {
    setBarcode("");
    setScanned(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* HEADER */}
      <Text style={styles.title}>Scanner de Code-barres</Text>

      {/* CAMERA */}
      <LinearGradient colors={gradients.scanner} style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "ean13", "ean8", "upc_a", "upc_e"],
          }}
          onBarcodeScanned={handleBarcodeScanned}
        />
      </LinearGradient>

      {/* SCAN MANUEL */}
      <Text style={styles.subtitle}>Ou entrez le code manuellement :</Text>
      <TextInput
        style={styles.input}
        placeholder="Saisir le code-barres"
        placeholderTextColor={colors.gray}
        value={barcode}
        onChangeText={setBarcode}
        keyboardType="numeric"
      />

      {/* BUTTONS */}
      <TouchableOpacity style={styles.button} onPress={handleValidate}>
        <Text style={styles.buttonText}>Valider</Text>
      </TouchableOpacity>

      {/* BUTTON POUR RE-INITIER UN SCAN */}
      {scanned && (
        <TouchableOpacity style={styles.button} onPress={resetScan}>
          <Text style={styles.buttonText}>Scanner un autre produit</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 20,
  },
  cameraContainer: {
    width: "100%",
    height: 300,
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 20,
  },
  camera: {
    flex: 1,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "500",
    color: colors.dark,
    marginBottom: 10,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  button: {
    width: "100%",
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
});

export default ScanScreen;
