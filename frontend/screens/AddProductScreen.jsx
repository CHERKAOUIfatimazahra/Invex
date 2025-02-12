import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";


const AddProductScreen = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState("Type1");
  const [price, setPrice] = useState("");
  const [supplier, setSupplier] = useState("");
  const [quantity, setQuantity] = useState("");
  const [warehousemanId, setWarehousemanId] = useState("");
  const navigation = useNavigation();

  // Récupérer warehousemanId
  useEffect(() => {
    const getUserData = async () => {
      const userData = await AsyncStorage.getItem("userToken");
      if (userData) {
        const parsedData = JSON.parse(userData);
        setWarehousemanId(parsedData.warehousemanId);
        console.log("warehousemanId:", parsedData.warehousemanId);
      }
    };
    getUserData();
  }, []);

  const handleSubmit = async () => {
    if (!name || !price || !supplier) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const productData = {
      name,
      type,
      price: parseFloat(price),
      supplier,
      quantity: parseInt(quantity) || 0,
      warehousemanId : warehousemanId,
    };

    try {
      const response = await axios.post(
        "http://172.16.9.161:3000/products",
        productData
      );
      console.log("Produit ajouté:", response.data);
      navigation.goBack();
      Alert.alert("Succès", "Produit ajouté avec succès !");

    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      Alert.alert("Erreur", "Impossible d'ajouter le produit.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajouter un Produit</Text>

      <TextInput
        style={styles.input}
        placeholder="Nom du produit"
        value={name}
        onChangeText={setName}
      />

      <Picker selectedValue={type} onValueChange={setType} style={styles.input}>
        <Picker.Item label="Type 1" value="Type1" />
        <Picker.Item label="Type 2" value="Type2" />
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="Prix"
        keyboardType="numeric"
        value={price}
        onChangeText={setPrice}
      />

      <TextInput
        style={styles.input}
        placeholder="Fournisseur"
        value={supplier}
        onChangeText={setSupplier}
      />

      <TextInput
        style={styles.input}
        placeholder="Quantité initiale"
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
      />

      <Button title="Ajouter le produit" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
});

export default AddProductScreen;