import { createClient, SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import { beforeAll, describe, it } from 'jsr:@std/testing/bdd';
import { expect } from 'jsr:@std/expect';
import { load } from 'https://deno.land/std@0.224.0/dotenv/mod.ts';

let supabaseClient: SupabaseClient;

describe('test', () => {
  beforeAll(async () => {
    const env = await load({ envPath: '.env.test' });
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const databaseUrl = env.DATABASE_URL;

    expect(supabaseUrl).toBeDefined();
    expect(supabaseKey).toBeDefined();
    expect(databaseUrl).toBeDefined();

    supabaseClient = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  });

  it('test', async () => {
    const { data, error } = await supabaseClient
      .from('puzzle')
      .select('*')
      .limit(10);
    console.log('data', data);
    console.log('error', error);
    expect(data?.length).toBe(0);
  });
});
