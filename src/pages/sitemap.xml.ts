import { origin } from '../config/site.ts';

const NL = String.fromCharCode(10);
const urls = ['/', '/en/'];

const body = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((u) => `  <url><loc>${origin}${u}</loc></url>`),
  '</urlset>',
  '',
].join(NL);

export const GET = () =>
  new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
