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

## 🧰 Stack technique (prévisionnelle)

| Côté mobile         | Côté serveur               |
|---------------------|----------------------------|
| React Native (CLI)  | Node.js + Express.js       |
| Tailwind CSS        | Prisma ORM + MySQL         |
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
- Choix du mode de paiement
- Administration des activités
- Liste centralisée des inscrits et paiements
- Fermeture automatique des inscriptions à la date prévue

## 📍 Spécificité régionale

- Application ciblée pour un **test au Bénin**
- Intégration avec les API de paiement mobile courantes dans la région
- Affichage des montants en Franc CFA (XOF)

## 🗓️ Statut

- 📐 Cahier des charges rédigé
- 🖌️ Maquettes en cours
- ⚙️ Développement prévu en plusieurs phases

## 👨‍💻 Développeur principal

- Nom : [Ton nom ici]
- Contact : [email ou lien GitHub]

---

> Ce projet est un outil interne pour l'association Lectorium Rosicrucianum et ne vise pas de diffusion publique à ce stade.
