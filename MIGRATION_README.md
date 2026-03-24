# Migration vers React.js pur avec Vite

## 📋 Objectif

Créer une version du frontend en **React.js pur** avec **TailwindCSS** en utilisant **Vite** comme outil de build, remplaçant Next.js pour une expérience SPA pure.

## 🎯 Avantages

- ✅ Build plus rapide avec Vite
- ✅ Pas de SSR/SSG, SPA pure
- ✅ Structure plus simple
- ✅ Hot reload ultra-rapide
- ✅ Bundle plus léger
- ✅ Même design et fonctionnalités

## 🔄 Plan de Migration

1. Créer une nouvelle structure avec Vite + React
2. Migrer tous les composants et pages
3. Configurer TailwindCSS
4. Intégrer React Router pour le routing
5. Conserver toutes les fonctionnalités existantes

## 📁 Structure proposée

```
lectorium-frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── Navigation.jsx
│   │   ├── Footer.jsx
│   │   └── ...
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   ├── Activities.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Member/
│   │   │   └── Profile.jsx
│   │   └── Admin/
│   │       ├── Dashboard.jsx
│   │       └── Users.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🚀 Commencer la migration

Suivez les prochaines étapes pour migrer le frontend.

