# État de la Migration React Frontend

## ✅ Complété

- Configuration du projet (package.json, vite, tailwind, etc.)
- Structure de base
- AuthContext.jsx
- Navigation.jsx
- Footer.jsx
- App.jsx avec React Router
- main.jsx

## ⏳ À Créer

### Pages
- [ ] Home.jsx (page d'accueil)
- [ ] About.jsx (à propos)
- [ ] Login.jsx (connexion)
- [ ] Register.jsx (adhésion)
- [ ] Activities.jsx (liste activités)
- [ ] ActivityDetail.jsx (détail activité)
- [ ] News.jsx (actualités)
- [ ] Podcasts.jsx (podcasts)
- [ ] member/Profile.jsx (profil membre)
- [ ] admin/Dashboard.jsx (dashboard admin)
- [ ] admin/Users.jsx (gestion membres)

### Fichiers de configuration
- [ ] .env (variables d'environnement)
- [ ] .eslintrc.json (linting)

## 📝 Instructions

1. Copier le contenu des pages Next.js dans le dossier `my_app/src/app/`
2. Convertir les imports :
   - `import Link from "next/link"` → `import { Link } from "react-router-dom"`
   - `import { useRouter } from "next/navigation"` → `import { useNavigate } from "react-router-dom"`
   - `router.push('/')` → `navigate('/')`
3. Convertir les variables d'environnement :
   - `process.env.NEXT_PUBLIC_API_URL` → `import.meta.env.VITE_API_URL`
4. Enlever les directives `"use client"` (toutes les pages sont client-side)
5. Convertir les fichiers `.js` en `.jsx`
6. Adapter la syntaxe Next.js vers React Router

## 🔄 Exemple de Migration

### Next.js
```jsx
"use client";
import { Link } from "next/link";
import { useRouter } from "next/navigation";

export default function MyPage() {
  const router = useRouter();
  return <Link href="/about">About</Link>;
}
```

### React + Vite
```jsx
import { Link, useNavigate } from "react-router-dom";

export default function MyPage() {
  const navigate = useNavigate();
  return <Link to="/about">About</Link>;
}
```

## ✅ Test

Après création des pages :

```bash
cd lectorium-frontend
npm install
npm run dev
```

