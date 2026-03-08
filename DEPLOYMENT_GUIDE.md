# Guide Ultime de Déploiement - Lectorium Rosicrucianum (Bénin)

## 📌 1. Configuration des E-mails GMAIL (SMTP)
Pour que les envois de mails réels fonctionnent (Mot de passe oublié, Création instantanée des membres par l'Admin), vous devez utiliser un **Mot de passe d'application Google** avec votre compte Gmail privé ou celui de l'école :
1. Allez sur la page de gestion de votre Compte Google > Sécurité.
2. Activez l'**Validation en deux étapes (2FA)**.
3. Cherchez "Mots de passe des applications" dans la barre de recherche des paramètres de sécurité ou descendez sous 2FA.
4. Créez une application nommée "Lectorium App" (ou autre) et copiez le mot de passe de 16 caractères généré (copiez sans espaces).
5. Dans votre `.env` backend, remplissez les informations :
   - `SMTP_USER="votre_adresse_actuelle@gmail.com"`
   - `SMTP_PASS="xxxx xxxx xxxx xxxx"`

## 📌 2. Base de données PostgreSQL (Déploiement CLOUD PRO)
Puisque le backend sera sur Render (qui est un hébergeur Cloud), il est recommandé d'utiliser une base de données Cloud as-a-Service, extrêmement fiable et performante telles que **Neon.tech** ou **Supabase**. Les offres gratuites sont plus que suffisantes.

1. Allez sur [Neon.tech](https://neon.tech) ou [Supabase](https://supabase.com) et créez un projet.
2. Récupérez les identifiants de la base de données : `Host`, `User`, `Password`, `Database Name`.
3. Sur votre interface (Neon dispose d'un éditeur SQL en ligne, Supabase aussi), **copiez/collez l'intégralité du contenu de votre fichier local `backend/init.sql`** et Exécutez-le pour générer les tables (`users`, `activities`, ...).

## 📌 3. Déploiement du Backend (API Node.js sur Render.com)
**[Render.com](https://render.com)** est aujourd'hui l'un des hébergeurs les plus stables et simples pour du Node.js :
1. Assurez-vous d'avoir poussé l'ensemble de votre projet sur un dossier GitHub privé (ou GitLab).
2. Connectez-vous sur Render.
3. Cliquez sur **New > Web Service** et synchronisez votre compte GitHub pour choisir le dépôt du projet Lectorium.
4. **Paramètres de Render :**
   - **Root Directory** : `backend`
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
5. Descendez jusqu'à **Environment Variables** (variables d'environnement) et copiez Y CELLES DE VOTRE `.env` !
   - `DB_USER` : (L'utilisateur donné par Supabase / Neon)
   - `DB_HOST` : (L'Url serveur Supabase / Neon)
   - `DB_NAME` : postgres
   - `DB_PASSWORD` : (Mot de passe DB)
   - `DB_PORT` : 5432
   - `JWT_SECRET` : unCodeTresRobuste1234
   - `SMTP_HOST` : smtp.gmail.com
   - `SMTP_PORT` : 465
   - `SMTP_SECURE` : true
   - `SMTP_USER` : votre-mail@gmail.com
   - `SMTP_PASS` : mot_de_passe_application_google
6. Appuyez sur **Create Web Service**. L'API sera déployée et portera une URL publique (ex: `https://lectorium-api.onrender.com`).

## 📌 4. Déploiement du Frontend (React sur VERCEL)
**[Vercel](https://vercel.com)** est par excellence l'hébergeur idéal pour des sites React Vite.

1. Dans le code du Frontend (vous pouvez le faire avant de commit `backend/index.js` et d'autres fichiers ou juste avant Vercel), pensez à remplacer toute mention d'URL backend `http://localhost:5000` par la nouvelle URL Render fraichement générée `https://lectorium-api.onrender.com`. (Astuce : vous pouvez faire Ctrl+Shift+F sur VSCode pour gagner du temps).
2. Vérifiez que votre code Frontend est bien sur votre GitHub.
3. Allez sur Vercel. Cliquez sur **Add New > Project**, puis importez le dépôt GitHub.
4. Dans **Framework Preset**, Vercel détectera `Vite`.
5. Dans **Root Directory**, sélectionnez le dossier `frontend`.
6. Cliquez sur Déployer. Quelques secondes après, le frontend se lance ! Vous pourrez configurer le nom de domaine `lectorium.bj` ou similaire depuis les réglages Vercel.
