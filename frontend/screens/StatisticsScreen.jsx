import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
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
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalProducts: 0,
    outOfStock: 0,
    totalStockValue: 0,
    mostAddedProducts: [],
    mostRemovedProducts: [],
  });

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://172.16.9.161:3000/statistics")
      .then((response) => {
        setStatistics(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des statistiques", error);
        setLoading(false);
      });
  }, []);

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#8DE8CF" />
      <Text style={styles.loadingText}>Chargement des statistiques...</Text>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      <LinearGradient
        colors={["#8DE8CF", "#B7F5AA"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
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
              <Text style={styles.subtitle}>
                Analysez vos données en temps réel
              </Text>
            </View>

            {loading ? (
              renderLoadingState()
            ) : (
              <ScrollView
                style={styles.statsContainer}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.summaryContainer}>
                  <View style={styles.summaryCard}>
                    <Ionicons name="cube-outline" size={28} color="#8DE8CF" />
                    <Text style={styles.summaryValue}>
                      {statistics.totalProducts}
                    </Text>
                    <Text style={styles.summaryLabel}>Total produits</Text>
                  </View>

                  <View style={styles.summaryCard}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={28}
                      color="#FF9F7A"
                    />
                    <Text style={styles.summaryValue}>
                      {statistics.outOfStock}
                    </Text>
                    <Text style={styles.summaryLabel}>Ruptures</Text>
                  </View>

                  <View style={styles.summaryCard}>
                    <Ionicons name="cash-outline" size={28} color="#6EC6FF" />
                    <Text style={styles.summaryValue}>
                      {statistics.totalStockValue} €
                    </Text>
                    <Text style={styles.summaryLabel}>Valeur stock</Text>
                  </View>
                </View>

                <View style={styles.visualSection}>
                  <Text style={styles.visualTitle}>Aperçu de vos stocks</Text>
                  <View style={styles.progressContainer}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>
                        Utilisation du stock
                      </Text>
                      <Text style={styles.progressValue}>
                        {statistics.totalProducts > 0
                          ? `${(
                              ((statistics.totalProducts -
                                statistics.outOfStock) /
                                statistics.totalProducts) *
                              100
                            ).toFixed(1)}%`
                          : "0%"}
                      </Text>
                    </View>
                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            width: `${
                              statistics.totalProducts > 0
                                ? ((statistics.totalProducts -
                                    statistics.outOfStock) /
                                    statistics.totalProducts) *
                                  100
                                : 0
                            }%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Activité récente</Text>

                  <View style={styles.detailCard}>
                    <View style={styles.detailHeader}>
                      <Ionicons
                        name="arrow-up-outline"
                        size={20}
                        color="#38B2AC"
                      />
                      <Text style={styles.detailTitle}>
                        Produits les plus ajoutés
                      </Text>
                    </View>
                    <View style={styles.productList}>
                      {statistics.mostAddedProducts.length > 0 ? (
                        statistics.mostAddedProducts.map((product, index) => (
                          <View key={index} style={styles.productItem}>
                            <View
                              style={[
                                styles.productDot,
                                { backgroundColor: "#38B2AC" },
                              ]}
                            />
                            <Text style={styles.productName}>{product}</Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.emptyText}>
                          Aucun produit récemment ajouté
                        </Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.detailCard}>
                    <View style={styles.detailHeader}>
                      <Ionicons
                        name="arrow-down-outline"
                        size={20}
                        color="#F56565"
                      />
                      <Text style={styles.detailTitle}>
                        Produits les plus retirés
                      </Text>
                    </View>
                    <View style={styles.productList}>
                      {statistics.mostRemovedProducts.length > 0 ? (
                        statistics.mostRemovedProducts.map((product, index) => (
                          <View key={index} style={styles.productItem}>
                            <View
                              style={[
                                styles.productDot,
                                { backgroundColor: "#F56565" },
                              ]}
                            />
                            <Text style={styles.productName}>{product}</Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.emptyText}>
                          Aucun produit récemment retiré
                        </Text>
                      )}
                    </View>
                  </View>
                </View>

                <View style={styles.infoCard}>
                  <Ionicons
                    name="information-circle-outline"
                    size={22}
                    color="#4A5568"
                    style={styles.infoIcon}
                  />
                  <Text style={styles.infoText}>
                    Les statistiques sont mises à jour quotidiennement. Pour des
                    rapports plus détaillés, consultez la section Rapports.
                  </Text>
                </View>

                <View style={{ height: 80 }} />
              </ScrollView>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* navbar */}
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 20,
    zIndex: 1,
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  header: {
    marginTop: 20,
    marginBottom: 30,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#4A5568",
  },
  statsContainer: {
    flex: 1,
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  summaryCard: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2D3748",
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#718096",
  },
  visualSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  visualTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: "#4A5568",
  },
  progressValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D3748",
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#8DE8CF",
    borderRadius: 4,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 16,
  },
  detailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    marginLeft: 8,
  },
  productList: {
    marginLeft: 4,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  productDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    color: "#4A5568",
  },
  emptyText: {
    fontSize: 14,
    color: "#A0AEC0",
    fontStyle: "italic",
    paddingVertical: 8,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#8DE8CF",
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#4A5568",
    lineHeight: 20,
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
