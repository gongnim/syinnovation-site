import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // the live address (www.syinnovation.net already redirects here); canonical links, hreflang and the sitemap use it
  site: 'https://syinnovation.net',
  // one address per page, without the trailing slash, as every link on the site is written (vercel.json matches)
  trailingSlash: 'never',
  // the consulting page moved when 'AI컨설팅' became 'IT 컨설팅·개발'; old links still land on it
  redirects: { '/ai-consulting': '/consulting' },
  // the dev toolbar's floating badge read as a "ChatGPT mark" in the review meeting (2026-11-16); it only ever showed on the dev server
  devToolbar: { enabled: false },
  integrations: [
    // sitemap-index.xml with each page's Korean and English addresses side by side; redirect stubs and 404 left out
    sitemap({
      i18n: { defaultLocale: 'ko', locales: { ko: 'ko', en: 'en' } },
      filter: (page) => !/\/(ai-consulting|404)$/.test(page.replace(/\/$/, '')),
    }),
  ],
});
