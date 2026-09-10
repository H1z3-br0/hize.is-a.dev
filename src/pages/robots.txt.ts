import { origin } from '../config/site.ts';
import { flagPart2Encoded } from '../config/challenge.ts';

const NL = String.fromCharCode(10);

const body = [
  'User-agent: *',
  'Allow: /',
  '',
  `Sitemap: ${origin}/sitemap.xml`,
  '',
  '# Ничего запрещать здесь нечего: сайт статический и весь публичный.',
  `# ${flagPart2Encoded}`,
  '',
].join(NL);

export const GET = () =>
  new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
