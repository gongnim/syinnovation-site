import { defineMiddleware } from 'astro:middleware';
import { breakSentences, keepNamesTogether } from './lib/sentence-breaks.js';

// Applies the line-break house style to every HTML page (at build time for static pages).
export const onRequest = defineMiddleware(async (_ctx, next) => {
  const res = await next();
  if (!res.headers.get('content-type')?.includes('text/html')) return res;
  const headers = new Headers(res.headers);
  headers.delete('content-length');
  return new Response(keepNamesTogether(breakSentences(await res.text())), { status: res.status, statusText: res.statusText, headers });
});
