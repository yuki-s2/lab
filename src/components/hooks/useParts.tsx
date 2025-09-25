import { useEffect, useState } from "react";
import type { Part } from "../../types/Part";
import { supabase } from "../../lib/supabase";

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

    // 手動でデータを再取得
    refreshParts: fetchParts,

    // パーツを追加‹
    addPart: async (
      name: string,
      frame: string,
      frameId: number,
      selectedChildrenIds: number[] = []
    ): Promise<Part | null> => {
      const maxOrderIndex =
        parts.length > 0 ? Math.max(...parts.map((p) => p.order_index)) : -1;

      const uid = `part-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const insertData = {
        name: name.trim(),
        frame: frame, // フレームはそのまま保存
        frame_id: frameId,
        selected_children_ids: selectedChildrenIds, // 選択された子要素のID配列
        //パーツを一番最後の位置に配置するため存在するパーツの中で最大の order_index を取得
        order_index: maxOrderIndex + 1,
        uid: uid,
      };

      const { data, error: insertError } = await supabase
        .from("parts")
        .insert([insertData])
        .select();

      if (insertError) {
        setError(insertError.message);
        return null;
      }

      return (data?.[0] as Part) || null;
    },

    // パーツを更新
    updatePart: async (
      id: number,
      updates: {
        name?: string;
        selected_children_ids?: number[];
      }
    ) => {
      setError(null);

      const updateData: any = {};

      if (updates.name !== undefined) {
        updateData.name = updates.name;
      }

      if (updates.selected_children_ids !== undefined) {
        updateData.selected_children_ids = updates.selected_children_ids;
      }

      const { error: updateError } = await supabase
        .from("parts")
        .update(updateData)
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

    // パーツの順番とネスト構造を更新
    updatePartsOrder: async (
      orderedParts: {
        id: number;
        order_index: number;
        parent_id?: number | null;
      }[]
    ) => {
      setError(null);

      for (const { id, order_index, parent_id } of orderedParts) {
        const updateData: any = { order_index };

        // parent_idが指定されている場合は更新に含める
        if (parent_id !== undefined) {
          updateData.parent_id = parent_id;
        }

        const { error: updateError } = await supabase
          .from("parts")
          .update(updateData)
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

    // 同じframe_idを持つパーツのframeを一括更新
    updatePartsByFrameId: async (frameId: number, newFrame: string) => {
      setError(null);

      // 同じframe_idを持つパーツを取得
      const { data: targetParts, error: fetchError } = await supabase
        .from("parts")
        .select("*")
        .eq("frame_id", frameId);

      if (fetchError) {
        setError(fetchError.message);
        return;
      }

      if (targetParts && targetParts.length > 0) {
        // 各パーツのframeを新しいテンプレートで更新
        for (const part of targetParts) {
          const { error: updateError } = await supabase
            .from("parts")
            .update({ frame: newFrame })
            .eq("id", part.id);

          if (updateError) {
            setError(updateError.message);
            return;
          }
        }
      }
    },
  };
}
