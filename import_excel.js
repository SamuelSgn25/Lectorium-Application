const xlsx = require('xlsx');
const path = require('path');
const pg = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: './backend/.env' });

// Database connection
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function importData() {
    const filePath = path.join(__dirname, 'LISTE POUR APPLICATION LRB.xls');
    console.log("Lecture du fichier :", filePath);

    try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        console.log(`${data.length} lignes trouvées dans le fichier Excel.`);

        const saltRounds = 10;
        const defaultPassword = await bcrypt.hash('Lectorium2024!', saltRounds);

        let successCount = 0;
        let errorCount = 0;

        for (const row of data) {
            // Mappe les colonnes Excel aux champs de la DB (ajustez les noms selon votre fichier)
            const nom = row['NOM'] || row['Nom'] || '';
            const prenom = row['PRENOMS'] || row['PRENOM'] || row['Prénom'] || '';
            const matricule = row['MATRICULE'] || row['Matricule'] || '';
            const sexe = row['SEXE'] || row['Sexe'] || '';
            const centre = row['CENTRE'] || row['Centre'] || '';
            const grade = row['ASPECT'] || row['GRADE'] || row['Grade'] || 'Nouveau membre';
            
            // Générer un email unique si manquant
            const email = (row['EMAIL'] || `${matricule.toLowerCase() || Math.random().toString(36).substring(7)}@lectorium.local`).toLowerCase();

            if (!nom || !prenom) {
                console.warn(`Ligne sautée: Nom/Prénom manquant pour ${matricule}`);
                continue;
            }

            try {
                // Upsert based on matricule or email
                await pool.query(`
                    INSERT INTO users (nom, prenom, email, password, matricule, sexe, centre, grade, role, status)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Membre', 'approved')
                    ON CONFLICT (email) DO UPDATE SET
                        nom = EXCLUDED.nom,
                        prenom = EXCLUDED.prenom,
                        matricule = EXCLUDED.matricule,
                        sexe = EXCLUDED.sexe,
                        centre = EXCLUDED.centre,
                        grade = EXCLUDED.grade,
                        status = 'approved'
                `, [nom, prenom, email, defaultPassword, matricule, sexe, centre, grade]);
                
                successCount++;
                if (successCount % 50 === 0) console.log(`${successCount} membres importés...`);
            } catch (err) {
                console.error(`Erreur pour ${nom} ${prenom} (${matricule}):`, err.message);
                errorCount++;
            }
        }

        console.log(`\nImportation terminée !`);
        console.log(`Réussies : ${successCount}`);
        console.log(`Échecs : ${errorCount}`);

    } catch (err) {
        console.error("Erreur fatale lors de l'importation :", err.message);
    } finally {
        await pool.end();
    }
}

importData();
