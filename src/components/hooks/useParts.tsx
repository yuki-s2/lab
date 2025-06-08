import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Part } from "../../types/Part";
import { insertContentToDeepestElement } from "../../lib/insertContentToDeepestElement";

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
        .from("parts")
        .select("id, name, content, frame");
        
        if (error) {
          setError(error.message);
        } else if (data) {
          setParts(data as Part[]); 
        }
        setLoading(false);
    };

    fetchParts();
  }, []);

  return {
    parts,
    loading,
    error,
    addPart: async (
      name: string,
      frame: string,
      frameId: number,
      content: string
    ) => {
      const processedFrame = insertContentToDeepestElement(frame, content);
      const { error } = await supabase.from("parts").insert([
        {
          name: name.trim(),
          frame: processedFrame,
          frame_id: frameId,
          content: content.trim() || null,
        },
      ]);
      if (error) setError(error.message);
    },
    updatePart: async (id: number, name: string, content: string) => {
      await supabase.from("parts").update({ name, content }).eq("id", id);
    },
    deletePart: async (id: number) => {
      await supabase.from("parts").delete().eq("id", id);
    },
  };
}
