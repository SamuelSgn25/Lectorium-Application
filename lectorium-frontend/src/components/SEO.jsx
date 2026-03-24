import { useEffect } from 'react';

/**
 * Composant SEO pour mettre à jour dynamiquement les meta tags
 * @param {Object} props
 * @param {string} props.title - Titre de la page
 * @param {string} props.description - Description de la page
 * @param {string} props.keywords - Mots-clés (optionnel)
 * @param {string} props.image - Image pour Open Graph (optionnel)
 * @param {string} props.url - URL canonique (optionnel)
 */
export default function SEO({ 
  title = 'Lectorium Rosicrucianum Benin',
  description = 'École spirituelle internationale dédiée à la renaissance de l\'homme véritable selon les enseignements de la sagesse universelle rosicrucienne.',
  keywords = '',
  image = '/og-image.jpg',
  url = window.location.href
}) {
  useEffect(() => {
    // Mettre à jour le titre
    document.title = title.includes('Lectorium') ? title : `${title} | Lectorium Rosicrucianum Benin`;
    
    // Mettre à jour les meta tags de base
    updateMetaTag('description', description);
    if (keywords) {
      updateMetaTag('keywords', keywords);
    }
    
    // Mettre à jour Open Graph
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:image', image, 'property');
    updateMetaTag('og:url', url, 'property');
    
    // Mettre à jour Twitter Card
    updateMetaTag('twitter:title', title, 'name');
    updateMetaTag('twitter:description', description, 'name');
    updateMetaTag('twitter:image', image, 'name');
    
    // Mettre à jour l'URL canonique
    updateCanonical(url);
  }, [title, description, keywords, image, url]);

  return null;
}

function updateMetaTag(name, content, attribute = 'name') {
  let element = document.querySelector(`meta[${attribute}="${name}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}

function updateCanonical(url) {
  let element = document.querySelector('link[rel="canonical"]');
  
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  
  element.setAttribute('href', url);
}


