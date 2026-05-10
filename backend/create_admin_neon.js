require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const admins = [
  {
    nom: 'SOGLOHOUN',
    prenom: 'Samuel',
    email: 'samuelsgn8@gmail.com',
    password: 'Samuel2004',
    role: 'super_admin'
  },
  {
    nom: 'Lectorium',
    prenom: 'Admin',
    email: 'lectoriumbenin@gmail.com',
    password: 'lectorium2025',
    role: 'admin'
  }
];

const seedNeonAdmins = async () => {
    try {
        console.log("Connecté à la base Neon...");

        for (const admin of admins) {
            // Check if exists
            const existing = await pool.query('SELECT * FROM users WHERE email = $1', [admin.email]);
            
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(admin.password, salt);

            if (existing.rows.length > 0) {
                console.log(`Mise à jour de l'admin existant : ${admin.email}`);
                await pool.query(
                    'UPDATE users SET password = $1, role = $2 WHERE email = $3',
                    [hashedPassword, admin.role, admin.email]
                );
            } else {
                console.log(`Création du nouvel admin : ${admin.email}`);
                await pool.query(
                    `INSERT INTO users (nom, prenom, email, password, role, status)
                     VALUES ($1, $2, $3, $4, $5, 'approved')`,
                    [admin.nom, admin.prenom, admin.email, hashedPassword, admin.role]
                );
            }
        }
        
        console.log("Les identifiants Admin/SuperAdmin ont été ajoutés/mis à jour avec succès sur Neon DB !");
        
    } catch (err) {
        console.error("Erreur lors de la création :", err);
    } finally {
        await pool.end();
        process.exit();
    }
};

seedNeonAdmins();
