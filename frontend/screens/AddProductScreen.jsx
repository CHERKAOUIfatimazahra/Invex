import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform,
} from "react-native";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { WarehouseContext } from "../Context/WarehouseContext";
import { useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const THEME = {
  colors: {
    primary: "#7B61FF",
    secondary: "#9C8FFF",
    background: "#F8FAFF",
    surface: "#FFFFFF",
    text: "#2D3748",
    textLight: "#FFFFFF",
    gray: "#A0AEC0",
    border: "#E2E8F0",
    error: "#FF6B6B",
    success: "#43E97B",
  },
  gradients: {
    primary: ["#7B61FF", "#9C8FFF"],
    success: ["#43E97B", "#38F9D7"],
  },
};

const AddProductScreen = () => {
  const insets = useSafeAreaInsets();
  const { warehousemanId } = useContext(WarehouseContext);
  const [name, setName] = useState("");
  const [type, setType] = useState("Type1");
  const [price, setPrice] = useState("");
  const [supplier, setSupplier] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [stockQuantity, setStockQuantity] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const navigation = useNavigation();
  const route = useRoute();
  const { barcode } = route.params || {};

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await axios.get("http://172.16.9.161:3000/products");
        const existingWarehouses = new Set();

        response.data.forEach((product) => {
          product.stocks?.forEach((stock) => {
            existingWarehouses.add(
              JSON.stringify({
                id: stock.id,
                name: stock.name,
                localisation: stock.localisation,
              })
            );
          });
        });

        setWarehouses(Array.from(existingWarehouses).map((w) => JSON.parse(w)));
      } catch (error) {
        console.error("Erreur lors de la récupération des entrepôts:", error);
        Alert.alert("Erreur", "Impossible de charger les entrepôts");
      }
    };

    fetchWarehouses();
  }, []);

  const handleSubmit = async () => {
    if (!name || !price || !supplier || !selectedWarehouse || !stockQuantity) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const selectedWarehouseObj = JSON.parse(selectedWarehouse);

    const productData = {
      name,
      type,
      barcode,
      price: parseFloat(price),
      supplier,
      image: "../assets/Invex__1_-removebg-preview.png",
      stocks: [
        {
          id: selectedWarehouseObj.id,
          name: selectedWarehouseObj.name,
          quantity: parseInt(stockQuantity),
          localisation: selectedWarehouseObj.localisation,
        },
      ],
      editedBy: [
        {
          warehousemanId,
          at: new Date().toISOString(),
        },
      ],
    };

    try {
      await axios.post("http://172.16.9.161:3000/products", productData);
      Alert.alert("Succès", "Produit ajouté avec succès !");
      navigation.navigate("Products");
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit:", error);
      Alert.alert("Erreur", "Impossible d'ajouter le produit.");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={THEME.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nouveau Produit</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          {/* Barcode Display */}
          <View style={styles.barcodeContainer}>
            <Ionicons
              name="barcode-outline"
              size={24}
              color={THEME.colors.primary}
            />
            <Text style={styles.barcodeText}>{barcode}</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom du produit</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom du produit"
              value={name}
              onChangeText={setName}
              placeholderTextColor={THEME.colors.gray}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                style={styles.picker}
                selectedValue={type}
                onValueChange={setType}
              >
                <Picker.Item label="Type 1" value="Type1" />
                <Picker.Item label="Type 2" value="Type2" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prix</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00 €"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholderTextColor={THEME.colors.gray}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fournisseur</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom du fournisseur"
              value={supplier}
              onChangeText={setSupplier}
              placeholderTextColor={THEME.colors.gray}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Entrepôt</Text>
            <View style={styles.pickerContainer}>
              <Picker
                style={styles.picker}
                selectedValue={selectedWarehouse}
                onValueChange={setSelectedWarehouse}
              >
                <Picker.Item label="Sélectionner un entrepôt" value={null} />
                {warehouses.map((warehouse, index) => (
                  <Picker.Item
                    key={index}
                    label={`${warehouse.name} (${warehouse.localisation.city})`}
                    value={JSON.stringify(warehouse)}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quantité en stock</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              value={stockQuantity}
              onChangeText={setStockQuantity}
              keyboardType="numeric"
              placeholderTextColor={THEME.colors.gray}
            />
          </View>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={handleSubmit}>
          <LinearGradient
            colors={THEME.gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitButton}
          >
            <Text style={styles.submitButtonText}>Ajouter le produit</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: THEME.colors.text,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  barcodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  barcodeText: {
    marginLeft: 12,
    fontSize: 16,
    color: THEME.colors.text,
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: THEME.colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: THEME.colors.text,
  },
  pickerContainer: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 12,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  bottomContainer: {
    padding: 20,
    backgroundColor: THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  submitButton: {
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  submitButtonText: {
    color: THEME.colors.textLight,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default AddProductScreen;
