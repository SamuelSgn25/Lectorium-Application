require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize } = require('../src/config/db');
const User = require('../src/models/user.model');

const admins = [
  {
    firstName: 'Samuel',
    lastName: 'Soglo',
    email: 'soglohounsamuel2@gmail.com',
    password: 'MarvinPromo2027',
    phone: '+229 00 00 00 00',
    address: 'Cotonou, Bénin',
    city: 'Cotonou',
    country: 'Bénin',
    role: 'super_admin',
    isActive: true,
    emailVerifiedAt: new Date()
  },
  {
    firstName: 'Alex',
    lastName: 'Inera',
    email: 'alexinera@yahoo.fr',
    password: 'alexinera1974',
    phone: '+229 00 00 00 01',
    address: 'Cotonou, Bénin',
    city: 'Cotonou',
    country: 'Bénin',
    role: 'super_admin',
    isActive: true,
    emailVerifiedAt: new Date()
  },
  {
    firstName: 'Lectorium',
    lastName: 'Admin',
    email: 'lectoriumbenin@gmail.com',
    password: 'lectorium2025',
    phone: '+229 00 00 00 02',
    address: 'Cotonou, Bénin',
    city: 'Cotonou',
    country: 'Bénin',
    role: 'admin',
    isActive: true,
    emailVerifiedAt: new Date()
  },
  {
    firstName: 'Aurelien',
    lastName: 'Epahouansou',
    email: 'aepahouansou@yahoo.fr',
    password: 'aurelien2025',
    phone: '+229 00 00 00 03',
    address: 'Cotonou, Bénin',
    city: 'Cotonou',
    country: 'Bénin',
    role: 'admin',
    isActive: true,
    emailVerifiedAt: new Date()
  }
];

const seedAdmins = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connexion à la base de données établie avec succès.');
    
    // Synchronisation des modèles
    await sequelize.sync({ force: false });
    console.log('Modèles synchronisés avec la base de données.');
    
    // Vérifier si les administrateurs existent déjà
    const existingAdmins = await User.findAll({
      where: {
        email: admins.map(admin => admin.email)
      }
    });
    
    const existingEmails = existingAdmins.map(admin => admin.email);
    const newAdmins = admins.filter(admin => !existingEmails.includes(admin.email));
    
    if (newAdmins.length === 0) {
      console.log('Tous les administrateurs existent déjà dans la base de données.');
      process.exit(0);
    }
    
    // Hacher les mots de passe des nouveaux administrateurs
    for (const admin of newAdmins) {
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(admin.password, salt);
    }
    
    // Créer les nouveaux administrateurs
    await User.bulkCreate(newAdmins);
    
    console.log(`${newAdmins.length} administrateurs créés avec succès.`);
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la création des administrateurs :', error);
    process.exit(1);
  }
};

seedAdmins();
