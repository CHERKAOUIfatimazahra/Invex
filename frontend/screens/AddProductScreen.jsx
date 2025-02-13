import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
} from "react-native";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { WarehouseContext } from "../Context/WarehouseContext";
import { useRoute } from "@react-navigation/native";

const AddProductScreen = () => {
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

  // Récupérer la liste des entrepôts depuis db.json
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

  // Fonction pour ajouter un produit
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
      image: "./assets/images/Invex__1_-removebg-preview.png",
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
      const response = await axios.post(
        "http://172.16.9.161:3000/products",
        productData
      );
      navigation.navigate("Products");
      Alert.alert("Succès", "Produit ajouté avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'ajout du produit:", error);
      Alert.alert("Erreur", "Impossible d'ajouter le produit.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Ajouter un Produit</Text>

      <TextInput
        style={styles.input}
        placeholder="Nom"
        value={name}
        onChangeText={setName}
      />

      <Picker
        style={styles.picker}
        selectedValue={type}
        onValueChange={setType}
      >
        <Picker.Item label="Type 1" value="Type1" />
        <Picker.Item label="Type 2" value="Type2" />
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="Prix"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="Fournisseur"
        value={supplier}
        onChangeText={setSupplier}
      />

      <Text style={styles.label}>Sélectionner l'entrepôt:</Text>
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

      <TextInput
        style={styles.input}
        placeholder="Quantité en stock"
        value={stockQuantity}
        onChangeText={setStockQuantity}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Code-barres: {barcode}</Text>

      <Button title="Ajouter" onPress={handleSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  picker: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  label: {
    marginBottom: 5,
    fontWeight: "500",
  },
});

export default AddProductScreen;
