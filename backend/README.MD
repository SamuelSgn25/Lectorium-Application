# Backend App
The Node js server for the application


# Organisation Backend files
/backend
│
├── prisma/               ← Schéma et migrations de BDD
│   ├── schema.prisma
│   └── migrations/
│
├── src/
│   ├── controllers/      ← Logique métier
│   ├── routes/           ← Déclaration des routes
│   ├── middlewares/      ← JWT, vérification des rôles, etc.
│   ├── services/         ← Paiement, clôture auto, emails
│   ├── models/           ← (Si logique non-ORM à ajouter)
│   ├── utils/            ← Fonctions utilitaires
│   └── index.ts          ← Point d’entrée (Express)
│
├── .env
├── package.json
└── README.md
