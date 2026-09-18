import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description?: string;
}

export default function SEO({ title, description }: SEOProps) {
  useEffect(() => {
    // Título da aba
    document.title = title;

    // Meta description
    if (description) {
      let metaDescription = document.querySelector<HTMLMetaElement>(
        'meta[name="description"]',
      );
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }
  }, [title, description]);

  return null;
}