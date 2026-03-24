# Guide d'Installation - Lectorium Application

## 📋 Prérequis

### Pour le Frontend
- Node.js >= 18
- npm ou yarn

### Pour le Backend
- PHP >= 8.1
- Composer
- PostgreSQL >= 13

## 🚀 Installation

### 1. Backend (Laravel)

```bash
# Naviguer vers le dossier server
cd server

# Installer les dépendances Composer
composer install

# Copier le fichier d'environnement
cp .env.example .env

# Générer la clé d'application
php artisan key:generate

# Configurer la base de données dans .env
# Définir:
# DB_CONNECTION=pgsql
# DB_HOST=127.0.0.1
# DB_PORT=5432
# DB_DATABASE=lectorium_db
# DB_USERNAME=votre_username
# DB_PASSWORD=votre_password

# Créer la base de données PostgreSQL
createdb lectorium_db

# Exécuter les migrations
php artisan migrate

# Créer des données de test (optionnel)
php artisan db:seed

# Démarrer le serveur de développement
php artisan serve
```

Le backend sera disponible sur: `http://localhost:8000`

### 2. Frontend (Next.js)

```bash
# Naviguer vers le dossier my_app
cd my_app

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env.local

# Configurer l'API URL dans .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Démarrer le serveur de développement
npm run dev
```

Le frontend sera disponible sur: `http://localhost:3000`

## 🔧 Configuration

### Variables d'environnement Backend (.env)

```env
APP_NAME="Lectorium Rosicrucianum"
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=lectorium_db
DB_USERNAME=postgres
DB_PASSWORD=

# JWT Configuration (optionnel si Sanctum suffit)
SANCTUM_STATEFUL_DOMAINS=localhost:3000

# Paiements (à configurer avec vos clés)
FLUTTERWAVE_PUBLIC_KEY=
FLUTTERWAVE_SECRET_KEY=
FEDAPAY_PUBLIC_KEY=
FEDAPAY_SECRET_KEY=
CINETPAY_API_KEY=
CINETPAY_SITE_ID=
```

### Variables d'environnement Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 👤 Création d'un utilisateur Admin

Pour créer le premier utilisateur admin, exécutez:

```bash
php artisan tinker
```

Puis dans tinker:

```php
$user = User::create([
    'first_name' => 'Admin',
    'last_name' => 'Lectorium',
    'email' => 'admin@lectorium-benin.org',
    'password' => Hash::make('votre_mot_de_passe'),
    'role' => 'super_admin',
    'status' => 1,
    'is_active' => true,
]);
```

## 🧪 Tests

### Backend

```bash
php artisan test
```

### Frontend

```bash
npm run test
```

## 📦 Build de Production

### Backend

```bash
# Optimiser pour production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Déployer sur serveur
```

### Frontend

```bash
# Build de production
npm run build

# Déployer sur Vercel
vercel --prod
```

## 🌐 Déploiement

### Frontend (Vercel)

1. Connecter le repository GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer automatiquement sur chaque push

### Backend (Hostinger/OVH)

1. Uploader les fichiers via FTP/SSH
2. Configurer la base de données PostgreSQL
3. Configurer le fichier .env de production
4. Exécuter les migrations
5. Configurer le cron pour les tâches

## 📝 Notes importantes

- Assurez-vous que CORS est configuré pour permettre les requêtes depuis le frontend
- Les tokens JWT expirent après 60 minutes par défaut
- Les exports CSV nécessitent les dépendances `xlsx` et `csv-export`
- Les paiements nécessitent des clés API des différents providers

## 🆘 Dépannage

### Erreur de connexion à la base de données
- Vérifiez que PostgreSQL est démarré
- Vérifiez les credentials dans .env
- Vérifiez que la base de données existe

### Erreur CORS
- Ajoutez le domaine frontend dans `config/cors.php`
- Vérifiez les headers dans les requêtes

### Erreur d'authentification
- Vérifiez que les tokens sont bien envoyés
- Vérifiez l'expiration des tokens
- Vérifiez la configuration Sanctum

## 📚 Documentation API

L'API est documentée dans `server/README.md`

## 👥 Support

Pour toute question ou problème:
- Email: soglohounsamuel2@gmail.com
- Téléphone: +229 66015387

