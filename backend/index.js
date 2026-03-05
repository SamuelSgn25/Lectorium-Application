const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE !== 'false',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const db = require('./db');
const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

const auth = (roles = []) => {
    return (req, res, next) => {
        try {
            const token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;

            if (roles.length > 0 && !roles.includes(decoded.role)) {
                return res.status(403).json({ message: "Accès refusé" });
            }
            next();
        } catch (err) {
            res.status(401).json({ message: "Non authentifié" });
        }
    };
};

// ----------------- AUTHENTICATION & ADHÉSION -----------------
app.post('/api/register', async (req, res) => {
    try {
        const {
            nom, nom_jeune_fille, prenom, date_naissance, lieu_naissance,
            nationalite, adresse, email, telephone_whatsapp, telephone_autre,
            etat_civil, profession, aptitudes, nombre_enfants, motivation_adhesion,
            password
        } = req.body;

        const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "Cet email existe déjà" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await db.query(
            `INSERT INTO users (
        nom, nom_jeune_fille, prenom, date_naissance, lieu_naissance, 
        nationalite, adresse, email, telephone_whatsapp, telephone_autre, 
        etat_civil, profession, aptitudes, nombre_enfants, motivation_adhesion, 
        password, role, status, grade
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'Membre', 'pending', 'Nouveau membre') RETURNING id`,
            [
                nom, nom_jeune_fille, prenom, date_naissance || null, lieu_naissance,
                nationalite, adresse, email, telephone_whatsapp, telephone_autre,
                etat_civil, profession, aptitudes, nombre_enfants || 0, motivation_adhesion,
                hashedPassword
            ]
        );

        if (process.env.SMTP_USER) {
            try {
                await transporter.sendMail({
                    from: `"Lectorium Rosicrucianum" <${process.env.SMTP_USER}>`,
                    to: email,
                    subject: "Confirmation de votre demande d'adhésion",
                    html: `
                        <h2 style="color: #b89047;">Demande d'adhésion reçue</h2>
                        <p>Bonjour ${prenom} ${nom},</p>
                        <p>Nous vous remercions et vous confirmons la bonne réception de votre demande d'adhésion.</p>
                        <p>Le secrétariat du Lectorium Rosicrucianum va examiner votre demande. Vous recevrez un nouvel e-mail dès qu'un administrateur aura statué sur votre compte.</p>
                    `
                });
            } catch (mailErr) { console.error("Erreur email", mailErr); }
        }

        res.status(201).json({ message: "Demande d'adhésion soumise avec succès", id: newUser.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const userQuery = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userQuery.rows.length === 0) {
            return res.status(400).json({ message: "Identifiants incorrects" });
        }

        const user = userQuery.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Identifiants incorrects" });
        }

        if (user.status === 'pending') {
            return res.status(403).json({ message: "Votre demande d'adhésion est en attente de validation par un administrateur." });
        }
        if (user.status === 'rejected') {
            return res.status(403).json({ message: "Votre demande d'adhésion a été refusée." });
        }

        const token = jwt.sign({ id: user.id, role: user.role, status: user.status }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

app.post('/api/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const userQuery = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userQuery.rows.length === 0) {
            return res.status(404).json({ message: "Aucun compte n'est associé à cette adresse email." });
        }

        const user = userQuery.rows[0];

        // Generate temporary 8-char password
        const tempPassword = Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);

        await db.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);

        if (process.env.SMTP_USER) {
            await transporter.sendMail({
                from: `"Lectorium Rosicrucianum" <${process.env.SMTP_USER}>`,
                to: email,
                subject: "Réinitialisation de votre mot de passe",
                html: `
                    <h2 style="color: #b89047;">Mot de passe oublié</h2>
                    <p>Bonjour ${user.prenom} ${user.nom},</p>
                    <p>Votre mot de passe a bien été réinitialisé. Voici votre mot de passe temporaire :</p>
                    <div style="font-size: 20px; font-weight: bold; background: #fdfbf7; padding: 15px; border: 1px solid #b89047; display: inline-block; margin: 10px 0;">
                        ${tempPassword}
                    </div>
                    <p>Connectez-vous dès à présent avec ce nouveau mot de passe sur la plateforme.</p>
                `
            });
            res.json({ message: "Un nouveau mot de passe a été envoyé à votre adresse email." });
        } else {
            res.status(500).json({ message: "Le service d'email n'est pas configuré sur le serveur." });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de la réinitialisation" });
    }
});

app.get('/api/users/me', auth(), async (req, res) => {
    try {
        const u = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
        if (u.rows.length === 0) return res.status(404).json({ message: "User not found" });
        res.json(u.rows[0]);
    } catch (err) { res.status(500).json({ message: "Erreur" }); }
});

// Update Profile
app.put('/api/users/me', auth(), async (req, res) => {
    try {
        const { email_notifications, sms_notifications, adresse, telephone_whatsapp, telephone_autre, profession } = req.body;
        await db.query(`UPDATE users SET 
      email_notifications = $1, sms_notifications = $2, adresse = $3, 
      telephone_whatsapp = $4, telephone_autre = $5, profession = $6 
      WHERE id = $7`,
            [email_notifications, sms_notifications, adresse, telephone_whatsapp, telephone_autre, profession, req.user.id]
        );
        res.json({ message: "Profil mis à jour" });
    } catch (err) { res.status(500).json({ message: "Erreur" }); }
});

// ----------------- USERS ADMIN -----------------
app.post('/api/users', auth(['Admin']), async (req, res) => {
    try {
        const { nom, prenom, email, role, password } = req.body;
        const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) return res.status(400).json({ message: "Cet email existe déjà" });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await db.query(
            `INSERT INTO users (nom, prenom, email, role, status, grade, password) VALUES ($1, $2, $3, $4, 'approved', 'Nouveau membre', $5)`,
            [nom, prenom, email, role, hashedPassword]
        );

        if (process.env.SMTP_USER) {
            try {
                await transporter.sendMail({
                    from: `"Lectorium Rosicrucianum" <${process.env.SMTP_USER}>`,
                    to: email,
                    subject: "Votre accès au Lectorium Rosicrucianum",
                    html: `
                        <h2 style="color: #b89047;">Bienvenue !</h2>
                        <p>Bonjour ${prenom} ${nom},</p>
                        <p>Un profil vient d'être généré pour vous sur la plateforme du Lectorium Rosicrucianum.</p>
                        <ul>
                            <li><strong>Rôle :</strong> ${role}</li>
                            <li><strong>Adresse Email :</strong> ${email}</li>
                            <li><strong>Mot de passe :</strong> ${password}</li>
                        </ul>
                        <p>Vous pouvez dès à présent vous connecter via la page d'accueil de la plateforme.</p>
                    `
                });
            } catch (mailErr) {
                console.error("Erreur envoi email :", mailErr);
            }
        }

        res.status(201).json({ message: "Utilisateur créé avec succès" });
    } catch (err) { res.status(500).json({ message: "Erreur serveur" }); }
});

app.get('/api/users', auth(['Admin']), async (req, res) => {
    try {
        const u = await db.query('SELECT id, nom, prenom, email, role, status, grade, telephone_whatsapp, created_at FROM users ORDER BY created_at DESC');
        res.json(u.rows);
    } catch (err) {
        res.status(500).json({ message: "Erreur" });
    }
});

// Validation Adhesion
app.put('/api/users/:id/status', auth(['Admin']), async (req, res) => {
    try {
        const { status } = req.body;
        await db.query('UPDATE users SET status = $1 WHERE id = $2', [status, req.params.id]);

        if (status === 'approved' && process.env.SMTP_USER) {
            const uQuery = await db.query('SELECT nom, prenom, email FROM users WHERE id = $1', [req.params.id]);
            if (uQuery.rows.length > 0) {
                const u = uQuery.rows[0];
                try {
                    await transporter.sendMail({
                        from: `"Lectorium Rosicrucianum" <${process.env.SMTP_USER}>`,
                        to: u.email,
                        subject: "Votre adhésion est confirmée",
                        html: `
                            <h2 style="color: #b89047;">Adhésion Validée !</h2>
                            <p>Bonjour ${u.prenom} ${u.nom},</p>
                            <p>Nous avons le plaisir de vous annoncer que votre compte a été créé et activé par l'administration.</p>
                            <p>Vous pouvez dès à présent vous connecter sur la plateforme avec les identifiants que vous aviez fournis :</p>
                            <ul>
                                <li><strong>Adresse Email :</strong> ${u.email}</li>
                                <li><strong>Mot de passe :</strong> <i>(Le mot de passe confidentiel que vous avez soumis dans le formulaire d'adhésion)</i></li>
                            </ul>
                        `
                    });
                } catch (mailErr) { console.error("Erreur email d'approbation", mailErr); }
            }
        }

        res.json({ message: "Statut mis à jour" });
    } catch (err) {
        res.status(500).json({ message: "Erreur" });
    }
});

// Edit role / grade
app.put('/api/users/:id/role', auth(['Admin']), async (req, res) => {
    try {
        const { role, grade } = req.body;
        await db.query('UPDATE users SET role = $1, grade = $2 WHERE id = $3', [role, grade, req.params.id]);
        res.json({ message: "Rôle/Grade mis à jour" });
    } catch (err) {
        res.status(500).json({ message: "Erreur" });
    }
});

app.delete('/api/users/:id', auth(['Admin']), async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.json({ message: "Utilisateur supprimé" });
    } catch (err) {
        res.status(500).json({ message: "Erreur" });
    }
});

// ----------------- ACTIVITIES -----------------
app.get('/api/activities', async (req, res) => {
    try {
        const activitiesQuery = await db.query('SELECT * FROM activities ORDER BY date_start DESC');
        res.json(activitiesQuery.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

app.post('/api/activities', auth(['Admin']), async (req, res) => {
    try {
        let { title, description, type, date_start, date_end, inscription_start, inscription_end, sites, price_fcfa, max_participants, is_public } = req.body;

        // Fix empty fields from frontend
        inscription_start = inscription_start || null;
        inscription_end = inscription_end || null;
        price_fcfa = price_fcfa || 0;
        max_participants = max_participants || null;

        const newActivity = await db.query(
            `INSERT INTO activities (title, description, type, date_start, date_end, inscription_start, inscription_end, sites, price_fcfa, max_participants, is_public) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
            [title, description, type, date_start, date_end, inscription_start, inscription_end, JSON.stringify(sites), price_fcfa, max_participants, is_public]
        );
        res.status(201).json(newActivity.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

app.delete('/api/activities/:id', auth(['Admin']), async (req, res) => {
    try {
        await db.query('DELETE FROM activities WHERE id = $1', [req.params.id]);
        res.json({ message: "Activité supprimée" });
    } catch (err) {
        res.status(500).json({ message: "Erreur" });
    }
});

// ----------------- REGISTRATIONS (CANDIDATURE EVENEMENTS) -----------------
app.get('/api/registrations', auth(['Admin', 'Membre']), async (req, res) => {
    try {
        const adminFetchMode = req.query.mode === 'all';
        if (req.user.role === 'Admin' && adminFetchMode) {
            const dbRes = await db.query('SELECT r.*, a.title, u.nom, u.prenom, u.email FROM registrations r JOIN activities a ON r.activity_id = a.id JOIN users u ON r.user_id = u.id ORDER BY r.created_at DESC');
            return res.json(dbRes.rows);
        } else {
            const dbRes = await db.query('SELECT r.*, a.title, a.date_start, a.date_end, a.sites, a.price_fcfa FROM registrations r JOIN activities a ON r.activity_id = a.id WHERE r.user_id = $1 ORDER BY a.date_start DESC', [req.user.id]);
            return res.json(dbRes.rows);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

app.post('/api/register-activity', auth(['Membre', 'Admin']), async (req, res) => {
    try {
        const { activity_id, motivation, experience, attentes, payment_method } = req.body;

        const regCheck = await db.query('SELECT * FROM registrations WHERE user_id = $1 AND activity_id = $2', [req.user.id, activity_id]);
        if (regCheck.rows.length > 0) return res.status(400).json({ message: "Candidature déjà envoyée pour cet événement" });

        let baseStatus = 'approved';
        let pmtStatus = payment_method === 'physical' ? 'physical' : 'pending';

        const dbRes = await db.query(
            `INSERT INTO registrations (user_id, activity_id, status, payment_status, payment_method) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [req.user.id, activity_id, baseStatus, pmtStatus, payment_method]
        );
        res.status(201).json(dbRes.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

app.put('/api/registrations/:id/status', auth(['Admin']), async (req, res) => {
    try {
        const { status, payment_status } = req.body;
        if (status) {
            await db.query('UPDATE registrations SET status = $1 WHERE id = $2', [status, req.params.id]);
        }
        if (payment_status) {
            await db.query('UPDATE registrations SET payment_status = $1 WHERE id = $2', [payment_status, req.params.id]);
        }
        res.json({ message: "Registration mise à jour" });
    } catch (err) {
        res.status(500).json({ message: "Erreur" });
    }
});

app.delete('/api/registrations/:id', auth(['Membre', 'Admin']), async (req, res) => {
    try {
        await db.query('DELETE FROM registrations WHERE id = $1', [req.params.id]);
        res.json({ message: "Désinscription réussie" });
    } catch (err) {
        res.status(500).json({ message: "Erreur" });
    }
});


// ----------------- NEWS & PODCASTS (MOCKS API endpoints) -----------------
app.get('/api/news', async (req, res) => {
    try {
        const q = await db.query('SELECT * FROM news ORDER BY created_at DESC');
        res.json(q.rows);
    } catch (err) { res.status(500).json({ message: "Erreur" }); }
});

app.get('/api/podcasts', async (req, res) => {
    try {
        const q = await db.query('SELECT * FROM podcasts ORDER BY created_at DESC');
        res.json(q.rows);
    } catch (err) { res.status(500).json({ message: "Erreur" }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur Node/Express démarré sur le port ${PORT}`);
});
