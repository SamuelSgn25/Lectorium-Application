# 🚀 Guide de Démarrage Rapide - Lectorium Application

## 🎯 Vous avez maintenant 2 versions frontend !

Choisissez celle que vous préférez :

---

## Option 1 : Next.js (Recommandé pour SEO) 🌟

### 📁 Fichier : `my_app/`

### Installation
```bash
cd my_app
npm install
```

### Configuration
Créer `my_app/.env.local` :
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Démarrage
```bash
npm run dev
```

**URL** : http://localhost:3000

---

## Option 2 : React + Vite (Recommandé pour Performance) ⚡

### 📁 Fichier : `lectorium-frontend/`

### Installation
```bash
cd lectorium-frontend
npm install
```

### Configuration
Le fichier `.env` existe déjà avec :
```env
VITE_API_URL=http://localhost:8000/api
```

### Démarrage
```bash
npm run dev
```

**URL** : http://localhost:3000

---

## Backend Laravel

### Installation
```bash
cd server
composer install
cp .env.example .env
php artisan key:generate
```

### Configuration PostgreSQL dans `.env` :
```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=lectorium_db
DB_USERNAME=votre_username
DB_PASSWORD=votre_password
```

### Migration
```bash
php artisan migrate
php artisan db:seed
```

### Démarrage
```bash
php artisan serve
```

**URL** : http://localhost:8000

---

## 📊 Comparaison

| Caractéristique | Next.js | React + Vite |
|-----------------|---------|--------------|
| React version | 19 | 18 |
| CSS | TailwindCSS 4 | TailwindCSS 3 |
| Routing | App Router | React Router |
| Build | Next.js | Vite |
| Bundle | ~500KB | ~300KB |
| HMR | Turbopack | Vite HMR |
| SSR | Oui | Non |
| SEO | Excellent | Bon (SPA) |
| Simplicité | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 🎯 Ma Recommandation

**Pour ce projet, utilisez Next.js** (`my_app/`) car :
- ✅ Déjà testé et fonctionnel
- ✅ Excellent SEO
- ✅ Routing simple
- ✅ Déploiement Vercel facile

**React + Vite** est une alternative parfaite si vous préférez une SPA pure !

---

## 🎉 Votre Projet est Prêt !

Les 2 versions frontend sont **complètes et fonctionnelles**.

Bon développement ! 🚀

