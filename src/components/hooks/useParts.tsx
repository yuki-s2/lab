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

  const fetchParts = async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("parts")
      .select("*")
      .order("order_index", { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
    } else if (data) {
      setParts(data as Part[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    //初回データをフェッチ
    fetchParts();

    //リアルタイムリスナーを設定
    const channel = supabase
      .channel("parts_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "parts" },
        (payload) => {
          // イベントの種類に応じてステートを更新
          if (payload.eventType === "INSERT") {
            setParts((prev) => [...prev, payload.new as Part]);
          } else if (payload.eventType === "UPDATE") {
            setParts((prev) =>
              prev.map((part) =>
                part.id === (payload.new as Part).id
                  ? (payload.new as Part)
                  : part
              )
            );
          } else if (payload.eventType === "DELETE") {
            setParts((prev) =>
              prev.filter((part) => part.id !== (payload.old as Part).id)
            );
          }
        }
      )
      .subscribe();

    //クリーンアップ
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    parts,
    loading,
    error,

    // パーツを追加
    addPart: async (
      name: string,
      frame: string,
      frameId: number,
      content: string
    ): Promise<Part | null> => {
      const processedFrame = insertContentToDeepestElement(frame, content);
      const maxOrderIndex =
        parts.length > 0 ? Math.max(...parts.map((p) => p.order_index)) : -1;

      const uid = `part-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const { data, error: insertError } = await supabase
        .from("parts")
        .insert([
          {
            name: name.trim(),
            frame: processedFrame,
            frame_id: frameId,
            content: content.trim() || null,
            order_index: maxOrderIndex + 1,
            uid: uid,
          },
        ])
        .select();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      return (data?.[0] as Part) || null;
    },

    // パーツを更新
    updatePart: async (id: number, name: string, content: string) => {
      setError(null);
      const { error: updateError } = await supabase
        .from("parts")
        .update({ name, content })
        .eq("id", id);
      if (updateError) {
        setError(updateError.message);
      }
    },

    // パーツを削除
    deletePart: async (id: number) => {
      setError(null);
      const { error: deleteError } = await supabase
        .from("parts")
        .delete()
        .eq("id", id);
      if (deleteError) {
        setError(deleteError.message);
      }
    },

    // パーツの順番を更新
    updatePartsOrder: async (
      orderedParts: { id: number; order_index: number }[]
    ) => {
      setError(null);

      for (const { id, order_index } of orderedParts) {
        const { error: updateError } = await supabase
          .from("parts")
          .update({ order_index })
          .eq("id", id);

        if (updateError) {
          setError(updateError.message);
          break;
        }
      }
    },

    // 全パーツをクリア
    clearParts: async () => {
      setError(null);
      const { error: deleteError } = await supabase
        .from("parts")
        .delete()
        .neq("id", 0); // 全て削除

      if (deleteError) {
        setError(deleteError.message);
      }
    },
  };
}
