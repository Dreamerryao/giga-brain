export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      game: {
        Row: {
          admin: string;
          giga_circulating_supply: number;
          giga_market_cap: number;
          giga_price: number;
          giga_volume_24h: number;
          max_attempts: number;
          prompts_verifier: string;
          public_key: string;
          puzzle_attempt_final_timeout_seconds: number;
          puzzle_attempt_timeout_seconds: number;
          puzzles_verifier: string;
          sol_price: number;
          total_active_puzzles_funds_usd: number;
          total_attempts_made: number;
          total_puzzles_created: number;
          total_puzzles_solved: number;
          total_puzzles_timed_out: number;
        };
        Insert: {
          admin: string;
          giga_circulating_supply?: number;
          giga_market_cap?: number;
          giga_price?: number;
          giga_volume_24h?: number;
          max_attempts: number;
          prompts_verifier: string;
          public_key: string;
          puzzle_attempt_final_timeout_seconds: number;
          puzzle_attempt_timeout_seconds: number;
          puzzles_verifier: string;
          sol_price?: number;
          total_active_puzzles_funds_usd?: number;
          total_attempts_made?: number;
          total_puzzles_created?: number;
          total_puzzles_solved?: number;
          total_puzzles_timed_out?: number;
        };
        Update: {
          admin?: string;
          giga_circulating_supply?: number;
          giga_market_cap?: number;
          giga_price?: number;
          giga_volume_24h?: number;
          max_attempts?: number;
          prompts_verifier?: string;
          public_key?: string;
          puzzle_attempt_final_timeout_seconds?: number;
          puzzle_attempt_timeout_seconds?: number;
          puzzles_verifier?: string;
          sol_price?: number;
          total_active_puzzles_funds_usd?: number;
          total_attempts_made?: number;
          total_puzzles_created?: number;
          total_puzzles_solved?: number;
          total_puzzles_timed_out?: number;
        };
        Relationships: [];
      };
      indexer_txns: {
        Row: {
          block_time: number;
          data: string;
          events: string;
          id: number;
          parsed_ixs: string;
          partially_decoded_ixs: string;
          process_state: number | null;
          pub_key: string;
          signature: string;
          slot: number;
        };
        Insert: {
          block_time: number;
          data: string;
          events: string;
          id?: number;
          parsed_ixs: string;
          partially_decoded_ixs: string;
          process_state?: number | null;
          pub_key: string;
          signature: string;
          slot: number;
        };
        Update: {
          block_time?: number;
          data?: string;
          events?: string;
          id?: number;
          parsed_ixs?: string;
          partially_decoded_ixs?: string;
          process_state?: number | null;
          pub_key?: string;
          signature?: string;
          slot?: number;
        };
        Relationships: [];
      };
      message: {
        Row: {
          content: string;
          created_at: string;
          hash: string;
          id: number;
        };
        Insert: {
          content: string;
          created_at?: string;
          hash: string;
          id?: number;
        };
        Update: {
          content?: string;
          created_at?: string;
          hash?: string;
          id?: number;
        };
        Relationships: [];
      };
      player_activity: {
        Row: {
          first_activity_at: string;
          last_activity_at: string;
          public_key: string;
          total_attempts_made: number;
          total_earnings_usd: number;
          total_fees_paid_usd: number;
          total_puzzles_created: number;
          total_puzzles_solved: number;
          total_puzzles_timed_out: number;
        };
        Insert: {
          first_activity_at?: string;
          last_activity_at?: string;
          public_key: string;
          total_attempts_made?: number;
          total_earnings_usd?: number;
          total_fees_paid_usd?: number;
          total_puzzles_created?: number;
          total_puzzles_solved?: number;
          total_puzzles_timed_out?: number;
        };
        Update: {
          first_activity_at?: string;
          last_activity_at?: string;
          public_key?: string;
          total_attempts_made?: number;
          total_earnings_usd?: number;
          total_fees_paid_usd?: number;
          total_puzzles_created?: number;
          total_puzzles_solved?: number;
          total_puzzles_timed_out?: number;
        };
        Relationships: [];
      };
      player_activity_log: {
        Row: {
          created_at: string;
          data: string;
          event: Database['public']['Enums']['player_activity_log_event'];
          id: number;
          player: string;
          puzzle: string;
        };
        Insert: {
          created_at?: string;
          data: string;
          event: Database['public']['Enums']['player_activity_log_event'];
          id?: number;
          player: string;
          puzzle: string;
        };
        Update: {
          created_at?: string;
          data?: string;
          event?: Database['public']['Enums']['player_activity_log_event'];
          id?: number;
          player?: string;
          puzzle?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'player_activity_log_puzzle_puzzle_public_key_fk';
            columns: ['puzzle'];
            isOneToOne: false;
            referencedRelation: 'puzzle';
            referencedColumns: ['public_key'];
          },
        ];
      };
      player_currency_stats: {
        Row: {
          mint: string;
          player: string;
          total_fees_paid: number;
          total_solved_prizes_value: number;
          total_timed_out_prizes_value: number;
        };
        Insert: {
          mint: string;
          player: string;
          total_fees_paid?: number;
          total_solved_prizes_value?: number;
          total_timed_out_prizes_value?: number;
        };
        Update: {
          mint?: string;
          player?: string;
          total_fees_paid?: number;
          total_solved_prizes_value?: number;
          total_timed_out_prizes_value?: number;
        };
        Relationships: [];
      };
      puzzle: {
        Row: {
          attempt_final_timeout_seconds: number;
          attempt_timeout_seconds: number;
          avatar_url: string;
          created_at: string;
          creator: string;
          currency_base_fee: number;
          currency_max_fee: number;
          currency_mint: string;
          currency_service_fee_bps: number;
          current_fee: number;
          final_timer_start_at: number | null;
          initial_prize: number;
          last_attempt_max_fee: number | null;
          last_attempt_prompt: string | null;
          last_attempt_solver: string | null;
          last_attempt_timestamp: number | null;
          last_resolved_at: number | null;
          max_attempts: number;
          metadata: string;
          model: string;
          name: string;
          nonce: number;
          prompt: string;
          public_key: string;
          service_share: number | null;
          solved_at: number | null;
          solver: string | null;
          solver_share: number | null;
          status: string;
          total_attempts_made: number;
          total_fees_paid: number;
          total_funds_usd: number;
        };
        Insert: {
          attempt_final_timeout_seconds: number;
          attempt_timeout_seconds: number;
          avatar_url: string;
          created_at?: string;
          creator: string;
          currency_base_fee: number;
          currency_max_fee: number;
          currency_mint: string;
          currency_service_fee_bps: number;
          current_fee: number;
          final_timer_start_at?: number | null;
          initial_prize: number;
          last_attempt_max_fee?: number | null;
          last_attempt_prompt?: string | null;
          last_attempt_solver?: string | null;
          last_attempt_timestamp?: number | null;
          last_resolved_at?: number | null;
          max_attempts: number;
          metadata: string;
          model: string;
          name: string;
          nonce: number;
          prompt: string;
          public_key: string;
          service_share?: number | null;
          solved_at?: number | null;
          solver?: string | null;
          solver_share?: number | null;
          status: string;
          total_attempts_made?: number;
          total_fees_paid?: number;
          total_funds_usd?: number;
        };
        Update: {
          attempt_final_timeout_seconds?: number;
          attempt_timeout_seconds?: number;
          avatar_url?: string;
          created_at?: string;
          creator?: string;
          currency_base_fee?: number;
          currency_max_fee?: number;
          currency_mint?: string;
          currency_service_fee_bps?: number;
          current_fee?: number;
          final_timer_start_at?: number | null;
          initial_prize?: number;
          last_attempt_max_fee?: number | null;
          last_attempt_prompt?: string | null;
          last_attempt_solver?: string | null;
          last_attempt_timestamp?: number | null;
          last_resolved_at?: number | null;
          max_attempts?: number;
          metadata?: string;
          model?: string;
          name?: string;
          nonce?: number;
          prompt?: string;
          public_key?: string;
          service_share?: number | null;
          solved_at?: number | null;
          solver?: string | null;
          solver_share?: number | null;
          status?: string;
          total_attempts_made?: number;
          total_fees_paid?: number;
          total_funds_usd?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'puzzle_solver_player_activity_public_key_fk';
            columns: ['solver'];
            isOneToOne: false;
            referencedRelation: 'player_activity';
            referencedColumns: ['public_key'];
          },
        ];
      };
      puzzle_attempt: {
        Row: {
          created_at: string;
          id: number;
          prompt: string;
          puzzle: string;
          response: string | null;
          solver: string;
        };
        Insert: {
          created_at?: string;
          id?: number;
          prompt: string;
          puzzle: string;
          response?: string | null;
          solver: string;
        };
        Update: {
          created_at?: string;
          id?: number;
          prompt?: string;
          puzzle?: string;
          response?: string | null;
          solver?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'puzzle_attempt_puzzle_puzzle_public_key_fk';
            columns: ['puzzle'];
            isOneToOne: false;
            referencedRelation: 'puzzle';
            referencedColumns: ['public_key'];
          },
        ];
      };
      puzzle_currency: {
        Row: {
          base_fee: number;
          decimals: number;
          max_fee: number;
          minimum_initial_prize: number;
          mint: string;
          service_fee_bps: number;
          total_fees_paid: number;
          total_prizes_escrowed: number;
          total_service_fees_paid: number;
          total_solved_prizes_value: number;
          total_timed_out_prizes_value: number;
        };
        Insert: {
          base_fee: number;
          decimals: number;
          max_fee: number;
          minimum_initial_prize: number;
          mint: string;
          service_fee_bps: number;
          total_fees_paid?: number;
          total_prizes_escrowed?: number;
          total_service_fees_paid?: number;
          total_solved_prizes_value?: number;
          total_timed_out_prizes_value?: number;
        };
        Update: {
          base_fee?: number;
          decimals?: number;
          max_fee?: number;
          minimum_initial_prize?: number;
          mint?: string;
          service_fee_bps?: number;
          total_fees_paid?: number;
          total_prizes_escrowed?: number;
          total_service_fees_paid?: number;
          total_solved_prizes_value?: number;
          total_timed_out_prizes_value?: number;
        };
        Relationships: [];
      };
      puzzle_message: {
        Row: {
          content: string;
          created_at: string;
          fee: number;
          id: number;
          is_user: boolean;
          is_winner: boolean;
          puzzle: string;
          solver: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          fee: number;
          id?: number;
          is_user: boolean;
          is_winner?: boolean;
          puzzle: string;
          solver: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          fee?: number;
          id?: number;
          is_user?: boolean;
          is_winner?: boolean;
          puzzle?: string;
          solver?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'puzzle_message_puzzle_puzzle_public_key_fk';
            columns: ['puzzle'];
            isOneToOne: false;
            referencedRelation: 'puzzle';
            referencedColumns: ['public_key'];
          },
        ];
      };
      token_trades: {
        Row: {
          from_token_address: string;
          from_token_amount: number;
          kind: string;
          price_from_in_currency_token: number;
          price_from_in_usd: number;
          price_to_in_currency_token: number;
          price_to_in_usd: number;
          to_token_address: string;
          to_token_amount: number;
          tx_from_address: string;
          tx_hash: string;
          volume_in_usd: number;
        };
        Insert: {
          from_token_address: string;
          from_token_amount: number;
          kind: string;
          price_from_in_currency_token: number;
          price_from_in_usd: number;
          price_to_in_currency_token: number;
          price_to_in_usd: number;
          to_token_address: string;
          to_token_amount: number;
          tx_from_address: string;
          tx_hash: string;
          volume_in_usd: number;
        };
        Update: {
          from_token_address?: string;
          from_token_amount?: number;
          kind?: string;
          price_from_in_currency_token?: number;
          price_from_in_usd?: number;
          price_to_in_currency_token?: number;
          price_to_in_usd?: number;
          to_token_address?: string;
          to_token_amount?: number;
          tx_from_address?: string;
          tx_hash?: string;
          volume_in_usd?: number;
        };
        Relationships: [];
      };
      verifier_txns: {
        Row: {
          block_time: number;
          data: string;
          events: string;
          id: number;
          parsed_ixs: string;
          partially_decoded_ixs: string;
          process_state: number | null;
          pub_key: string;
          signature: string;
          slot: number;
        };
        Insert: {
          block_time: number;
          data: string;
          events: string;
          id?: number;
          parsed_ixs: string;
          partially_decoded_ixs: string;
          process_state?: number | null;
          pub_key: string;
          signature: string;
          slot: number;
        };
        Update: {
          block_time?: number;
          data?: string;
          events?: string;
          id?: number;
          parsed_ixs?: string;
          partially_decoded_ixs?: string;
          process_state?: number | null;
          pub_key?: string;
          signature?: string;
          slot?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      player_activity_log_event:
        | 'PuzzleCreated'
        | 'PuzzleAttempted'
        | 'PuzzleApprovedTransfer'
        | 'PuzzleRejectedTransfer'
        | 'PuzzleClaimedPrize'
        | 'PuzzleClaimedTimeOut';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
    ? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;
