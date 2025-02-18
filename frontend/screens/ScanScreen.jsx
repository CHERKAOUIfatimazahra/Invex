import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import axios from "axios";

const { width } = Dimensions.get("window");

const ScanScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [barcode, setBarcode] = useState("");
  const [scanned, setScanned] = useState(false);
  const insets = useSafeAreaInsets();

// verification du permision
  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

// verification si le code est scanné
  const handleBarcodeScanned = ({ data }) => {
    if (!scanned) {
      setScanned(true);
      setBarcode(data);
      checkProduct(data);
    }
  };

// verifier si le produit exister ou non
  const checkProduct = async (barcode) => {
    try {
      const response = await axios.get("http://172.16.9.161:3000/products");
      const products = response.data;
      const product = products.find((p) => p.barcode === barcode);

      if (product) {
        navigation.navigate("ProductDetail", { product });
      } else {
        navigation.navigate("AddProduct", { barcode });
      }
    } catch (error) {
      console.error("Erreur de requête API :", error);
    }
  };

// écrit le code manuelement
  const handleValidate = () => {
    if (barcode.trim() === "") {
      Alert.alert("Erreur", "Veuillez entrer un code-barres.");
    } else {
      checkProduct(barcode);
    }
  };

// réinisialisé le code du scan
  const resetScan = () => {
    setBarcode("");
    setScanned(false);
  };

  return (
    <LinearGradient colors={["#8DE8CF", "#B7F5AA"]} style={styles.container}>
      <StatusBar style="dark" />
      <View style={[styles.contentContainer, { paddingTop: insets.top }]}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Scanner</Text>
            <Text style={styles.headerSubtitle}>Scannez vos produits</Text>
          </View>

          {/* Camera Section */}
          <View style={styles.cameraSection}>
            <View style={styles.cameraContainer}>
              <View style={styles.cameraFrame}>
                <CameraView
                  style={styles.camera}
                  facing="back"
                  barcodeScannerSettings={{
                    barcodeTypes: ["qr", "ean13", "ean8", "upc_a", "upc_e"],
                  }}
                  onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                />
                <LinearGradient
                  colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.3)"]}
                  style={styles.cameraOverlay}
                >
                  <View style={styles.scanArea} />
                </LinearGradient>
              </View>
            </View>
          </View>

          {/* Manual Input Section */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Saisie manuelle</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="barcode-outline"
                size={24}
                color="#4A5568"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Entrez le code-barres"
                placeholderTextColor="#4A5568"
                value={barcode}
                onChangeText={setBarcode}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, scanned && styles.buttonScanned]}
              onPress={scanned ? resetScan : handleValidate}
            >
              <Text style={styles.buttonText}>
                {scanned ? "Scanner à nouveau" : "Valider"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* navbar */}
          <View style={[styles.bottomNav, { paddingBottom: insets.bottom }]}>
            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate("Scan")}
            >
              <Ionicons name="barcode-outline" size={24} color="#8DE8CF" />
              <Text style={[styles.navText, { color: "#8DE8CF" }]}>
                Scanner
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate("Products")}
            >
              <Ionicons name="cube-outline" size={24} color="#4A5568" />
              <Text style={[styles.navText, { color: "#4A5568" }]}>
                Produits
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate("Statistics")}
            >
              <Ionicons name="stats-chart-outline" size={24} color="#4A5568" />
              <Text style={[styles.navText, { color: "#4A5568" }]}>Stats</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.navItem}
              onPress={() => navigation.navigate("PDF")}
            >
              <Ionicons
                name="document-text-outline"
                size={24}
                color="#4A5568"
              />
              <Text style={[styles.navText, { color: "#4A5568" }]}>
                Rapports
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 20,
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#4A5568",
  },
  cameraSection: {
    padding: 20,
  },
  cameraContainer: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#8DE8CF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  cameraFrame: {
    height: width * 0.75,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: width * 0.6,
    height: width * 0.3
  },
  inputSection: {
    padding: 20,
    gap: 16,
  },
  inputLabel: {
    fontSize: 16,
    color: "#2D3748",
    fontWeight: "600",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    color: "#2D3748",
    fontSize: 16,
    padding: 12,
  },
  button: {
    backgroundColor: "#8DE8CF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  buttonScanned: {
    backgroundColor: "#B7F5AA",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomNav: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 12,
    paddingHorizontal: 16,
    justifyContent: "space-between",
    marginTop: "auto",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
});

export default ScanScreen;
