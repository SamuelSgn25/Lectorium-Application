//require("dotenv").config();

const xlsx = require("xlsx");
const { Client } = require("pg");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

// 🔐 Connexion Neon
const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_5zPWL8kZmASp@ep-billowing-base-abzflbn4-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: {
    rejectUnauthorized: false, // important pour Neon
  },
});

// 📂 Charger Excel
const workbook = xlsx.readFile("./LISTE POUR APPLICATION LRB.xls");
const sheetName = workbook.SheetNames[0];
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

// 🧹 Nettoyage
const clean = (value) => (value ? String(value).trim() : null);

// 🧠 Import
async function importUsers() {
  try {
    await client.connect();
    console.log("✅ Connecté à Neon");

    for (const row of data) {
      try {
        const nom = clean(row["Nom"]);
        const prenom = clean(row["Prénom"]);
        const centre = clean(row["Centre"]);
        const grade = clean(row["Catégorie/Grade"]);
        const matricule = clean(row["N° International"]);

        // ⚠️ Email généré
        const email = `${prenom || "user"}${nom || ""}${matricule || ""}@lectorium.local`
          .toLowerCase()
          .replace(/\s+/g, "");

        const hashedPassword = await bcrypt.hash("123456", 10);

        const userId = uuidv4();

        await client.query(
          `
          INSERT INTO users (
            id,
            nom,
            prenom,
            email,
            centre,
            grade,
            matricule,
            password,
            status
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
          ON CONFLICT (email) DO UPDATE SET
            nom = EXCLUDED.nom,
            prenom = EXCLUDED.prenom,
            centre = EXCLUDED.centre,
            grade = EXCLUDED.grade,
            matricule = EXCLUDED.matricule
          `,
          [
            userId,
            nom,
            prenom,
            email,
            centre,
            grade,
            matricule,
            hashedPassword,
            "approved",
          ]
        );

        console.log(`✅ ${prenom} ${nom}`);
      } catch (err) {
        console.error("❌ Erreur ligne:", err.message);
      }
    }

    console.log("🎉 Import terminé !");
    await client.end();
  } catch (err) {
    console.error("❌ Erreur connexion:", err.message);
  }
}

importUsers();