const express = require('express');
const { body, param } = require('express-validator');
const userController = require('../controllers/user.controller');
const { auth, checkRole } = require('../middleware/auth.middleware');

const router = express.Router();

// Middleware de validation pour les paramètres d'ID
const validateId = [
  param('id').isUUID().withMessage('ID utilisateur invalide')
];

// Middleware de validation pour la mise à jour d'utilisateur
const validateUpdateUser = [
  body('firstName').optional().trim().notEmpty().withMessage('Le prénom est requis'),
  body('lastName').optional().trim().notEmpty().withMessage('Le nom est requis'),
  body('email').optional().isEmail().withMessage('Email invalide'),
  body('phone').optional().notEmpty().withMessage('Le numéro de téléphone est requis'),
  body('address').optional().notEmpty().withMessage('L\'adresse est requise'),
  body('city').optional().notEmpty().withMessage('La ville est requise'),
  body('country').optional().notEmpty().withMessage('Le pays est requis'),
  body('dateOfBirth').optional().isDate().withMessage('Date de naissance invalide'),
  body('maritalStatus')
    .optional()
    .isIn(['marié', 'célibataire', 'veuf', 'divorcé', 'concubin', 'séparé'])
    .withMessage('Statut matrimonial invalide'),
  body('profession').optional().notEmpty().withMessage('La profession est requise'),
  body('professionalSkills').optional(),
  body('childrenCount').optional().isInt({ min: 0 }),
  body('motivation').optional().notEmpty().withMessage('La motivation est requise')
];

// Routes accessibles par tous les utilisateurs authentifiés
router.get('/me', auth, userController.getUserProfile);
router.put('/me', auth, validateUpdateUser, userController.updateProfile);

// Routes réservées aux administrateurs
router.use(auth, checkRole(['admin', 'super_admin']));

// Gestion des utilisateurs (admin)
router.get('/', userController.getAllUsers);
router.get('/:id', validateId, userController.getUserById);
router.put('/:id', [...validateId, ...validateUpdateUser], userController.updateUser);
router.delete('/:id', validateId, userController.deleteUser);
router.patch('/:id/toggle-status', validateId, userController.toggleUserStatus);

// Routes réservées aux super administrateurs
router.use(auth, checkRole(['super_admin']));
router.patch('/:id/role', 
  [
    ...validateId,
    body('role')
      .isIn(['user', 'admin', 'super_admin'])
      .withMessage('Rôle invalide')
  ], 
  userController.updateUserRole
);

module.exports = router;
