import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const StatisticsScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
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
    <View style={styles.mainContainer}>
      <LinearGradient colors={["#8DE8CF", "#B7F5AA"]} style={styles.container}>
        <StatusBar style="dark" />

        <View style={styles.contentContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#2D3748" />
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Statistiques</Text>
              <Text style={styles.subtitle}>Analysez vos données</Text>
            </View>

            <ScrollView style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Ionicons
                  name="cube-outline"
                  size={24}
                  color="#4A5568"
                  style={styles.statIcon}
                />
                <View style={styles.statContent}>
                  <Text style={styles.statTitle}>
                    Nombre total de produits:
                  </Text>
                  <Text style={styles.statValue}>
                    {statistics.totalProducts}
                  </Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <Ionicons
                  name="alert-circle-outline"
                  size={24}
                  color="#4A5568"
                  style={styles.statIcon}
                />
                <View style={styles.statContent}>
                  <Text style={styles.statTitle}>
                    Produits en rupture de stock:
                  </Text>
                  <Text style={styles.statValue}>{statistics.outOfStock}</Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <Ionicons
                  name="cash-outline"
                  size={24}
                  color="#4A5568"
                  style={styles.statIcon}
                />
                <View style={styles.statContent}>
                  <Text style={styles.statTitle}>
                    Valeur totale des stocks:
                  </Text>
                  <Text style={styles.statValue}>
                    {statistics.totalStockValue} €
                  </Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <Ionicons
                  name="arrow-up-outline"
                  size={24}
                  color="#4A5568"
                  style={styles.statIcon}
                />
                <View style={styles.statContent}>
                  <Text style={styles.statTitle}>
                    Produits les plus ajoutés récemment:
                  </Text>
                  <Text style={styles.statValue}>
                    {statistics.mostAddedProducts.length > 0
                      ? statistics.mostAddedProducts.join(", ")
                      : "Aucun"}
                  </Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <Ionicons
                  name="arrow-down-outline"
                  size={24}
                  color="#4A5568"
                  style={styles.statIcon}
                />
                <View style={styles.statContent}>
                  <Text style={styles.statTitle}>
                    Produits les plus retirés récemment:
                  </Text>
                  <Text style={styles.statValue}>
                    {statistics.mostRemovedProducts.length > 0
                      ? statistics.mostRemovedProducts.join(", ")
                      : "Aucun"}
                  </Text>
                </View>
              </View>

              {/* Add some bottom padding for scrolling past the navbar */}
              <View style={{ height: 80 }} />
            </ScrollView>
          </View>
        </View>
      </LinearGradient>

      {/* Bottom Navigation */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Scan")}
        >
          <Ionicons name="barcode-outline" size={24} color="#4A5568" />
          <Text style={[styles.navText, { color: "#4A5568" }]}>Scanner</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Products")}
        >
          <Ionicons name="cube-outline" size={24} color="#4A5568" />
          <Text style={[styles.navText, { color: "#4A5568" }]}>Produits</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Statistics")}
        >
          <Ionicons name="stats-chart-outline" size={24} color="#8DE8CF" />
          <Text style={[styles.navText, { color: "#8DE8CF" }]}>Stats</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("PDF")}
        >
          <Ionicons name="document-text-outline" size={24} color="#4A5568" />
          <Text style={[styles.navText, { color: "#4A5568" }]}>Rapports</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    marginTop: 60,
  },
  content: {
    flex: 1,
    backgroundColor: "#FFFFFF",
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
  header: {
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#4A5568",
  },
  statsContainer: {
    flex: 1,
  },
  statCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 16,
  },
  statIcon: {
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    color: "#4A5568",
  },
  // Navigation bar styles
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

export default StatisticsScreen;
