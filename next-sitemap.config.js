/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://safariverse.vercel.app',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'daily',
  priority: 0.7,
  exclude: ['/api/*', '/admin/*'],
  additionalPaths: async (config) => [
    await config.transform(config, '/game/nigeria'),
    await config.transform(config, '/nft'),
    await config.transform(config, '/socialhub'),
    await config.transform(config, '/gallery'),
    await config.transform(config, '/social'),
    await config.transform(config, '/safarimart/nigeria'),
    await config.transform(config, '/artgallery/nigeria'),
    await config.transform(config, '/music/nigeria'),
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
  },
};
