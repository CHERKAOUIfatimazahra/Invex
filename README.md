# Invex - Application de Gestion de Stock Mobile

## 📱 Description
Application mobile développée avec React Native + Expo permettant aux magasiniers de gérer efficacement le stock d'un magasin via un scanner de code-barres et une interface intuitive.

## ✨ Fonctionnalités Principales

### 🔐 Authentification
- Système de connexion sécurisé avec code secret personnel
- Gestion des sessions utilisateurs

### 📦 Gestion des Produits
- Scanner de code-barres (via expo-barcode-scanner)
- Saisie manuelle alternative
- Vérification automatique en base de données
- Formulaire d'ajout pour nouveaux produits

### 📋 Liste des Produits
- Vue détaillée : nom, type, prix, quantité
- Indicateurs visuels de stock :
  - 🔴 Rouge : rupture de stock
  - 🟡 Jaune : stock faible (<10 unités)
- Actions rapides :
  - Réapprovisionnement
  - Déchargement

### 🔍 Fonctionnalités Avancées
- Filtrage multi-critères (nom, type, prix, fournisseur)
- Tri dynamique :
  - Prix (croissant/décroissant)
  - Ordre alphabétique
  - Quantité

### 📊 Statistiques
- Nombre total de produits
- Nombre total de villes
- Liste des ruptures de stock
- Valeur totale des stocks
- Historique des mouvements récents

### 💾 Export & Sauvegarde
- Génération de rapports PDF (expo-print)
- Export des données

## 🛠 Technologies Utilisées

### Frontend
- React Native
- Expo

### Backend
- JSON Server (db.json)

### Packages Principaux
```json
{
  "expo-barcode-scanner": "Scanner de codes-barres",
  "expo-camera": "Accès caméra",
  "expo-image-picker": "Sélection d'images",
  "expo-linear-gradient": "Effets visuels",
  "expo-print": "Génération PDF",
  "expo-sharing": "Partage de fichiers",
  "axios": "Requêtes API",
  "react-navigation": "Navigation",
  "@react-native-async-storage/async-storage": "Stockage local"
}
```

## 🚀 Installation

1. **Installation des dépendances**
```bash
npm install
```

2. **Configuration du backend**
```bash
# Installation globale de json-server
npm i -g json-server

# Lancement du serveur
npx json-server db.json
```

3. **Lancement de l'application**

Pour Android :
```bash
npm run android
```

Pour iOS :
```bash
npm run ios
```

Pour Web :
```bash
npm run web
```
