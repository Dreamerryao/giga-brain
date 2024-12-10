import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { supabase } from '@repo/lib/src/supabase';
import { useMemo } from 'react';

import { Tables } from '@/lib/db-types';
import { ChatMode } from '@/types';
import { useSolanaWallet } from '@/providers/solana/wallet/wallet';

const MESSAGES_PER_PAGE = 20;
const POLLING_INTERVAL = 10_000;

const QUERY_SELECT_FIELDS = `
  id,
  content,
  solver,
  created_at,
  is_user,
  is_winner,
  fee
`;

export type AgentPageItemMessage = {
  id: Tables<'puzzle_message'>['id'];
  content: Tables<'puzzle_message'>['content'];
  solver: Tables<'puzzle_message'>['solver'];
  created_at: Tables<'puzzle_message'>['created_at'];
  fee: Tables<'puzzle_message'>['fee'];
  is_user: Tables<'puzzle_message'>['is_user'];
  is_winner: Tables<'puzzle_message'>['is_winner'];
};

export const AGENT_MESSAGES_QUERY_KEY = 'useAgentMessagesQuery';

export function useAgentMessagesQuery(puzzlePubkey: string, mode: ChatMode) {
  const { publicKey } = useSolanaWallet();

  const isMyChat = mode === 'personal';
  const solverPubkey = publicKey?.toBase58() ?? null;

  const {
    data: olderMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: [
      AGENT_MESSAGES_QUERY_KEY,
      puzzlePubkey,
      'older',
      mode,
      solverPubkey,
    ],
    queryFn: (params) =>
      fetchOlderMessages(
        puzzlePubkey,
        params.pageParam,
        solverPubkey,
        isMyChat
      ),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: new Date().toISOString(),
  });

  const latestAttemptTimestamp = olderMessages?.pages[0]?.data[0]?.created_at;

  const { data: newMessages } = useQuery({
    queryKey: [
      AGENT_MESSAGES_QUERY_KEY,
      puzzlePubkey,
      'newer',
      mode,
      solverPubkey,
      latestAttemptTimestamp,
    ],
    queryFn: () =>
      fetchNewMessages(
        puzzlePubkey,
        latestAttemptTimestamp,
        solverPubkey,
        isMyChat
      ),
    // enabled: !!latestAttemptTimestamp,
    refetchInterval: POLLING_INTERVAL,
  });

  const flattenOlderMessages = useMemo(
    () => olderMessages?.pages.flatMap((page) => page.data) ?? [],
    [olderMessages]
  );

  return {
    olderMessages: flattenOlderMessages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    newMessages,
  };
}

async function fetchOlderMessages(
  puzzlePubkey: string,
  date: string | null,
  solverPubkey: string | null,
  isMyChat: boolean
) {
  let query = supabase
    .from('puzzle_message')
    .select(QUERY_SELECT_FIELDS)
    .eq('puzzle', puzzlePubkey);
  if (isMyChat) {
    if (solverPubkey) {
      query = query.eq('solver', solverPubkey);
    } else {
      return {
        data: [],
        nextCursor: null,
        hasMore: false,
      };
    }
  }
  if (date) {
    query = query.lt('created_at', date);
  }
  query = query.order('created_at', { ascending: false });

  const { data, error } = await query.limit(MESSAGES_PER_PAGE);
  if (error) throw error;

  const hasMore = data.length === MESSAGES_PER_PAGE;
  const nextCursor = data[data.length - 1]?.created_at;

  return {
    data,
    nextCursor,
    hasMore,
  };
}

async function fetchNewMessages(
  puzzlePubkey: string,
  latestTimestamp: string | null,
  solverPubkey: string | null,
  isMyChat: boolean
) {
  let query = supabase
    .from('puzzle_message')
    .select(QUERY_SELECT_FIELDS)
    .eq('puzzle', puzzlePubkey);
  if (isMyChat) {
    if (solverPubkey) {
      query = query.eq('solver', solverPubkey);
    } else {
      return [];
    }
  }
  if (latestTimestamp) {
    query = query.gt('created_at', latestTimestamp);
  }
  query = query.order('created_at', { ascending: false });

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;

  return data;
}
