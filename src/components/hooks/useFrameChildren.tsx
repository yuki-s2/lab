import { useEffect, useState } from "react";
import type {
  FrameChild,
  CreateFrameChildParams,
  UpdateFrameChildParams,
} from "../../types/FrameChild";
import { supabase } from "../../lib/supabase";

export function useFrameChildren() {
  const [frameChildren, setFrameChildren] = useState<FrameChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFrameChildren = async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("frame_children")
      .select("*")
      .order("parent_id, order_index", { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
    } else if (data) {
      setFrameChildren(data as FrameChild[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    // 初回データをフェッチ
    fetchFrameChildren();

    // リアルタイムリスナーを設定
    const channel = supabase
      .channel("frame_children_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "frame_children" },
        (payload) => {
          console.log("🔄 Frame Children Real-time event:", payload);
          // イベントの種類に応じてステートを更新
          if (payload.eventType === "INSERT") {
            setFrameChildren((prev) => [...prev, payload.new as FrameChild]);
          } else if (payload.eventType === "UPDATE") {
            setFrameChildren((prev) =>
              prev.map((child) =>
                child.id === (payload.new as FrameChild).id
                  ? (payload.new as FrameChild)
                  : child
              )
            );
          } else if (payload.eventType === "DELETE") {
            setFrameChildren((prev) =>
              prev.filter(
                (child) => child.id !== (payload.old as FrameChild).id
              )
            );
          }
        }
      )
      .subscribe();

    // クリーンアップ
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    frameChildren,
    loading,
    error,

    // 手動でデータを再取得
    refreshFrameChildren: fetchFrameChildren,

    // 特定の親の子要素を取得
    getChildrenByParent: (
      parentId: number,
      parentType: "template" | "child"
    ) => {
      return frameChildren
        .filter(
          (child) =>
            child.parent_id === parentId && child.parent_type === parentType
        )
        .sort((a, b) => a.order_index - b.order_index);
    },

    // 再帰的に子要素を含む階層構造を構築
    buildHierarchy: (
      parentId: number,
      parentType: "template" | "child"
    ): FrameChild[] => {
      const children = frameChildren
        .filter(
          (child) =>
            child.parent_id === parentId && child.parent_type === parentType
        )
        .sort((a, b) => a.order_index - b.order_index);

      return children.map((child) => ({
        ...child,
        children:
          frameChildren.length > 0 ? buildHierarchy(child.id, "child") : [],
      }));

      function buildHierarchy(
        id: number,
        type: "frame" | "child"
      ): FrameChild[] {
        const subChildren = frameChildren
          .filter(
            (child) => child.parent_id === id && child.parent_type === type
          )
          .sort((a, b) => a.order_index - b.order_index);

        return subChildren.map((child) => ({
          ...child,
          children: buildHierarchy(child.id, "child"),
        }));
      }
    },

    // 子要素を追加
    addChild: async (
      params: CreateFrameChildParams
    ): Promise<FrameChild | null> => {
      setError(null);

      // 最大order_indexを取得
      const siblings = frameChildren.filter(
        (child) =>
          child.parent_id === params.parent_id &&
          child.parent_type === params.parent_type
      );
      const maxOrderIndex =
        siblings.length > 0
          ? Math.max(...siblings.map((s) => s.order_index))
          : -1;

      const insertData = {
        parent_id: params.parent_id,
        parent_type: params.parent_type,
        name: params.name.trim(),
        content: params.content.trim(),
        order_index: maxOrderIndex + 1,
      };

      const { data, error: insertError } = await supabase
        .from("frame_children")
        .insert([insertData])
        .select();

      if (insertError) {
        console.error("Frame children insert error:", insertError);
        setError(insertError.message);
        return null;
      }

      if (!data || data.length === 0) {
        setError("データが返されませんでした");
        return null;
      }

      return data[0] as FrameChild;
    },

    // 子要素を更新
    updateChild: async (params: UpdateFrameChildParams): Promise<void> => {
      setError(null);

      const updateData: any = {};
      if (params.name !== undefined) updateData.name = params.name.trim();
      if (params.content !== undefined)
        updateData.content = params.content.trim();
      if (params.order_index !== undefined)
        updateData.order_index = params.order_index;
      updateData.updated_at = new Date().toISOString();

      const { error: updateError } = await supabase
        .from("frame_children")
        .update(updateData)
        .eq("id", params.id);

      if (updateError) {
        setError(updateError.message);
      }
    },

    // 子要素を削除
    deleteChild: async (id: number): Promise<void> => {
      setError(null);

      // 再帰削除のためのヘルパー関数
      const deleteRecursively = async (targetId: number): Promise<void> => {
        // まず、この要素の子要素も削除（CASCADE）
        const childrenToDelete = frameChildren.filter(
          (child) =>
            child.parent_id === targetId && child.parent_type === "child"
        );

        for (const child of childrenToDelete) {
          await deleteRecursively(child.id);
        }

        const { error: deleteError } = await supabase
          .from("frame_children")
          .delete()
          .eq("id", targetId);

        if (deleteError) {
          setError(deleteError.message);
          throw deleteError;
        }
      };

      await deleteRecursively(id);
    },

    // 子要素の順序を更新
    updateChildrenOrder: async (
      _parentId: number,
      _parentType: "template" | "child",
      orderedIds: number[]
    ): Promise<void> => {
      setError(null);

      for (let i = 0; i < orderedIds.length; i++) {
        const { error: updateError } = await supabase
          .from("frame_children")
          .update({ order_index: i })
          .eq("id", orderedIds[i]);

        if (updateError) {
          setError(updateError.message);
          break;
        }
      }
    },

    // 手動でデータを再取得
    refetch: fetchFrameChildren,
  };
}
