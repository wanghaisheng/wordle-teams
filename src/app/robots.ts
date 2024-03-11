import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/me/', '/branding', '/complete-profile'],
    },
    sitemap: 'https://wordleteams.com/sitemap.xml',
  }
}