🌐 Lectorium Rosicrucianum — Application Web & Backend

Lectorium Rosicrucianum est une plateforme web visant à digitaliser la communication publique (travaux, actualités, podcasts) et la gestion des activités de l’association, incluant inscriptions et paiements. Elle propose un espace sécurisé pour les membres et une interface complète pour les administrateurs.

🎯 Objectifs

Offrir une interface web fluide et responsive pour le public et les membres

Digitaliser et automatiser les processus d’inscription et de paiement

Permettre une gestion centralisée des activités pour les administrateurs

Publier les actualités et podcasts pour le public

Fournir des listes exportables d’inscriptions avec statut de paiement

🖥️ Stack Technique
Côté Frontend	Côté Backend
React.js + Next.js (SSR/SSG)	Laravel (PHP)
Tailwind CSS	MySQL (XAMPP)
Déploiement : Vercel	Authentification JWT / Sanctum
	API REST sécurisée
	Intégration paiements : Flutterwave, FedaPay, CinetPay
🔐 Authentification & Rôles

Visiteurs : accès aux contenus publics (travaux, podcasts, actualités)

Membres : inscription, consultation et participation aux activités, paiement en ligne, suivi du statut

Admins de centre : gestion des activités et inscriptions de leur centre (Cotonou, Porto-Novo, Natitingou, Lokossa)

Admins suprêmes : Lectorium + développeurs (tous pouvoirs : création/suppression admins, gestion globale)

Direction nationale de la jeunesse : accès limité au reporting et validation selon règles internes

Authentification sécurisée via email ou matricule + mot de passe

📋 Fonctionnalités principales

Accueil public : présentation des activités, travaux et podcasts

Connexion / Inscription membres

Tableau de bord membre : activités inscrites, statut de paiement

Formulaire d’inscription à une activité

Paiement en ligne via services locaux (si activité payante)

Gestion administrative : création/clôture activités, ajout admins, export listes d’inscriptions

Interface de planning et suivi des inscriptions

Clôture automatique des inscriptions à la date prévue

🌍 Spécificités régionales

Phase pilote Bénin

Montants affichés en Franc CFA (XOF)

Paiement via Flutterwave, FedaPay, CinetPay

🌐 Hébergement

Frontend Next.js : déployé sur Vercel

Backend Laravel : hébergé sur serveur PHP + MySQL (Hostinger ou OVH)

🛠️ Branchement Git

server : backend Laravel

web-app : frontend Next.js

👨‍💻 Équipe de développement

SOGLOHOUN Samuel
Email : soglohounsamuel2@gmail.com

Contact : +229 66015387

FADONOUGBO Ornella Morelle Sessi
Email : Ornella (à renseigner)
Contact : +229 50084300

SEIDOU Haïdarath
Email : soglohounsamuel2@gmail.com

Contact : +229 59617762

📅 Gestion de projet

Outil : ClickUp

Durée prévisionnelle : 6 semaines de développement + 1 semaine de tests

Méthodologie : Agile / Scrum (revues hebdomadaires, sprints de 1 semaine)

Ce projet est destiné à un usage interne pour l'association Lectorium Rosicrucianum et n’est pas destiné à une diffusion publique pour l’instant.