import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { FrameTemplate } from '../../types/FrameTemplate';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL!,
    import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export function useFrameTemplates() {
  const [templates, setTemplates] = useState<FrameTemplate[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('frame_templates')
      .select('*')
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else if (data) setTemplates(data);
      });
  }, []);

  return {
    templates,
    error,
    addTemplate: async (name: string, frame: string) => {
      await supabase.from('frame_templates').insert([{ name, frame }]);
    },
    updateTemplate: async (id: number, name: string, frame: string) => {
      await supabase.from('frame_templates').update({ name, frame }).eq('id', id);
    },
    deleteTemplate: async (id: number) => {
      await supabase.from('frame_templates').delete().eq('id', id);
    },
  };
}
