
import React from 'react';

export function OrganizationStructuredData() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Koła Młodych OZZ Inicjatywy Pracowniczej",
    "url": "https://mlodzi.ozzip.pl",
    "logo": "https://mlodzi.ozzip.pl/lovable-uploads/a69f462f-ae71-40a5-a60a-babfda61840e.png",
    "description": "Oficjalna strona struktur młodzieżowych związku zawodowego Inicjatywa Pracownicza",
    "sameAs": [
      "https://ozzip.pl"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "mlodzi.ip@ozzip.pl"
    },
    "parentOrganization": {
      "@type": "Organization",
      "name": "OZZ Inicjatywa Pracownicza",
      "url": "https://ozzip.pl"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      data-seo="true"
    />
  );
}
