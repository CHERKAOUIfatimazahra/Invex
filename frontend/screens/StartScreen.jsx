import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const THEME = {
  colors: {
    primary: "#8DE8CF",
    secondary: "#B7F5AA",
    text: "#FFFFFF",
    textLight: "rgba(255, 255, 255, 0.8)",
    white: "#FFFFFF",
    shadow: "rgba(0, 0, 0, 0.6)",
  },
};

const StartScreen = () => {
  const navigation = useNavigation();

  return (
    <ImageBackground
      source={require("../assets/background.jpg")}
      style={styles.container}
    >
      <View style={styles.darkOverlay} />

      <LinearGradient
        colors={[
          "rgba(141, 232, 207, 0.3)",
          "rgba(183, 245, 170, 0.4)",
        ]}
        style={styles.gradient}
      >
        <StatusBar style="light" />

        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Invex</Text>
            <Text style={styles.subtitle}>
              Gestion de stock intelligente pour votre magasin
            </Text>
          </View>

          {/* Features List */}
          <View style={styles.featuresList}>
            <FeatureItem
              icon="barcode-outline"
              title="Scanner Code-barres"
              description="Identification rapide des produits avec notre scanner intégré"
            />
            <FeatureItem
              icon="time-outline"
              title="Gestion en Temps Réel"
              description="Suivez et modifiez vos stocks instantanément"
            />
            <FeatureItem
              icon="stats-chart-outline"
              title="Statistiques Détaillées"
              description="Analyses et rapports complets de votre inventaire"
            />
          </View>

          {/* Action Button */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={styles.primaryButton}
          >
            <LinearGradient
              colors={[THEME.colors.primary, THEME.colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientButton}
            >
              <Text style={styles.buttonText}>Commencer</Text>
              <Ionicons
                name="arrow-forward"
                size={24}
                color={THEME.colors.text}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

const FeatureItem = ({ icon, title, description }) => (
  <View style={styles.featureItem}>
    <Ionicons
      name={icon}
      size={32}
      color={THEME.colors.white}
      style={styles.featureIcon}
    />
    <View style={styles.featureContent}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: THEME.colors.shadow,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: THEME.colors.white,
    textAlign: "center",
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: THEME.colors.textLight,
    textAlign: "center",
    maxWidth: "80%",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  featuresList: {
    marginBottom: 60,
    gap: 32,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  featureIcon: {
    marginRight: 16,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: THEME.colors.white,
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  featureDescription: {
    fontSize: 16,
    color: THEME.colors.textLight,
    lineHeight: 22,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gradientButton: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  buttonText: {
    color: THEME.colors.text,
    fontSize: 18,
    fontWeight: "600",
  },
});

export default StartScreen;
