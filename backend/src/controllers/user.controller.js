const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const User = require('../models/user.model');

// Récupérer le profil de l'utilisateur connecté
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour le profil de l'utilisateur connecté
exports.updateProfile = async (req, res) => {
  try {
    // Validation des données
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = req.body;
    const userId = req.user.id;

    // Ne pas permettre la modification de certains champs sensibles via cette route
    const allowedUpdates = [
      'firstName', 'lastName', 'phone', 'address', 'city', 'country', 
      'dateOfBirth', 'maritalStatus', 'profession', 'professionalSkills', 
      'childrenCount', 'motivation', 'whatsappNumber', 'otherPhone',
      'postalAddress', 'placeOfBirth', 'nationality'
    ];

    // Filtrer les mises à jour autorisées
    const validUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    // Mettre à jour l'utilisateur
    const [updated] = await User.update(validUpdates, {
      where: { id: userId },
      returning: true,
      individualHooks: true
    });

    if (!updated) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Récupérer l'utilisateur mis à jour
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      message: 'Profil mis à jour avec succès',
      user
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
  }
};

// Récupérer tous les utilisateurs (admin uniquement)
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '' } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    
    // Filtre par recherche
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Filtre par rôle
    if (role) {
      whereClause.role = role;
    }
    
    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      users
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer un utilisateur par son ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour un utilisateur
exports.updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Vérifier les autorisations (seul l'utilisateur lui-même ou un admin peut mettre à jour)
    if (req.user.id !== user.id && !['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Non autorisé' });
    }
    
    // Mettre à jour les champs
    const updates = req.body;
    
    // Si un mot de passe est fourni, le hacher
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }
    
    await user.update(updates);
    
    // Récupérer l'utilisateur mis à jour sans le mot de passe
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    });
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer un utilisateur (admin uniquement)
exports.deleteUser = async (req, res) => {
  try {
    // Empêcher l'auto-suppression
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte' });
    }
    
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Vérifier si l'utilisateur est un super_admin (ne peut pas être supprimé par un admin normal)
    if (user.role === 'super_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Non autorisé à supprimer un super administrateur' });
    }
    
    await user.destroy();
    
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Activer/désactiver un utilisateur (admin uniquement)
exports.toggleUserStatus = async (req, res) => {
  try {
    // Empêcher de se désactiver soi-même
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'Vous ne pouvez pas modifier votre propre statut' });
    }
    
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Vérifier si l'utilisateur est un super_admin (ne peut pas être désactivé par un admin normal)
    if (user.role === 'super_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Non autorisé à modifier un super administrateur' });
    }
    
    // Basculer le statut
    await user.update({ isActive: !user.isActive });
    
    res.json({
      message: `Utilisateur ${user.isActive ? 'activé' : 'désactivé'} avec succès`,
      isActive: user.isActive
    });
  } catch (error) {
    console.error('Erreur lors du changement de statut de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour le rôle d'un utilisateur (super_admin uniquement)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide' });
    }
    
    // Empêcher de modifier son propre rôle
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'Vous ne pouvez pas modifier votre propre rôle' });
    }
    
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Vérifier si l'utilisateur est un super_admin (ne peut pas être modifié par un admin normal)
    if (user.role === 'super_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ message: 'Non autorisé à modifier un super administrateur' });
    }
    
    await user.update({ role });
    
    res.json({
      message: `Rôle de l'utilisateur mis à jour avec succès`,
      role: user.role
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
