# Lectorium Rosicrucianum - Application Mobile

Lectorium Rosicrucianum est une application mobile développée pour digitaliser la gestion des inscriptions et des paiements liés aux conférences thématiques organisées dans plusieurs centres en Afrique francophone (Bénin, Côte d’Ivoire, RDC, Gabon).

## 🎯 Objectif

Faciliter la participation aux activités de l’association à travers une interface mobile intuitive permettant :
- La consultation du planning des activités
- L’inscription aux conférences
- Le paiement mobile via des services locaux (Flutterwave, FedaPay, CinetPay)
- Le suivi administratif des inscriptions et paiements côté administrateur

## 📱 Plateforme ciblée

- **Version actuelle** : Mobile uniquement (Android)
- **Technologies** : React Native (sans Expo), Tailwind CSS
- **Mode hors-ligne** : Prévu pour permettre la consultation et la préparation d’inscriptions même sans connexion active

## 🧰 Stack technique

| Côté mobile         | Côté serveur               |
|---------------------|----------------------------|
| React Native (CLI)  | Laravel (PHP)              |
| Tailwind CSS        | MySQL (via XAMPP)          |
| Context API / Redux | Authentification JWT       |
| Axios               | Intégration Flutterwave, FedaPay, CinetPay |

## 🔒 Authentification & Rôles

- Compte utilisateur requis pour s’inscrire à une activité
- Rôle administrateur pour la gestion des activités, des inscriptions, et des paiements
- JWT utilisé pour sécuriser les sessions utilisateur

## 🔄 Fonctionnalités principales

- Splash screen, login, inscription
- Accueil avec liste des activités
- Formulaire d’inscription à une activité
- Choix du mode de paiement (Flutterwave, FedaPay, CinetPay)
- Administration des activités
- Liste centralisée des inscrits et paiements
- Fermeture automatique des inscriptions à la date prévue

## 📍 Spécificité régionale

- Application ciblée pour un **test au Bénin**
- Intégration avec les API de paiement mobile courantes dans la région
- Affichage des montants en Franc CFA (XOF)

## 🗓️ Statut

- 📐 Cahier des charges : en cours de modification
- 🖌️ Maquettes : en cours de modification
- ⚙️ Développement : planifié
- 🛠️ Branchement Git :
  - `server` : pour le backend Laravel
  - `mobile-app` : pour l’application mobile React Native

## 👨‍💻 Développeurs

- **SOGLOHOUN Samuel**  
  Contact : soglohounsamuel2@gmail.com

- **FADONOUGBO Ornella Morelle Sessi**  
  Contact : Ornella (à renseigner)

---

> Ce projet est un outil interne pour l'association Lectorium Rosicrucianum et ne vise pas de diffusion publique à ce stade.
