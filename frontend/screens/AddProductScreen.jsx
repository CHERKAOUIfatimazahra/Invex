import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { WarehouseContext } from "../Context/WarehouseContext";
import { useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// import AsyncStorage, { useAsyncStorage } from "@react-native-async-storage/async-storage";

const AddProductScreen = () => {
  const insets = useSafeAreaInsets();
  const { warehousemanId } = useContext(WarehouseContext);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [supplier, setSupplier] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [stockQuantity, setStockQuantity] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const navigation = useNavigation();
  const route = useRoute();
  const { barcode } = route.params || {};
  // const warehousemanId = useAsyncStorage();

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
        console.error("Erreur:", error);
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
          // warehousemanId: await AsyncStorage.getItem("userToken"),
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
    <LinearGradient colors={["#8DE8CF", "#B7F5AA"]} style={styles.container}>
      <View style={[styles.contentContainer, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2D3748" />
        </TouchableOpacity>

        <Text style={styles.title}>Nouveau Produit</Text>

        <View style={styles.content}>
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formContainer}>
              {/* Barcode Display */}
              <View style={styles.barcodeContainer}>
                <Ionicons name="barcode-outline" size={24} color="#2D3748" />
                <Text style={styles.barcodeText}>{barcode}</Text>
              </View>

              {/* Form Fields */}
              <View style={styles.formSection}>
                <Text style={styles.label}>Nom du produit</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="cube-outline"
                    size={24}
                    color="#4A5568"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Nom du produit"
                    value={name}
                    onChangeText={setName}
                    placeholderTextColor="#4A5568"
                  />
                </View>

                <Text style={styles.label}>Type</Text>
                <View style={styles.pickerContainer}>
                  <Ionicons
                    name="list-outline"
                    size={24}
                    color="#4A5568"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    value={type}
                    onChangeText={setType}
                    placeholder="Entrez le type"
                  />
                </View>

                <Text style={styles.label}>Prix</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="pricetag-outline"
                    size={24}
                    color="#4A5568"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="0.00 DH"
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                    placeholderTextColor="#4A5568"
                  />
                </View>

                <Text style={styles.label}>Fournisseur</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="business-outline"
                    size={24}
                    color="#4A5568"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Nom du fournisseur"
                    value={supplier}
                    onChangeText={setSupplier}
                    placeholderTextColor="#4A5568"
                  />
                </View>

                <Text style={styles.label}>Entrepôt</Text>
                <View style={styles.pickerContainer}>
                  <Ionicons
                    name="home-outline"
                    size={24}
                    color="#4A5568"
                    style={styles.inputIcon}
                  />
                  <Picker
                    style={styles.picker}
                    selectedValue={selectedWarehouse}
                    onValueChange={setSelectedWarehouse}
                  >
                    <Picker.Item
                      label="Sélectionner un entrepôt"
                      value={null}
                    />
                    {warehouses.map((warehouse, index) => (
                      <Picker.Item
                        key={index}
                        label={`${warehouse.name} (${warehouse.localisation.city})`}
                        value={JSON.stringify(warehouse)}
                      />
                    ))}
                  </Picker>
                </View>

                <Text style={styles.label}>Quantité en stock</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="calculator-outline"
                    size={24}
                    color="#4A5568"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    value={stockQuantity}
                    onChangeText={setStockQuantity}
                    keyboardType="numeric"
                    placeholderTextColor="#4A5568"
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Ajouter le produit</Text>
            <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
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
    marginTop: 20,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
    padding: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2D3748",
    marginTop: 60,
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
  },
  scrollView: {
    flex: 1,
    marginBottom: 20,
  },
  formContainer: {
    gap: 20,
  },
  barcodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  barcodeText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#2D3748",
    fontWeight: "500",
  },
  formSection: {
    gap: 16,
  },
  label: {
    fontSize: 16,
    color: "#2D3748",
    marginBottom: 8,
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
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  picker: {
    flex: 1,
    height: 50,
  },
  submitButton: {
    backgroundColor: "#8DE8CF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default AddProductScreen;
