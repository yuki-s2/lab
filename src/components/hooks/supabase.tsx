import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Part } from '../../types/Part';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export function useParts() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('parts')
        .select('id, name, frame, content');
      if (error) setError(error.message);
      else if (data) setParts(data);
      setLoading(false);
    };

    fetchParts();

    const channel = supabase
      .channel('parts-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'parts' }, payload => {
        setParts(prev => [...prev, payload.new as Part]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'parts' }, payload => {
        const updated = payload.new as Part;
        setParts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'parts' }, payload => {
        setParts(prev => prev.filter(p => p.id !== payload.old?.id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    parts,
    loading,
    error,
    addPart: async (name: string, frame: string) => {
      if (!name.trim() || !frame.trim()) return;
      const { error } = await supabase
        .from('parts')
        .insert([{ name: name.trim(), frame: frame.trim(), content: null }]);
      if (error) setError(error.message);
    },
    updatePart: async (id: number, content: string, frame: string) => {
      const { error } = await supabase
        .from('parts')
        .update({
          content: content.trim() === '' ? null : content.trim(),
          frame: frame.trim(),
        })
        .eq('id', id);
      if (error) setError(error.message);
    },
    deletePart: async (id: number) => {
      const { error } = await supabase.from('parts').delete().eq('id', id);
      if (error) setError(error.message);
    },
  };
}
