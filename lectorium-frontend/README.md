# Lectorium Frontend - React + Vite + TailwindCSS

Version React pure de l'application Lectorium Rosicrucianum Benin.

## 🚀 Installation

```bash
npm install
```

## 📝 Configuration

Créez un fichier `.env` à la racine :

```env
VITE_API_URL=http://localhost:8000/api
```

## 🎯 Développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 🏗️ Build Production

```bash
npm run build
```

Les fichiers seront dans le dossier `dist/`

## 📁 Structure

```
src/
├── components/       # Composants réutilisables
├── context/         # Contexte React (Auth)
├── pages/           # Pages de l'application
│   ├── Home.jsx
│   ├── About.jsx
│   ├── Activities.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Member/
│   └── Admin/
├── App.jsx          # Composant principal
└── main.jsx         # Point d'entrée
```

## 🛠️ Technologies

- React 18
- Vite
- React Router DOM
- TailwindCSS
- Axios
- Lucide Icons

