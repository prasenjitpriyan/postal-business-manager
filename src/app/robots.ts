import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/login', '/signup'],
      disallow: ['/dashboard/', '/api/', '/_next/'],
    },
    sitemap: 'http://localhost:3000/sitemap.xml', // Replace with actual domain when deployed
  };
}
