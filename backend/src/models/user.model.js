const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'last_name'
  },
  maidenName: {
    type: DataTypes.STRING,
    field: 'maiden_name'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  whatsappNumber: {
    type: DataTypes.STRING,
    field: 'whatsapp_number'
  },
  otherPhone: {
    type: DataTypes.STRING,
    field: 'other_phone'
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  postalAddress: {
    type: DataTypes.STRING,
    field: 'postal_address'
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false
  },
  country: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    field: 'date_of_birth'
  },
  placeOfBirth: {
    type: DataTypes.STRING,
    field: 'place_of_birth'
  },
  nationality: DataTypes.STRING,
  maritalStatus: {
    type: DataTypes.ENUM('marié', 'célibataire', 'veuf', 'divorcé', 'concubin', 'séparé'),
    defaultValue: 'célibataire',
    field: 'marital_status'
  },
  profession: DataTypes.STRING,
  professionalSkills: {
    type: DataTypes.TEXT,
    field: 'professional_skills'
  },
  childrenCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'children_count'
  },
  motivation: DataTypes.TEXT,
  role: {
    type: DataTypes.ENUM('user', 'admin', 'super_admin'),
    defaultValue: 'user'
  },
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  emailVerifiedAt: {
    type: DataTypes.DATE,
    field: 'email_verified_at'
  },
  lastLogin: {
    type: DataTypes.DATE,
    field: 'last_login'
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Méthode pour vérifier le mot de passe
User.prototype.validPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Méthode pour vérifier si l'utilisateur est un admin
User.prototype.isAdmin = function() {
  return ['admin', 'super_admin'].includes(this.role);
};

module.exports = User;
