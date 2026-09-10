import { card } from '../lib/card.ts';

export const GET = () =>
  new Response(card('ru'), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
