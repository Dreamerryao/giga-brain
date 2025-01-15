import { sql } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  bigint,
  timestamp,
  integer,
  text,
  serial,
  boolean,
  decimal,
  pgEnum,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { createTxnsTableSchema } from 'solana-anchor-indexer';

export type PuzzleStatus =
  | 'Active'
  | 'Attempted'
  | 'TimedOut'
  | 'ApprovedTransfer'
  | 'Completed';

export const game = pgTable('game', {
  // Primary identifier
  publicKey: varchar('public_key', { length: 44 }).primaryKey(), // Base58 Solana address
  promptsVerifier: varchar('prompts_verifier', { length: 44 }).notNull(),
  puzzlesVerifier: varchar('puzzles_verifier', { length: 44 }).notNull(),
  admin: varchar('admin', { length: 44 }).notNull(),
  puzzleAttemptTimeoutSeconds: integer(
    'puzzle_attempt_timeout_seconds'
  ).notNull(),
  puzzleAttemptFinalTimeoutSeconds: integer(
    'puzzle_attempt_final_timeout_seconds'
  ).notNull(),
  maxAttempts: integer('max_attempts').notNull(),

  totalPuzzlesCreated: bigint('total_puzzles_created', { mode: 'number' })
    .notNull()
    .default(0),
  totalPuzzlesSolved: bigint('total_puzzles_solved', { mode: 'number' })
    .notNull()
    .default(0),
  totalPuzzlesTimedOut: bigint('total_puzzles_timed_out', {
    mode: 'number',
  })
    .notNull()
    .default(0),
  totalAttemptsMade: bigint('total_attempts_made', { mode: 'number' })
    .notNull()
    .default(0),

  solPrice: decimal('sol_price', { precision: 20, scale: 8 })
    .notNull()
    .default('0'),
  gigaPrice: decimal('giga_price', { precision: 20, scale: 8 })
    .notNull()
    .default('0'),
  gigaMarketCap: decimal('giga_market_cap', { precision: 20, scale: 8 })
    .notNull()
    .default('0'),
  gigaVolume24h: decimal('giga_volume_24h', { precision: 20, scale: 8 })
    .notNull()
    .default('0'),
  gigaCirculatingSupply: decimal('giga_circulating_supply', {
    precision: 20,
    scale: 8,
  })
    .notNull()
    .default('0'),

  totalActivePuzzlesFundsUsd: decimal('total_active_puzzles_funds_usd', {
    precision: 65,
    scale: 2,
  })
    .notNull()
    .default('0'),
}).enableRLS();

export const puzzleCurrency = pgTable('puzzle_currency', {
  mint: varchar('mint', { length: 44 }).primaryKey(),
  decimals: integer('decimals').notNull(),
  serviceFeeBps: integer('service_fee_bps').notNull(),
  minimumInitialPrize: bigint('minimum_initial_prize', {
    mode: 'number',
  }).notNull(),
  baseFee: bigint('base_fee', {
    mode: 'number',
  }).notNull(),
  maxFee: bigint('max_fee', {
    mode: 'number',
  }).notNull(),

  totalPuzzlesSolvedValue: bigint('total_solved_prizes_value', {
    mode: 'number',
  })
    .notNull()
    .default(0),
  totalPuzzlesTimedOutValue: bigint('total_timed_out_prizes_value', {
    mode: 'number',
  })
    .notNull()
    .default(0),
  totalFeesPaid: bigint('total_fees_paid', { mode: 'number' })
    .notNull()
    .default(0),
  totalServiceFeesPaid: bigint('total_service_fees_paid', { mode: 'number' })
    .notNull()
    .default(0),
  totalPrizesEscrowed: bigint('total_prizes_escrowed', { mode: 'number' })
    .notNull()
    .default(0),
}).enableRLS();

export const puzzle = pgTable('puzzle', {
  createdAt: timestamp('created_at').defaultNow().notNull(),

  // Primary identifier
  publicKey: varchar('public_key', { length: 44 }).primaryKey(), // Base58 Solana address

  // // Core puzzle data
  creator: varchar('creator', { length: 44 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().$type<PuzzleStatus>(),
  initialPrize: bigint('initial_prize', { mode: 'number' }).notNull(),
  currencyMint: varchar('currency_mint', { length: 44 }).notNull(),
  currencyServiceFeeBps: integer('currency_service_fee_bps').notNull(),
  currencyBaseFee: bigint('currency_base_fee', { mode: 'number' }).notNull(),
  currencyMaxFee: bigint('currency_max_fee', { mode: 'number' }).notNull(),
  maxAttempts: integer('max_attempts').notNull(),
  attemptTimeoutSeconds: bigint('attempt_timeout_seconds', {
    mode: 'number',
  }).notNull(),
  attemptFinalTimeoutSeconds: bigint('attempt_final_timeout_seconds', {
    mode: 'number',
  }).notNull(),
  prompt: text('prompt').notNull(),
  nonce: bigint('nonce', { mode: 'number' }).notNull(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url').notNull(),
  model: text('model').notNull(),
  metadata: text('metadata').notNull(),

  // Attempt tracking
  totalAttemptsMade: bigint('total_attempts_made', { mode: 'number' })
    .notNull()
    .default(0),
  lastResolvedAt: bigint('last_resolved_at', { mode: 'number' }),
  finalTimerStartAt: bigint('final_timer_start_at', { mode: 'number' }),
  currentFee: bigint('current_fee', { mode: 'number' }).notNull(),
  totalFeesPaid: bigint('total_fees_paid', { mode: 'number' })
    .notNull()
    .default(0),

  totalFundsUsd: decimal('total_funds_usd', {
    precision: 65,
    scale: 2,
  })
    .notNull()
    .default('0'),

  // Last Attempt tracking
  lastAttemptSolver: varchar('last_attempt_solver', { length: 44 }),
  lastAttemptPrompt: text('last_attempt_prompt'),
  lastAttemptMaxFee: bigint('last_attempt_max_fee', { mode: 'number' }),
  lastAttemptTimestamp: bigint('last_attempt_timestamp', { mode: 'number' }),

  // Resolution data
  solver: varchar('solver', { length: 44 }).references(
    () => playerActivity.publicKey
  ),
  solvedAt: bigint('solved_at', { mode: 'number' }),
  solverShare: bigint('solver_share', { mode: 'number' }),
  serviceShare: bigint('service_share', { mode: 'number' }),
}).enableRLS();

export const puzzleAttempt = pgTable('puzzle_attempt', {
  // Primary identifier
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),

  // Composite primary key fields
  puzzle: varchar('puzzle', { length: 44 })
    .references(() => puzzle.publicKey)
    .notNull(),
  solver: varchar('solver', { length: 44 }).notNull(),
  prompt: text('prompt').notNull(),
  response: text('response'),
}).enableRLS();

export const puzzleMessage = pgTable('puzzle_message', {
  id: serial('id').primaryKey(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  puzzle: varchar('puzzle', { length: 44 })
    .references(() => puzzle.publicKey)
    .notNull(),
  solver: varchar('solver', { length: 44 }).notNull(),
  isUser: boolean('is_user').notNull(),
  // timestamp: bigint('timestamp', { mode: 'number' }).notNull(),
  content: text('content').notNull(),
  fee: bigint('fee', { mode: 'number' }).notNull(),
  isWinner: boolean('is_winner').notNull().default(false),
}).enableRLS();

export const playerActivity = pgTable('player_activity', {
  // Primary identifier
  publicKey: varchar('public_key', { length: 44 }).primaryKey(),

  // Activity counters
  totalPuzzlesCreated: bigint('total_puzzles_created', { mode: 'number' })
    .notNull()
    .default(0),
  totalAttemptsMade: bigint('total_attempts_made', { mode: 'number' })
    .notNull()
    .default(0),
  totalPuzzlesSolved: bigint('total_puzzles_solved', { mode: 'number' })
    .notNull()
    .default(0),
  totalPuzzlesTimedOut: bigint('total_puzzles_timed_out', {
    mode: 'number',
  })
    .notNull()
    .default(0),

  totalEarningsUsd: decimal('total_earnings_usd', {
    precision: 65,
    scale: 2,
  })
    .notNull()
    .default('0'),
  totalFeesPaidUsd: decimal('total_fees_paid_usd', {
    precision: 65,
    scale: 2,
  })
    .notNull()
    .default('0'),

  // Timestamps
  firstActivityAt: timestamp('first_activity_at').defaultNow().notNull(),
  lastActivityAt: timestamp('last_activity_at').defaultNow().notNull(),
}).enableRLS();

export const playerCurrencyStats = pgTable(
  'player_currency_stats',
  {
    mint: varchar('mint', { length: 44 }).notNull(),
    player: varchar('player', { length: 44 }).notNull(),
    totalFeesPaid: bigint('total_fees_paid', { mode: 'number' })
      .notNull()
      .default(0),
    totalPuzzlesSolvedValue: bigint('total_solved_prizes_value', {
      mode: 'number',
    })
      .notNull()
      .default(0),
    totalPuzzlesTimedOutValue: bigint('total_timed_out_prizes_value', {
      mode: 'number',
    })
      .notNull()
      .default(0),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.player, table.mint] }),
  })
).enableRLS();

export const playerActivityLogEvent = pgEnum('player_activity_log_event', [
  'PuzzleCreated',
  'PuzzleAttempted',
  'PuzzleApprovedTransfer',
  'PuzzleRejectedTransfer',
  'PuzzleClaimedPrize',
  'PuzzleClaimedTimeOut',
]);

export const playerActivityLog = pgTable('player_activity_log', {
  id: serial('id').primaryKey(),
  player: varchar('player', { length: 44 }).notNull(),
  puzzle: varchar('puzzle', { length: 44 })
    .references(() => puzzle.publicKey)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  event: playerActivityLogEvent('event').notNull(),
  data: text('data').notNull(),
}).enableRLS();

export const message = pgTable('message', {
  id: serial('id').primaryKey(), // or bigserial if you need larger range
  hash: text('hash').unique().notNull(),
  content: text('content').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
}).enableRLS();

export const txns = createTxnsTableSchema('indexer_txns');

export const verifierTxns = createTxnsTableSchema('verifier_txns');

export const tokenTrades = pgTable('token_trades', {
  // Block information
  // blockNumber: bigint('block_number', { mode: 'number' }).notNull(),
  // blockTimestamp: timestamp('block_timestamp').notNull(),

  // Transaction identifiers
  txHash: varchar('tx_hash', { length: 88 }).notNull().primaryKey(),
  txFromAddress: varchar('tx_from_address', { length: 44 }).notNull(),

  // Token amounts with high precision
  fromTokenAmount: decimal('from_token_amount', {
    precision: 65,
    scale: 30,
  }).notNull(),
  toTokenAmount: decimal('to_token_amount', {
    precision: 65,
    scale: 30,
  }).notNull(),

  // Price information
  priceFromInCurrencyToken: decimal('price_from_in_currency_token', {
    precision: 65,
    scale: 30,
  }).notNull(),
  priceToInCurrencyToken: decimal('price_to_in_currency_token', {
    precision: 65,
    scale: 30,
  }).notNull(),
  priceFromInUsd: decimal('price_from_in_usd', {
    precision: 65,
    scale: 30,
  }).notNull(),
  priceToInUsd: decimal('price_to_in_usd', {
    precision: 65,
    scale: 30,
  }).notNull(),

  // Volume
  volumeInUsd: decimal('volume_in_usd', { precision: 65, scale: 30 }).notNull(),

  // Token addresses
  fromTokenAddress: varchar('from_token_address', { length: 44 }).notNull(),
  toTokenAddress: varchar('to_token_address', { length: 44 }).notNull(),

  // Transaction type
  kind: text('kind').notNull(),
}).enableRLS();

// const messageHashIndex = pgIndex('message_hash_idx', message.hash);

export const ROLES_SQL = sql`
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated;
  END IF;
  
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon;
  END IF;
  
  -- Grant usage on schema
  GRANT USAGE ON SCHEMA public TO authenticated;
  GRANT USAGE ON SCHEMA public TO anon;
  
  -- Set default privileges for future tables
  ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
  
  ALTER DEFAULT PRIVILEGES IN SCHEMA public 
  GRANT SELECT ON TABLES TO anon;
END
$$;
`;

export const DROP_RLS_SQL = sql`
DO $$
DECLARE
  policy_name TEXT;
  table_name TEXT;
  schema_name TEXT;
BEGIN
  -- Loop through all policies in the database
  FOR policy_name, table_name, schema_name IN
      SELECT policyname, tablename, schemaname
      FROM pg_policies
  LOOP
      -- Dynamically drop each policy
      EXECUTE format(
          'DROP POLICY IF EXISTS %I ON %I.%I;',
          policy_name,
          schema_name,
          table_name
      );
  END LOOP;
END $$;
`;

export const RLS_SQL = sql`

-- property policies

CREATE POLICY "game_select"
ON game FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "puzzle_currency_select"
ON puzzle_currency FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "puzzle_select"
ON puzzle FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "puzzle_attempt_select"
ON puzzle_attempt FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "puzzle_message_select"
ON puzzle_message FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "player_activity_select"
ON player_activity FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "player_activity_log_select"
ON player_activity_log FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "player_currency_stats_select"
ON player_currency_stats FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "message_select"
ON message FOR SELECT
TO anon, authenticated
USING (true);
`;

export const MESSAGE_INSERT_SQL = sql`
CREATE POLICY message_allow_service_role_insert
ON message
FOR INSERT
TO authenticated
WITH CHECK (auth.role() = 'service_role');
`;

export const INDEX_SQL = sql`
CREATE OR REPLACE FUNCTION get_player_rank(player_name text)
RETURNS integer
LANGUAGE sql
AS $$
  SELECT rank 
  FROM (
    SELECT 
      player,
      ROW_NUMBER() OVER (ORDER BY earnings DESC) as rank
    FROM leaderboard
  ) ranked
  WHERE player = player_name;
$$;
`;
