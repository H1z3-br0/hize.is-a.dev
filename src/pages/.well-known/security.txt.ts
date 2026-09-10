import { identity, origin } from '../../config/site.ts';

const NL = String.fromCharCode(10);

const expires = new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().replace(/\.\d+Z$/, 'Z');

const lines = [
  `Contact: mailto:${identity.email}`,
  `Contact: https://t.me/${identity.telegram}`,
  `Expires: ${expires}`,
  'Preferred-Languages: ru, en',
  `Canonical: ${origin}/.well-known/security.txt`,
  ...(identity.pgp ? [`Encryption: ${identity.pgp.keyUrl}`] : []),
  '',
];

export const GET = () =>
  new Response(lines.join(NL), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
