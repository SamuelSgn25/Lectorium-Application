-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Création du super admin
-- Le mot de passe correspond à celui de votre script précédent
-- On respecte l'ordre exact des colonnes défini dans init.sql
INSERT INTO users (
    id,
    nom,
    prenom,
    email,
    password,
    role,
    status,
    grade,
    created_at
)
VALUES (
    uuid_generate_v4(),
    'SOGLOHOUN',
    'Samuel',
    'samuelsgn8@gmail.com',
    '$2b$10$EfQWRoam1v99K9ytzAhbR.9X4haaxVK.poMkcbc9uK5KFB4/7k41S',
    'SuperAdmin',
    'approved',
    '2ème aspect',   
    NOW()
)
ON CONFLICT (email) DO UPDATE SET 
    role = 'SuperAdmin',
    status = 'approved',
    grade = '2ème aspect';
