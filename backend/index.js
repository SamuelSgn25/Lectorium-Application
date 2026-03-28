const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const nodemailer = require('nodemailer');
const axios = require('axios');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE == 465, // true pour le port 465, false pour 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const fromEmail = `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`;


const db = require('./db');
const app = express();

app.use(cors());
app.use(express.json());

// Helper function to notify all admins
const notifyAdmins = async (subject, htmlContent, excludeUserId = null) => {
    // Check if SMTP is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.warn("SMTP is not configured. Skipping admin notification.");
        return;
    }

    try {
        const admins = await db.query("SELECT email FROM users WHERE role IN ('Admin', 'SuperAdmin')");
        for (const admin of admins.rows) {
            if (excludeUserId && admin.id === excludeUserId) continue;
            await transporter.sendMail({
                from: fromEmail,
                to: admin.email,
                subject: subject,
                html: htmlContent
            });
        }
    } catch (err) {
        console.error("Error sending admin notifications:", err);
    }
};


const JWT_SECRET = process.env.JWT_SECRET;

const auth = (roles = []) => {
    return async (req, res, next) => {
        try {
            const token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded;

            let userRank = decoded.role ? decoded.role.toLowerCase() : "";

            // Fallback for legacy tokens without role
            if (!userRank && decoded.id) {
                try {
                    const userDb = await db.query('SELECT role FROM users WHERE id = $1', [decoded.id]);
                    if (userDb.rows.length > 0) {
                        userRank = (userDb.rows[0].role || 'Membre').toLowerCase();
                        req.user.role = userRank; // Inject back
                    }
                } catch(e) {}
            }

            // Normalize roles by removing underscores and spaces to ensure robust matching
            const normalizedUserRank = userRank.replace(/_|\s/g, '');
            const authorizedRoles = roles.map(r => r.toLowerCase().replace(/_|\s/g, ''));

            if (roles.length > 0 && !authorizedRoles.includes(normalizedUserRank)) {
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
            etat_civil, profession, aptitudes, nombre_enfants, motivation_adhesion
            // Removed password from req.body
        } = req.body;

        const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "Cet email existe déjà" });
        }

        // Generate a random internal password because the DB field is NOT NULL
        const internalPassword = Math.random().toString(36).slice(-10);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(internalPassword, salt);

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
                    from: fromEmail,
                    to: email,

                    subject: "Confirmation de votre demande d'adhésion",
                    html: `
                        <h2 style="color: #b89047;">Demande d'adhésion reçue</h2>
                        <p>Bonjour ${prenom} ${nom},</p>
                        <p>Nous vous remercions et vous confirmons la bonne réception de votre demande d'adhésion.</p>
                        <p>Le secrétariat du Lectorium Rosicrucianum va examiner votre demande. Vous recevrez un nouvel e-mail dès qu'un administrateur aura statué sur votre compte et vous attribuera un numéro de matricule.</p>
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

// Look up member by matricule (Public for quick registration)
app.get('/api/members/matricule/:matricule', async (req, res) => {
    try {
        const { matricule } = req.params;
        const member = await db.query(
            `SELECT nom, prenom, sexe, centre as center, grade as aspect, date_naissance, email 
             FROM users 
             WHERE matricule = $1`,
            [matricule]
        );
        if (member.rows.length === 0) return res.status(404).json({ message: "Matricule non trouvé" });

        const m = member.rows[0];
        let age = null;
        if (m.date_naissance) {
            const birthDate = new Date(m.date_naissance);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const m_diff = today.getMonth() - birthDate.getMonth();
            if (m_diff < 0 || (m_diff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
        }

        res.json({ ...m, age });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur" });
    }
});


app.post('/api/login', async (req, res) => {
    try {
        const { email, password, matricule, loginType } = req.body;

        let user;
        if (loginType === 'membre') {
            if (!matricule) return res.status(400).json({ message: "Veuillez renseigner votre matricule" });
            const userQuery = await db.query('SELECT * FROM users WHERE matricule = $1', [matricule]);
            if (userQuery.rows.length === 0) {
                return res.status(400).json({ message: "Matricule incorrect ou non trouvé" });
            }
            user = userQuery.rows[0];
            
            const r = user.role ? user.role.toLowerCase() : 'membre';
            if (r === 'admin' || r === 'superadmin' || r === 'super_admin') {
                return res.status(403).json({ message: "Les administrateurs doivent utiliser la connexion Admin avec email et mot de passe." });
            }
        } else {
            // Admin/SuperAdmin Login
            if (!email || !password) return res.status(400).json({ message: "Veuillez renseigner votre email et mot de passe." });
            
            const userQuery = await db.query('SELECT * FROM users WHERE email = $1', [email]);
            if (userQuery.rows.length === 0) {
                return res.status(404).json({ message: "Aucun administrateur trouvé avec cette adresse email." });
            }

            user = userQuery.rows[0];
            
            const r = user.role ? user.role.toLowerCase() : 'membre';
            if (r !== 'admin' && r !== 'superadmin' && r !== 'super_admin') {
                return res.status(403).json({ message: "Cet accès est strictement réservé aux administrateurs. Utilisez la connexion par Matricule." });
            }

            // Check password only for Non-Member login types (Admins)
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: "Le mot de passe saisi est incorrect. (Assurez-vous qu'il est bien crypté (bcrypt) dans NeonDB)." });
            }
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
                from: fromEmail,
                to: email,

                subject: "Réinitialisation de votre mot de passe",
                html: `
                    <h2 style="color: #b89047;">Changement de mot de passe</h2>
                    <p>Bonjour ${user.prenom} ${user.nom},</p>
                    <p>Votre mot de passe a bien été mis à jour. Voici votre nouveau mot de passe temporaire :</p>
                    <div style="font-size: 20px; font-weight: bold; background: #fdfbf7; padding: 15px; border: 1px solid #b89047; display: inline-block; margin: 10px 0;">
                        ${tempPassword}
                    </div>
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
        const currentUser = await db.query('SELECT role, matricule, centre, nom, prenom FROM users WHERE id = $1', [req.user.id]);
        const userRole = currentUser.rows[0].role;

        // Restriction: Members can only read their profile, not update it.
        if (userRole === 'Membre') {
            return res.status(403).json({ message: "Les membres ne peuvent pas modifier leurs informations eux-mêmes. Veuillez contacter l'administration." });
        }

        const {
            nom, nom_jeune_fille, prenom, date_naissance, lieu_naissance,
            nationalite, adresse, email, telephone_whatsapp, telephone_autre,
            etat_civil, profession, aptitudes, nombre_enfants, motivation_adhesion,
            password, sexe, centre, matricule
        } = req.body;

        if (email) {
            const emailCheck = await db.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, req.user.id]);
            if (emailCheck.rows.length > 0) return res.status(400).json({ message: "L'email est déjà utilisé" });
        }
        if (matricule) {
            const matCheck = await db.query('SELECT id FROM users WHERE matricule = $1 AND id != $2', [matricule, req.user.id]);
            if (matCheck.rows.length > 0) return res.status(400).json({ message: "Le matricule est déjà utilisé" });
        }

        const oldMatricule = currentUser.rows[0].matricule;
        const oldCentre = currentUser.rows[0].centre;

        // Admins can change their info, but notify other admins if sensitive fields change
        if (matricule !== undefined && centre !== undefined) {
             if (matricule !== oldMatricule || centre !== oldCentre) {
                await notifyAdmins(
                    "Notification de changement d'informations sensibles (Admin)",
                    `
                        <h2 style="color: #b89047;">Alerte de modification de profil</h2>
                        <p>L'administrateur <strong>${currentUser.rows[0].prenom} ${currentUser.rows[0].nom}</strong> a modifié ses propres informations sensibles :</p>
                        <ul>
                            <li>Ancien Matricule: ${oldMatricule || 'N/A'} -> Nouveau: ${matricule}</li>
                            <li>Ancien Centre: ${oldCentre || 'N/A'} -> Nouveau: ${centre}</li>
                        </ul>
                    `,
                    req.user.id
                );
             }
        }

        let query = `UPDATE users SET 
            nom = COALESCE($1, nom), prenom = COALESCE($2, prenom), email = COALESCE($3, email),
            nom_jeune_fille = COALESCE($4, nom_jeune_fille), date_naissance = COALESCE($5, date_naissance),
            lieu_naissance = COALESCE($6, lieu_naissance), nationalite = COALESCE($7, nationalite),
            adresse = COALESCE($8, adresse), telephone_whatsapp = COALESCE($9, telephone_whatsapp),
            telephone_autre = COALESCE($10, telephone_autre), etat_civil = COALESCE($11, etat_civil),
            profession = COALESCE($12, profession), aptitudes = COALESCE($13, aptitudes),
            nombre_enfants = COALESCE($14, nombre_enfants), motivation_adhesion = COALESCE($15, motivation_adhesion),
            sexe = COALESCE($16, sexe), centre = COALESCE($17, centre), matricule = COALESCE($18, matricule)`;

        let params = [
            nom, prenom, email, nom_jeune_fille, date_naissance || null,
            lieu_naissance, nationalite, adresse, telephone_whatsapp,
            telephone_autre, etat_civil, profession, aptitudes,
            nombre_enfants || 0, motivation_adhesion, sexe, centre, matricule
        ];

        if (password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            query += `, password = $${params.length + 1}`;
            params.push(hashedPassword);
        }

        query += ` WHERE id = $${params.length + 1}`;
        params.push(req.user.id);

        await db.query(query, params);
        res.json({ message: "Profil mis à jour" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});



// ----------------- USERS ADMIN -----------------
app.post('/api/users', auth(['Admin', 'SuperAdmin']), async (req, res) => {
    try {
        const { nom, prenom, email, role, password, matricule, sexe, centre, grade } = req.body;
        const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) return res.status(400).json({ message: "Cet email existe déjà" });
        if (matricule) {
            const matExists = await db.query('SELECT * FROM users WHERE matricule = $1', [matricule]);
            if (matExists.rows.length > 0) return res.status(400).json({ message: "Ce matricule est déjà utilisé" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await db.query(
            `INSERT INTO users (nom, prenom, email, role, status, grade, password, matricule, sexe, centre) 
             VALUES ($1, $2, $3, $4, 'approved', $5, $6, $7, $8, $9)`,
            [nom, prenom, email, role, grade || 'Nouveau membre', hashedPassword, matricule, sexe, centre]
        );


        if (process.env.SMTP_USER) {
            try {
                await transporter.sendMail({
                    from: fromEmail,
                    to: email,
                    subject: "Vos identifiants d'accès - Lectorium Rosicrucianum",
                    html: `
                        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e1dcc5; padding: 20px;">
                            <h2 style="color: #b89047; border-bottom: 2px solid #b89047; padding-bottom: 10px;">Bienvenue sur la plateforme !</h2>
                            <p>Bonjour ${prenom} ${nom},</p>
                            <p>Un profil vient d'être généré pour vous par l'administration du Lectorium Rosicrucianum.</p>
                            <p>Vous pouvez désormais vous connecter à votre espace personnel avec les identifiants suivants :</p>
                            <div style="background-color: #fdfbf7; border: 1px solid #b89047; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <p style="margin: 5px 0;"><strong>Adresse Email :</strong> ${email}</p>
                                <p style="margin: 5px 0;"><strong>Mot de passe :</strong> ${password}</p>
                            </div>
                            <p><strong>Rôle :</strong> ${role}</p>
                            <p style="margin-top: 20px;">Nous vous recommandons de changer votre mot de passe après votre première connexion dans les paramètres de votre profil.</p>
                            <div style="text-align: center; margin-top: 30px;">
                                <a href="https://lectorium-application.vercel.app/login" style="background-color: #b89047; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Se connecter à mon espace</a>
                            </div>
                            <p style="margin-top: 30px;">À très bientôt,</p>
                            <p><em>L'administration du Lectorium Rosicrucianum</em></p>

                        </div>
                    `
                });
            } catch (mailErr) {
                console.error("Erreur envoi email :", mailErr);
            }
        }

        res.status(201).json({ message: "Utilisateur créé avec succès" });
    } catch (err) { res.status(500).json({ message: "Erreur serveur" }); }
});


// Validation Adhesion
app.put('/api/admin/users/:id/status', auth(['Admin', 'SuperAdmin']), async (req, res) => {
    try {
        const { status, matricule } = req.body;

        // Vérifier la hiérarchie pour la validation
        const targetUserQuery = await db.query('SELECT role, prenom, nom, email FROM users WHERE id = $1', [req.params.id]);
        if (targetUserQuery.rows.length === 0) return res.status(404).json({ message: "Utilisateur non trouvé" });
        const targetUser = targetUserQuery.rows[0];

        if (req.user.role === 'Admin' && targetUser.role === 'SuperAdmin') {
            return res.status(403).json({ message: "Vous ne pouvez pas modifier le statut de l'Admin Suprême" });
        }

        if (status === 'approved') {
            if (!matricule) return res.status(400).json({ message: "Un numéro matricule est requis pour valider l'adhésion" });
            
            // Check if matricule is already used
            const matCheck = await db.query('SELECT id FROM users WHERE matricule = $1 AND id != $2', [matricule, req.params.id]);
            if (matCheck.rows.length > 0) return res.status(400).json({ message: "Ce matricule est déjà attribué" });

            await db.query('UPDATE users SET status = $1, matricule = $2 WHERE id = $3', [status, matricule, req.params.id]);
            
            if (process.env.SMTP_USER) {
                // Fetch activities for the current month
                const now = new Date();
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                const activities = await db.query(
                    'SELECT title, date_start FROM activities WHERE date_start >= $1 AND date_start <= $2 ORDER BY date_start ASC',
                    [now, endOfMonth]
                );

                let activitiesHtml = '';
                if (activities.rows.length > 0) {
                    activitiesHtml = '<h3 style="color: #b89047;">Activités du mois :</h3><ul>';
                    activities.rows.forEach(act => {
                        activitiesHtml += `<li><strong>${act.title}</strong> - ${new Date(act.date_start).toLocaleDateString('fr-FR')}</li>`;
                    });
                    activitiesHtml += '</ul>';
                }

                try {
                    await transporter.sendMail({
                        from: fromEmail,
                        to: targetUser.email,
                        subject: "Bienvenue au Lectorium Rosicrucianum - Votre adhésion est confirmée",
                        html: `
                            <h2 style="color: #b89047;">Adhésion Validée !</h2>
                            <p>Bonjour ${targetUser.prenom} ${targetUser.nom},</p>
                            <p>Nous avons le plaisir de vous annoncer que votre demande d'adhésion a été acceptée.</p>
                            <p>Voici votre <strong>Numéro Matricule</strong> qui vous servira désormais d'identifiant unique pour vous connecter :</p>
                            <div style="font-size: 24px; font-weight: bold; background: #fdfbf7; padding: 15px; border: 1px solid #b89047; display: inline-block; margin: 10px 0; color: #b89047;">
                                ${matricule}
                            </div>
                            <p>Vous n'avez plus besoin d'email ni de mot de passe pour accéder à votre espace membre, utilisez simplement ce matricule.</p>
                            ${activitiesHtml}
                            <p style="margin-top: 20px;">
                                <a href="https://lectorium-application.vercel.app/login" style="background-color: #b89047; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Accéder à mon espace</a>
                            </p>
                        `
                    });
                } catch (mailErr) { console.error("Erreur email d'approbation", mailErr); }
            }
        } else {
            await db.query('UPDATE users SET status = $1 WHERE id = $2', [status, req.params.id]);
        }

        res.json({ message: "Statut mis à jour" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur" });
    }
});



app.get('/api/admin/users', auth(['Admin', 'SuperAdmin']), async (req, res) => {
    try {
        let query = 'SELECT * FROM users';
        let params = [];

        // Un Admin (non Super) ne peut pas voir le SuperAdmin
        if (req.user.role === 'Admin') {
            query += ' WHERE role != \'SuperAdmin\'';
        }

        query += ' ORDER BY created_at DESC';

        const u = await db.query(query, params);
        res.json(u.rows);
    } catch (err) {
        res.status(500).json({ message: "Erreur" });
    }
});

// Edit role / grade
app.put('/api/admin/users/:id/role-grade', auth(['Admin', 'SuperAdmin']), async (req, res) => {
    try {
        const { role, grade } = req.body;

        // Vérifier la hiérarchie
        const targetUserQuery = await db.query('SELECT role FROM users WHERE id = $1', [req.params.id]);
        if (targetUserQuery.rows.length === 0) return res.status(404).json({ message: "Utilisateur non trouvé" });
        const targetUser = targetUserQuery.rows[0];

        // Un Admin simple ne peut pas modifier un autre Admin ou le SuperAdmin
        if (req.user.role === 'Admin' && (targetUser.role === 'Admin' || targetUser.role === 'SuperAdmin')) {
            return res.status(403).json({ message: "Vous n'avez pas les droits pour modifier ce profil" });
        }

        // Un Admin simple ne peut pas promouvoir quelqu'un en Admin ou SuperAdmin
        if (req.user.role === 'Admin' && (role === 'Admin' || role === 'SuperAdmin')) {
            return res.status(403).json({ message: "Seul l'Admin Suprême peut nommer des administrateurs" });
        }

        const { matricule, centre } = req.body;
        const oldInfo = await db.query('SELECT matricule, centre, nom, prenom FROM users WHERE id = $1', [req.params.id]);

        if (matricule !== undefined || centre !== undefined) {
             if (matricule !== oldInfo.rows[0].matricule || centre !== oldInfo.rows[0].centre) {
                const modifier = await db.query('SELECT nom, prenom FROM users WHERE id = $1', [req.user.id]);
                await notifyAdmins(
                    "Notification de changement d'informations d'un membre",
                    `
                        <h2 style="color: #b89047;">Changement d'informations sensibles</h2>
                        <p>L'administrateur <strong>${modifier.rows[0].prenom} ${modifier.rows[0].nom}</strong> a modifié les informations de <strong>${oldInfo.rows[0].prenom} ${oldInfo.rows[0].nom}</strong> :</p>
                        <ul>
                            <li>Matricule: ${oldInfo.rows[0].matricule || 'N/A'} -> ${matricule || oldInfo.rows[0].matricule}</li>
                            <li>Centre: ${oldInfo.rows[0].centre || 'N/A'} -> ${centre || oldInfo.rows[0].centre}</li>
                        </ul>
                    `
                );
             }
        }

        await db.query(`UPDATE users SET 
            role = COALESCE($1, role), 
            grade = COALESCE($2, grade),
            matricule = COALESCE($3, matricule),
            centre = COALESCE($4, centre)
            WHERE id = $5`, [role, grade, matricule, centre, req.params.id]);
        res.json({ message: "Utilisateur mis à jour" });

    } catch (err) {
        res.status(500).json({ message: "Erreur" });
    }
});

app.delete('/api/admin/users/:id', auth(['Admin', 'SuperAdmin']), async (req, res) => {
    try {
        const targetUserQuery = await db.query('SELECT role FROM users WHERE id = $1', [req.params.id]);
        if (targetUserQuery.rows.length === 0) return res.status(404).json({ message: "Utilisateur non trouvé" });
        const targetUser = targetUserQuery.rows[0];

        // Un Admin simple ne peut pas supprimer un autre Admin ou le SuperAdmin
        if (req.user.role === 'Admin' && (targetUser.role === 'Admin' || targetUser.role === 'SuperAdmin')) {
            return res.status(403).json({ message: "Vous ne pouvez pas supprimer un administrateur" });
        }

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

app.post('/api/activities', auth(['Admin', 'SuperAdmin']), async (req, res) => {
    try {
        let { title, description, type, date_start, date_end, inscription_start, inscription_end, sites, price_fcfa, max_participants, is_public, program } = req.body;

        const newActivity = await db.query(
            `INSERT INTO activities (title, description, type, date_start, date_end, inscription_start, inscription_end, sites, price_fcfa, max_participants, is_public, program) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
            [title, description, type, date_start, date_end, inscription_start || null, inscription_end || null, JSON.stringify(sites), price_fcfa || 0, max_participants || null, is_public, JSON.stringify(program || [])]
        );
        res.status(201).json(newActivity.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

app.put('/api/activities/:id', auth(['Admin', 'SuperAdmin']), async (req, res) => {

    try {
        let { title, description, type, date_start, date_end, inscription_start, inscription_end, sites, price_fcfa, max_participants, is_public, program } = req.body;

        const updatedActivity = await db.query(
            `UPDATE activities SET title = $1, description = $2, type = $3, date_start = $4, date_end = $5, inscription_start = $6, inscription_end = $7, sites = $8, price_fcfa = $9, max_participants = $10, is_public = $11, program = $12 
             WHERE id = $13 RETURNING *`,
            [title, description, type, date_start, date_end, inscription_start || null, inscription_end || null, JSON.stringify(sites), price_fcfa || 0, max_participants || null, is_public, JSON.stringify(program || []), req.params.id]
        );
        res.json(updatedActivity.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});


app.delete('/api/activities/:id', auth(['Admin', 'SuperAdmin']), async (req, res) => {

    try {
        await db.query('DELETE FROM activities WHERE id = $1', [req.params.id]);
        res.json({ message: "Activité supprimée" });
    } catch (err) {
        res.status(500).json({ message: "Erreur" });
    }
});

// ----------------- REGISTRATIONS (CANDIDATURE EVENEMENTS) -----------------
app.get('/api/admin/registrations', auth(['Admin', 'SuperAdmin']), async (req, res) => {

    try {
        const dbRes = await db.query(`
            SELECT r.*, a.title, u.nom, u.prenom, u.email 
            FROM registrations r 
            JOIN activities a ON r.activity_id = a.id 
            LEFT JOIN users u ON r.user_id = u.id 
            ORDER BY r.created_at DESC
        `);
        res.json(dbRes.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

app.get('/api/my-registrations', auth(['Membre', 'Admin', 'SuperAdmin']), async (req, res) => {

    try {
        const dbRes = await db.query(`
            SELECT r.*, a.title, a.date_start, a.date_end, a.sites, a.price_fcfa 
            FROM registrations r 
            JOIN activities a ON r.activity_id = a.id 
            WHERE r.user_id = $1 
            ORDER BY a.date_start DESC
        `, [req.user.id]);
        res.json(dbRes.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});


app.post('/api/register-activity', async (req, res) => {
    try {
        const { activity_id, selected_site, motivation, experience, attentes, payment_method, guest_info, child_info } = req.body;
        
        // Vérifier si l'activité existe et son prix
        const activityQuery = await db.query('SELECT * FROM activities WHERE id = $1', [activity_id]);
        if (activityQuery.rows.length === 0) return res.status(404).json({ message: "Activité non trouvée" });
        const activity = activityQuery.rows[0];
        
        const now = new Date();
        if (activity.inscription_start && now < new Date(activity.inscription_start)) {
            return res.status(400).json({ message: "La période d'inscription pour cet événement n'est pas encore ouverte." });
        }
        if (activity.inscription_end && now > new Date(activity.inscription_end)) {
            return res.status(400).json({ message: "La période d'inscription pour cet événement est terminée." });
        }

        let userId = null;
        let authHeader = req.headers.authorization;
        if (authHeader) {
            try {
                const token = authHeader.split(" ")[1];
                const decoded = jwt.verify(token, JWT_SECRET);
                userId = decoded.id;
            } catch (e) { }
        }

        if (req.body.register_by_matricule) {
            const memberToRegister = await db.query('SELECT * FROM users WHERE matricule = $1', [req.body.register_by_matricule]);
            if (memberToRegister.rows.length === 0) return res.status(404).json({ message: "Matricule non trouvé" });
            userId = memberToRegister.rows[0].id; // Override userId to the found member
        }

        if (userId && !guest_info && !child_info) {
            const regCheck = await db.query('SELECT * FROM registrations WHERE user_id = $1 AND activity_id = $2', [userId, activity_id]);
            if (regCheck.rows.length > 0) return res.status(400).json({ message: "Candidature déjà envoyée pour cet événement" });
        }

        let baseStatus = 'approved';
        let pmtStatus = (activity.price_fcfa === 0 || activity.price_fcfa === null) ? 'paid' : (payment_method === 'physical' ? 'physical' : 'pending');

        if (payment_method === 'feexpay' && req.body.feexpay_network && req.body.feexpay_phone) {
            const networkMap = { mtn: 'mtn', moov: 'moov', celtiis: 'celtiis_bj' };
            const endpoint = `https://api.feexpay.me/api/transactions/public/requesttopay/${networkMap[req.body.feexpay_network]}`;
            
            try {
                // Formatting phone to 229 prefix if missing
                let phone = req.body.feexpay_phone;
                if (!phone.startsWith('229')) phone = '229' + phone;

                // Fire the payment request
                const paymentRes = await axios.post(endpoint, {
                    phoneNumber: phone,
                    amount: activity.price_fcfa,
                    shop: process.env.FEEXPAY_SHOP_ID,
                    description: `Adhesion Lectorium - Activity ${activity.title.substring(0, 15)}`, // Truncated to prevent API limits
                }, {
                    headers: {
                        'Authorization': `Bearer ${process.env.FEEXPAY_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                // Assuming Feexpay returns some successful status here, but it triggers a USSD prompt asynchronously.
                // We'll leave payment_status as 'pending' to be approved later either via webhook or admin validation.
                // Optionally save paymentRes.data reference if we had a column. For now it is implicit in 'pending'.
                
            } catch (paymentErr) {
                console.error("FeexPay Error:", paymentErr.response?.data || paymentErr.message);
                return res.status(400).json({ message: "Erreur lors de l'initiation du paiement FeexPay. Veuillez vérifier votre numéro d'opérateur mobile." });
            }
        }

        const dbRes = await db.query(
            `INSERT INTO registrations (user_id, activity_id, selected_site, status, payment_status, payment_method, guest_info, child_info) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [userId, activity_id, selected_site, baseStatus, pmtStatus, payment_method, JSON.stringify(guest_info || null), JSON.stringify(child_info || null)]
        );

        res.status(201).json(dbRes.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur serveur" });
    }
});


app.put('/api/admin/registrations/:id', auth(['Admin', 'SuperAdmin']), async (req, res) => {

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


app.delete('/api/registrations/:id', auth(['Membre', 'Admin', 'SuperAdmin']), async (req, res) => {

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
        let userId = null;
        let role = 'guest';

        let authHeader = req.headers.authorization;
        if (authHeader) {
            try {
                const token = authHeader.split(" ")[1];
                const decoded = jwt.verify(token, JWT_SECRET);
                userId = decoded.id;
                role = decoded.role;
            } catch (e) { }
        }

        let query = 'SELECT * FROM news ';
        let params = [];

        if (role === 'SuperAdmin') {
            // Can see everything
        } else if (role === 'Admin') {
            query += "WHERE visibility IN ('public', 'members', 'admins')";
        } else if (role === 'Membre') {
            query += "WHERE visibility IN ('public', 'members')";
        } else {
            query += "WHERE visibility = 'public'";
        }

        query += ' ORDER BY created_at DESC';

        const q = await db.query(query, params);
        res.json(q.rows);
    } catch (err) { res.status(500).json({ message: "Erreur" }); }
});

app.post('/api/news', auth(['Admin', 'SuperAdmin']), async (req, res) => {
    try {
        const { title, content, category, author, image_url, file_url, visibility } = req.body;
        const result = await db.query(
            'INSERT INTO news (title, content, category, author, image_url, file_url, visibility) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [title, content, category, author, image_url, file_url, visibility || 'public']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erreur lors de la création du communiqué" });
    }
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
