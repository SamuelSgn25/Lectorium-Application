# Backend Lectorium Rosicrucianium

Backend de la plateforme Lectorium Rosicrucianium développé avec Node.js, Express et PostgreSQL.

## Prérequis

- Node.js (v14 ou supérieur)
- PostgreSQL (v12 ou supérieur)
- npm ou yarn

## Installation

1. Cloner le dépôt
2. Installer les dépendances :
   ```bash
   npm install
   ```
3. Copier le fichier `.env.example` vers `.env` et configurer les variables d'environnement :
   ```bash
   cp .env.example .env
   ```
4. Modifier le fichier `.env` avec vos informations de base de données et autres configurations.

## Configuration de la base de données

1. Créer une base de données PostgreSQL :
   ```sql
   CREATE DATABASE lectorium_db;
   ```

2. Exécuter les migrations :
   ```bash
   npx sequelize-cli db:migrate
   ```

3. (Optionnel) Peupler la base de données avec des données initiales :
   ```bash
   node scripts/seedAdmins.js
   ```

## Démarrer le serveur

- Mode développement (avec rechargement automatique) :
  ```bash
  npm run dev
  ```

- Mode production :
  ```bash
  npm start
  ```

Le serveur sera accessible à l'adresse : `http://localhost:5000`

## API Endpoints

### Authentification

- `POST /api/auth/register` - S'inscrire
- `POST /api/auth/login` - Se connecter
- `GET /api/auth/me` - Récupérer le profil de l'utilisateur connecté

### Utilisateurs

- `GET /api/users` - Récupérer tous les utilisateurs (admin)
- `GET /api/users/:id` - Récupérer un utilisateur par son ID
- `PUT /api/users/:id` - Mettre à jour un utilisateur
- `DELETE /api/users/:id` - Supprimer un utilisateur (admin)
- `PATCH /api/users/:id/toggle-status` - Activer/désactiver un utilisateur (admin)
- `PATCH /api/users/:id/role` - Mettre à jour le rôle d'un utilisateur (super_admin)

## Structure du projet

```
backend/
├── src/
│   ├── config/           # Configuration de la base de données
│   ├── controllers/      # Contrôleurs
│   ├── middleware/       # Middlewares personnalisés
│   ├── models/           # Modèles de données
│   ├── routes/           # Définition des routes
│   └── utils/            # Utilitaires
├── migrations/           # Fichiers de migration
├── scripts/              # Scripts utilitaires
├── .env                  # Variables d'environnement
├── .env.example          # Exemple de fichier .env
├── package.json          # Dépendances et scripts
└── README.md             # Ce fichier
```

## Sécurité

- Authentification par JWT
- Hachage des mots de passe avec bcrypt
- Protection contre les attaques CSRF
- Validation des entrées utilisateur
- Gestion des erreurs centralisée

## Licence

Ce projet est sous licence MIT.
