# 🎉 Migration Vers React + Vite - INSTRUCTIONS

## ✅ Ce qui a été créé

J'ai créé une nouvelle structure React avec Vite dans `lectorium-frontend/`

### Structure créée :
```
lectorium-frontend/
├── package.json ✅
├── vite.config.js ✅
├── tailwind.config.js ✅
├── postcss.config.js ✅
├── index.html ✅
├── src/
│   ├── main.jsx ✅
│   ├── App.jsx ✅
│   ├── index.css ✅
│   ├── context/
│   │   └── AuthContext.jsx ✅
│   ├── components/
│   │   ├── Navigation.jsx ✅
│   │   └── Footer.jsx ✅
│   └── pages/
│       ├── Home.jsx ✅
│       ├── About.jsx ✅
│       └── Login.jsx ✅
```

## ⏳ Pages à migrer

Il reste à copier et adapter les pages suivantes depuis `my_app/src/app/` :

1. Register.jsx (de adhesion/page.js)
2. Activities.jsx (de activities/page.js)
3. ActivityDetail.jsx (de activities/[id]/page.js)
4. News.jsx (de actualites/page.js)
5. Podcasts.jsx (de podcasts/page.js)
6. Profile.jsx (de members/profil/page.js)
7. AdminDashboard.jsx (de admin/page.js)
8. AdminUsers.jsx (de admin/users/page.js)

## 🔧 Conversion nécessaire

Pour chaque page, convertir :

### Imports
```diff
- import Link from "next/link"
+ import { Link } from "react-router-dom"

- import { useRouter } from "next/navigation"
+ import { useNavigate } from "react-router-dom"

- router.push('/')
+ navigate('/')
```

### Attributs Link
```diff
- <Link href="/about">About</Link>
+ <Link to="/about">About</Link>
```

### Variables env
```diff
- process.env.NEXT_PUBLIC_API_URL
+ import.meta.env.VITE_API_URL
```

### Enlever
- `"use client"` (pas nécessaire dans React pur)
- `export const metadata` (pas utilisé dans SPA)

## 🚀 Installation et démarrage

```bash
cd lectorium-frontend
npm install
```

Créer un fichier `.env` :
```env
VITE_API_URL=http://localhost:8000/api
```

```bash
npm run dev
```

## 📝 Note importante

**Vous avez maintenant 2 frontends** :

1. `my_app/` - Next.js (complet et fonctionnel) ✅
2. `lectorium-frontend/` - React + Vite (en cours de migration) ⏳

Je recommande de **finir la migration des pages** pour avoir une version complète React + Vite, ou de continuer avec Next.js qui fonctionne déjà parfaitement.

Souhaitez-vous que je termine la migration de toutes les pages ?

