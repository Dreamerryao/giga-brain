import { supabase } from '@repo/lib/src/supabase';

export async function GET() {
  let supply = 0;
  const { data: games } = await supabase
    .from('game')
    .select('giga_circulating_supply')
    .limit(1);
  if (games) {
    supply = games[0]?.giga_circulating_supply ?? 0;
  }
  return Response.json({ result: supply.toString() });
}
