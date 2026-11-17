import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // the live address (www.syinnovation.net already redirects here); canonical links, hreflang and the sitemap use it
  site: 'https://syinnovation.net',
  // one address per page, without the trailing slash, as every link on the site is written (vercel.json matches)
  trailingSlash: 'never',
  // consulting.html, not consulting/index.html: GitHub Pages (syinnovation.net, user 2026-11-17) serves /consulting from
  // the .html file as it is, but sends a folder to /consulting/; vercel.json's cleanUrls does the same on Vercel
  build: { format: 'file' },
  // the consulting page moved when 'AI컨설팅' became 'IT 컨설팅·개발'; old links still land on it. The -ko pages are the
  // old site's Korean addresses (index-ko.html etc.); its English privacy.html and terms.html now open the Korean ones
  redirects: { '/ai-consulting': '/consulting', '/index-ko': '/', '/privacy-ko': '/privacy', '/terms-ko': '/terms' },
  // the dev toolbar's floating badge read as a "ChatGPT mark" in the review meeting (2026-11-16); it only ever showed on the dev server
  devToolbar: { enabled: false },
  integrations: [
    // sitemap-index.xml with each page's Korean and English addresses side by side; redirect stubs and 404 left out
    sitemap({
      i18n: { defaultLocale: 'ko', locales: { ko: 'ko', en: 'en' } },
      filter: (page) => !/\/(ai-consulting|index-ko|privacy-ko|terms-ko|404)$/.test(page.replace(/\/$/, '')),
    }),
  ],
});
