📌 Lectorium Rosicrucianum — Application Web

Lectorium Rosicrucianum est une plateforme web destinée à digitaliser la gestion des activités et la communication publique de l’association Lectorium Rosicrucianum. Elle permet aux membres de s’inscrire aux activités, de payer en ligne et de suivre leurs inscriptions, tandis que les administrateurs disposent d’un tableau de bord complet pour gérer les activités, les inscriptions et les paiements.


🎯 Objectifs

Offrir une interface web responsive et intuitive pour le public, les membres et les admins.
Digitaliser et automatiser les inscriptions et paiements.
Fournir aux administrateurs un tableau de bord centralisé.
Publier actualités et podcasts pour le public.
Assurer sécurité et conformité RGPD.

👥 Rôles et permissions
| Rôle                             | Accès                                                                  |
| -------------------------------- | ---------------------------------------------------------------------- |
| **Visiteur**                     | Contenu public uniquement (travaux, podcasts, actualités)              |
| **Membre**                       | Inscription et paiement des activités, consultation du tableau de bord |
| **Admin de centre**              | Gestion des activités et inscriptions de leur centre                   |
| **Admin suprême**                | Gestion complète, création/suppression d’autres admins                 |
| **Direction nationale jeunesse** | Reporting et validation selon règles internes                          |



🖥️ Stack Technique
| Côté Frontend                         | Côté Backend                                           |
| ------------------------------------- | ------------------------------------------------------ |
| React.js                              | Node Js(Express)                                       |
| Tailwind CSS                          | PostgreSQL                                             |
| Déploiement : Vercel                  | API REST sécurisée                                     |
| Responsive Desktop & Tablette         | Auth JWT                                               |
| SEO optimisé                          | Intégration paiements : Flutterwave, FedaPay, CinetPay |


🔐 Authentification
- Membres : inscription via email, mot de passe, matricule, niveau/grade, identité complète.
- Connexion : email ou matricule + mot de passe.
- Admins : accès complet selon rôle, avec gestion sécurisée des permissions.
- Export des listes d’inscriptions (CSV/Excel) avec informations : matricule, nom, prénom, niveau/grade, statut paiement.


📋 Fonctionnalités principales

Pour le public :
- Accès aux actualités, travaux et podcasts
- Liste des activités publiques

Pour les membres :
- Inscription et connexion sécurisée
- Tableau de bord : activités inscrites, historique de paiement
- Paiement en ligne via services locaux

Pour les administrateurs :
- Création, modification et clôture des activités
- Gestion des inscriptions et suivi des paiements
- Export CSV/Excel des listes d’inscriptions
- Gestion des rôles et permissions

🌍 Spécificités régionales
- Lancement phase pilote au Bénin
- Montants affichés en Franc CFA (XOF)
- Paiement via Flutterwave, FedaPay et CinetPay

🌐 Déploiement
- Frontend : Vercel (préprod & prod)
- Backend : Render Node Js(Express) & PostgreSQL
- Base de données PostgreSQL managée (Neon)

🛠️ Branchement Git
- frontend : React js & TailwindCSS
- server : backend Node Js(Express) & PostgreSQL

👨‍💻 Équipe de développement
| Nom                              | Rôle     | Email                                                           | Contact       |
| -------------------------------- | -------- | --------------------------------------------------------------- | ------------- |
| SOGLOHOUN Samuel                 | Frontend & Project Manager | [soglohounsamuel2@gmail.com](mailto:soglohounsamuel2@gmail.com) | +229 66015387 |
| FADONOUGBO Ornella Morelle Sessi | Lead Backend  | fadonougboornella@gmail.com                                                    | +229 54244484 |
| SEIDOU Haïdarath                 | Backend  | [haidarath.seidou@epitech.eu](mailto:haidarath.seidou@epitech.eu) | +229 59617762 |


📅 Gestion de projet
- Outil : ClickUp
- Durée : 6 semaines de développement + 1 semaine de tests
- Méthodologie : Agile / Scrum (revues hebdomadaires, sprints d’1 semaine)

📝 Notes

> Ce projet est destiné à un usage interne pour l’association Lectorium Rosicrucianum et n’est pas encore destiné à une diffusion publique.
