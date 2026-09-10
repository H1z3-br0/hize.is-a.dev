import { card } from '../../lib/card.ts';

export const GET = () =>
  new Response(card('en'), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
