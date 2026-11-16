import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://syinnovation.net',
  // the consulting page moved when 'AI컨설팅' became 'IT 컨설팅·개발'; old links still land on it
  redirects: { '/ai-consulting': '/consulting' },
  // the dev toolbar's floating badge read as a "ChatGPT mark" in the review meeting (2026-11-16); it only ever showed on the dev server
  devToolbar: { enabled: false },
});
