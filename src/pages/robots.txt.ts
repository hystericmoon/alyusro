import type { APIRoute } from 'astro';

// Mirrors the noindex meta in BaseLayout: previews are closed to crawlers.
export const GET: APIRoute = () => {
  const indexable = import.meta.env.PUBLIC_INDEXABLE === 'true';
  const body = indexable ? 'User-agent: *\nDisallow: /admin/\n' : 'User-agent: *\nDisallow: /\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
