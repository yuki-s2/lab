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
      .select("id, name, content, part");

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
      .channel("parts_changes") // 任意のユニークなチャンネル名
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "parts" }, // 'parts'テーブルの全てのイベントを購読
        (payload) => {
          console.log("Change received!", payload);
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
      .subscribe(); // 購読を開始

    //クリーンアップ
    return () => {
      supabase.removeChannel(channel); // コンポーネントがアンマウントされたら購読を解除
    };
  }, []);

  return {
    parts,
    loading,
    error,
    addPart: async (
      name: string,
      part: string,
      frameId: number,
      content: string
    ) => {
      const processedPart = insertContentToDeepestElement(part, content);
      const { error: insertError } = await supabase.from("parts").insert([
        {
          name: name.trim(),
          part: processedPart,
          frame_id: frameId,
          content: content.trim() || null,
        },
      ]);
      if (insertError) setError(insertError.message);
    },
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
  };
}
