import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import type { FrameTemplate } from "../../types/FrameTemplate";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

export function useFrameTemplates() {
  //フレームテンプレートのデータ
  const [templates, setTemplates] = useState<FrameTemplate[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = async () => {
    const { data, error: fetchError } = await supabase
      .from("frame_templates")
      .select("*");
    if (fetchError) setError(fetchError.message);
    else if (data) setTemplates(data);
  };

  useEffect(() => {
    //初回データをフェッチ
    fetchTemplates();

    // リアルタイムリスナーを設定
    const channel = supabase
      .channel("frame_templates_changes") // ユニークなチャンネル名
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "frame_templates" }, // 'frame_templates'テーブルの全てのイベントを購読
        (payload) => {
          console.log("Template Change received!", payload);
          if (payload.eventType === "INSERT") {
            setTemplates((prev) => [...prev, payload.new as FrameTemplate]);
          } else if (payload.eventType === "UPDATE") {
            setTemplates((prev) =>
              prev.map((tpl) =>
                tpl.id === (payload.new as FrameTemplate).id
                  ? (payload.new as FrameTemplate)
                  : tpl
              )
            );
          } else if (payload.eventType === "DELETE") {
            setTemplates((prev) =>
              prev.filter((tpl) => tpl.id !== (payload.old as FrameTemplate).id)
            );
          }
        }
      )
      .subscribe();

    //クリーンアップ関数
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    templates,
    error,
    addTemplate: async (name: string, frame: string) => {
      setError(null);
      const { error: insertError } = await supabase.from("frame_templates").insert([{ name, frame }]);
      if (insertError) {
        setError(insertError.message);
      }
    },
    updateTemplate: async (id: number, name: string, frame: string) => {
      setError(null);
      const { error: updateError } = await supabase.from("frame_templates").update({ name, frame }).eq("id", id);
      if (updateError) {
        setError(updateError.message);
      }
    },
    deleteTemplate: async (id: number) => {
      setError(null);
      const { error: deleteError } = await supabase.from("frame_templates").delete().eq("id", id);
      if (deleteError) {
        setError(deleteError.message);
      }
    },
  };
}
