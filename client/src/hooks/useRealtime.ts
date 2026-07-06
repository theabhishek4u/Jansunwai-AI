import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useRealtime(
  channelName: string,
  eventConfig: {
    table: string;
    filter?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onInsert?: (payload: any) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onUpdate?: (payload: any) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onDelete?: (payload: any) => void;
  }
) {
  const { table, filter, onInsert, onUpdate, onDelete } = eventConfig;

  useEffect(() => {
    const channel = supabase.channel(channelName);

    channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
          filter: filter
        },
        (payload) => {
          if (payload.eventType === 'INSERT' && onInsert) {
            onInsert(payload.new);
          } else if (payload.eventType === 'UPDATE' && onUpdate) {
            onUpdate(payload.new);
          } else if (payload.eventType === 'DELETE' && onDelete) {
            onDelete(payload.old);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, table, filter, onInsert, onUpdate, onDelete]);
}
