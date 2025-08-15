# 📱 Lectorium Rosicrucianum — Application Mobile & Backend

**Lectorium Rosicrucianum** est un projet visant à digitaliser la gestion des inscriptions et paiements liés aux conférences thématiques organisées dans plusieurs centres en Afrique francophone (Bénin, Côte d’Ivoire, RDC, Gabon).

L’application permettra aux utilisateurs de s’inscrire facilement aux activités, de payer en ligne via les services de paiement mobile locaux et de suivre l’état de leurs inscriptions.  
Les administrateurs auront accès à une interface de gestion complète des activités et des utilisateurs.

---

## 🎯 Objectifs

- Offrir une **interface mobile cross-platform** (Android & iOS) fluide et intuitive
- Digitaliser et automatiser les processus d’inscription et de paiement
- Permettre une **gestion centralisée** des activités pour les administrateurs
- Intégrer des **moyens de paiement mobile locaux** adaptés à l’Afrique de l’Ouest et Centrale
- Garantir un mode **hors-ligne** partiel pour la consultation des activités

---

## 🖥️ Stack Technique

| Côté mobile                   | Côté serveur         |
|--------------------------------|----------------------|
| Flutter (Android & iOS)        | Laravel (PHP)        |
| Tailwind CSS (via package)     | MySQL (XAMPP)        |
| Riverpod / Provider            | Authentification JWT |
| HTTP (Dio / http)              | API REST sécurisée   |
|                                | Intégrations Flutterwave, FedaPay, CinetPay |

---

## 🔐 Authentification & Rôles

- **Utilisateur** : inscription, consultation et participation aux activités
- **Administrateur** : gestion complète des activités, création de nouveaux admins, clôture d’activités
- Authentification sécurisée avec **JWT**

---

## 📋 Fonctionnalités principales

- Splash screen
- Connexion / Inscription utilisateur
- Accueil avec liste des activités
- Formulaire d’inscription à une activité
- Paiement en ligne via services locaux
- Gestion administrative (création/clôture activités, ajout admins)
- Liste des activités inscrites et planifiées
- Interface de planning
- Fermeture automatique des inscriptions à date prévue

---

## 🌍 Spécificité régionale

- Lancement **phase pilote au Bénin**
- Montants affichés en **Franc CFA (XOF)**
- Paiement via **Flutterwave, FedaPay, CinetPay**

---

## 🌐 Hébergement

- **Backend Laravel** : Hébergé sur serveur PHP + MySQL (Hostinger ou OVH)
- **Application mobile** : Publication sur **Google Play Console** et **App Store Connect**

---

## 🛠️ Branchement Git

- `server` : backend Laravel  
- `mobile-app` : application mobile Flutter  

---

## 👨‍💻 Équipe de développement

**SOGLOHOUN Samuel**  
Email : soglohounsamuel2@gmail.com  
Contact : +229 66015387  

**FADONOUGBO Ornella Morelle Sessi**  
Email : Ornella (à renseigner)  
Contact : +229 50084300  

**SEIDOU Haïdarath**  
Email : soglohounsamuel2@gmail.com  
Contact : +229 59617762  

---

## 📅 Gestion de projet

- **Outil** : ClickUp
- **Durée prévisionnelle** : 6 semaines de développement + 1 semaine de tests
- **Méthodologie** : Agile / Scrum (revues hebdomadaires, sprints de 1 semaine)

---

> Ce projet est un outil interne pour l'association Lectorium Rosicrucianum et ne vise pas de diffusion publique à ce stade.
