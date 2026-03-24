const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { auth } = require('../middleware/auth.middleware');

const router = express.Router();

// Validation des données pour l'inscription
const validateRegistration = [
  body('firstName').trim().notEmpty().withMessage('Le prénom est requis'),
  body('lastName').trim().notEmpty().withMessage('Le nom est requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/[A-Z]/)
    .withMessage('Le mot de passe doit contenir au moins une majuscule')
    .matches(/[0-9]/)
    .withMessage('Le mot de passe doit contenir au moins un chiffre'),
  body('phone').notEmpty().withMessage('Le numéro de téléphone est requis'),
  body('address').notEmpty().withMessage('L\'adresse est requise'),
  body('city').notEmpty().withMessage('La ville est requise'),
  body('country').notEmpty().withMessage('Le pays est requis'),
  body('dateOfBirth').isDate().withMessage('Date de naissance invalide'),
  body('maritalStatus')
    .isIn(['marié', 'célibataire', 'veuf', 'divorcé', 'concubin', 'séparé'])
    .withMessage('Statut matrimonial invalide'),
  body('profession').notEmpty().withMessage('La profession est requise'),
  body('professionalSkills').optional(),
  body('childrenCount').optional().isInt({ min: 0 }),
  body('motivation').notEmpty().withMessage('La motivation est requise')
];

// Validation des données pour la connexion
const validateLogin = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Le mot de passe est requis')
];

// Routes d'authentification
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.get('/me', auth, authController.getProfile);

module.exports = router;
