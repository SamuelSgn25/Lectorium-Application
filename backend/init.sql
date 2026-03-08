-- Connexion à la base (si utilisé avec psql)
-- \c lectorium;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS news CASCADE;
DROP TABLE IF EXISTS podcasts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(255) NOT NULL,
  nom_jeune_fille VARCHAR(255),
  prenom VARCHAR(255) NOT NULL,
  date_naissance DATE,
  lieu_naissance VARCHAR(255),
  nationalite VARCHAR(255),
  adresse TEXT,
  email VARCHAR(255) UNIQUE NOT NULL,
  telephone_whatsapp VARCHAR(50),
  telephone_autre VARCHAR(50),
  etat_civil VARCHAR(100),
  profession VARCHAR(255),
  aptitudes TEXT,
  nombre_enfants INTEGER DEFAULT 0,
  motivation_adhesion TEXT,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'Membre', -- 'SuperAdmin', 'Admin', 'Membre'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  grade VARCHAR(100) DEFAULT 'Nouveau membre',
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(100),
  date_start TIMESTAMP NOT NULL,
  date_end TIMESTAMP NOT NULL,
  inscription_start TIMESTAMP,
  inscription_end TIMESTAMP,
  sites JSONB, -- Stockera les sites (ex: ["Foyer Sole Novo", "Cotonou"])
  price_fcfa INTEGER DEFAULT 0,
  max_participants INTEGER,
  is_public BOOLEAN DEFAULT true,
  program JSONB DEFAULT '[]', -- Programme détaillé par jour
  status VARCHAR(50) DEFAULT 'upcoming', 
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NULL,
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'approved', -- 'approved' par défaut selon la demande

  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, physical
  motivation TEXT,
  experience TEXT,
  attentes TEXT,
  guest_info JSONB, -- Pour les inscriptions non-membres
  child_info JSONB, -- Pour les inscriptions d'enfants
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  category VARCHAR(100),
  author VARCHAR(255),
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS podcasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  audio_url VARCHAR(255),
  image_url VARCHAR(255),
  duration VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



