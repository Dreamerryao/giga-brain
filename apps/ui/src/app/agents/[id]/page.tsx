import { supabase } from '@repo/lib/src/supabase';

import { AgentHeader, ChatContainer } from '@/components/pages/agent';
import { PageLayout } from '@/components/shared/PageLayout';
import { AgentPageProvider } from '@/components/pages/agent/AgentPageProvider';

export default async function AgentPage({
  params,
}: {
  params: { id: string };
}) {
  const agentPubkey = params.id;
  const { data: agents } = await supabase
    .from('puzzle')
    .select(
      `
      public_key
    `
    )
    .eq('public_key', agentPubkey)
    .limit(1);

  return (
    <PageLayout footer={false}>
      {!agents?.length ? (
        <div className='text-center py-12'>
          <p className='text-zinc-400'>Agent not found</p>
        </div>
      ) : (
        <AgentPageProvider pubkey={agentPubkey}>
          <AgentHeader />
          <ChatContainer />
        </AgentPageProvider>
      )}
    </PageLayout>
  );
}
