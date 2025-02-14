import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import axios from "axios";

const StatisticsScreen = () => {
  const [statistics, setStatistics] = useState({
    totalProducts: 0,
    outOfStock: 0,
    totalStockValue: 0,
    mostAddedProducts: [],
    mostRemovedProducts: [],
  });

  useEffect(() => {
    axios
      .get("http://172.16.9.161:3000/statistics")
      .then((response) => {
        setStatistics(response.data);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des statistiques", error);
      });
  }, []);

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.title}>Statistiques</Text>
      <Text style={styles.subtitle}>Analysez vos données</Text>

      <View style={styles.statCard}>
        <Text style={styles.statTitle}>Nombre total de produits:</Text>
        <Text style={styles.statValue}>{statistics.totalProducts}</Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statTitle}>Produits en rupture de stock:</Text>
        <Text style={styles.statValue}>{statistics.outOfStock}</Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statTitle}>Valeur totale des stocks:</Text>
        <Text style={styles.statValue}>{statistics.totalStockValue} €</Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statTitle}>
          Produits les plus ajoutés récemment:
        </Text>
        <Text style={styles.statValue}>
          {statistics.mostAddedProducts.length > 0
            ? statistics.mostAddedProducts.join(", ")
            : "Aucun"}
        </Text>
      </View>

      <View style={styles.statCard}>
        <Text style={styles.statTitle}>
          Produits les plus retirés récemment:
        </Text>
        <Text style={styles.statValue}>
          {statistics.mostRemovedProducts.length > 0
            ? statistics.mostRemovedProducts.join(", ")
            : "Aucun"}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#666666",
    textAlign: "center",
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  statValue: {
    fontSize: 18,
    color: "#555",
  },
});

export default StatisticsScreen;
