import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// パーツの型を定義する
interface Part {
  id: number;
  name: string;
  frame: string;
  content: string | null;
}

// フレームの最も深い要素にコンテンツを挿入する関数
function insertContentToDeepestElement(
  frame: string,
  content: string | null
): string {
  // if (!frame) return content || ''; // フレームがない場合はコンテンツのみ

  const parser = new DOMParser();
  const doc = parser.parseFromString(frame, "text/html");
  const root = doc.body.firstElementChild;

  // 最も深い要素（子要素を持たない要素）を見つける関数
  const findDeepestElement = (node: Element): Element => {
    // 子要素の中から最初の要素ノードを見つける
    const firstChildElement = Array.from(node.children).find(
      (child) => child.nodeType === Node.ELEMENT_NODE
    );

    if (firstChildElement) {
      // 要素の子があれば、その最初の要素を再帰的に探索
      return findDeepestElement(firstChildElement);
    } else {
      // 要素の子がなければ、現在のノードが最も深い要素
      return node;
    }
  };

  if (root) {
    const target = findDeepestElement(root);
    // ターゲット要素のinnerHTMLにコンテンツを挿入
    target.innerHTML = content || ""; // contentがnullの場合は空文字列を挿入
    return root.outerHTML; // 変更されたHTML全体を返す
  }

  return frame; // ルート要素が見つからない場合は元のフレームを返す
}

function App() {
  const [parts, setParts] = useState<Part[]>([]);
  const [newPartName, setNewPartName] = useState("");
  const [newPartFrame, setNewPartFrame] = useState("");
  const [selectedPartId, setSelectedPartId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [editingFrame, setEditingFrame] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // データを取得
    const getParts = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("parts")
          .select("id, name, frame, content");

        if (error) setError(error.message);
        else if (data) setParts(data as Part[]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    getParts();

    // リアルタイムリスナーを設定
    const channel = supabase
      .channel("parts-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "parts" },
        (payload) => {
          const newPart = payload.new as Part;
          setParts((prev) => [...prev, newPart]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "parts" },
        (payload) => {
          const updatedPart = payload.new as Part;
          setParts((prev) =>
            prev.map((part) =>
              part.id === updatedPart.id ? updatedPart : part
            )
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "parts" },
        (payload) => {
          const deletedPartId = payload.old?.id;
          if (deletedPartId !== undefined) {
            setParts((prev) =>
              prev.filter((part) => part.id !== deletedPartId)
            );
            // 削除されたパーツが選択中だった場合、選択を解除
            if (selectedPartId === deletedPartId) {
              setSelectedPartId(null);
              setEditingContent("");
              setEditingFrame(""); // 削除時に編集中のフレームもリセット
            }
          }
        }
      )
      .subscribe();

    // コンポーネントのアンマウント時にリスナーを解除
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedPartId]);

  // 新しいフレームを追加
  const handleAddPart = async () => {
    if (!newPartName.trim() || !newPartFrame.trim()) return;

    const { error } = await supabase
      .from("parts")
      .insert([
        {
          name: newPartName.trim(),
          content: null,
          frame: newPartFrame.trim(),
        },
      ])
      .select();

    if (error) {
      setError(error.message);
    }
    setNewPartName("");
    setNewPartFrame("");
  };

  // パーツを選択して中身とフレームを編集する準備
  const handleSelectPartToEdit = (part: Part) => {
    setSelectedPartId(part.id);
    setEditingContent(part.content || "");
    setEditingFrame(part.frame || "");
  };

  // 選択中のパーツの中身とフレームを更新
  const handleUpdatePart = async () => {
    if (selectedPartId === null) return;

    const updatedContent =
      editingContent.trim() === "" ? null : editingContent.trim();
    const updatedFrame = editingFrame.trim();

    // frameが空の場合
    if (!updatedFrame) {
      setError("フレームテンプレートは空にできません。");
      return;
    }

    const { error } = await supabase
      .from("parts")
      .update({ content: updatedContent, frame: updatedFrame })
      .eq("id", selectedPartId);

    if (error) {
      setError(error.message);
    } else {
      setSelectedPartId(null);
      setEditingContent("");
      setEditingFrame("");
    }
  };

  // パーツを削除
  const handleDeletePart = async (id: number) => {
    const { error } = await supabase.from("parts").delete().eq("id", id);

    if (error) {
      setError(error.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div>
        <h2>新しいフレームを追加</h2>
        <div>
          <input
            type="text"
            value={newPartName}
            onChange={(e) => setNewPartName(e.target.value)}
            placeholder="フレームのタイトルを入力"
          />
          <textarea
            value={newPartFrame}
            onChange={(e) => setNewPartFrame(e.target.value)}
            placeholder="フレームテンプレートを入力 (例: <div><h1></h1></div>)"
          />
          <button onClick={handleAddPart}>フレームを保存</button>
        </div>
      </div>

      {/* パーツリスト */}
      <div>
        <h2>パーツを作成</h2>
        {parts.length === 0 ? (
          <p>まだパーツがありません。</p>
        ) : (
          <ul>
            {parts.map((part) => (
              <li key={part.id}>
                <div>
                  <span>{part.name}</span>
                  {/* frameとcontentがある場合のみ表示 */}
                  {part.frame && ( // frameは必須なので常に表示を試みる
                    <div
                      // dangerouslySetInnerHTMLを使用してHTMLをレンダリング
                      dangerouslySetInnerHTML={{
                        __html: insertContentToDeepestElement(
                          part.frame,
                          part.content
                        ),
                      }}
                    />
                  )}
                </div>
                <div>
                  <button onClick={() => handleSelectPartToEdit(part)}>
                    編集
                  </button>
                  <button onClick={() => handleDeletePart(part.id)}>
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 編集フォーム (パーツが選択されている場合のみ表示) */}
      {selectedPartId !== null && (
        <div>
          <h2>
            このパーツを編集: {parts.find((p) => p.id === selectedPartId)?.name}
          </h2>
          {/* フレームの編集 */}
          <textarea
            value={editingFrame}
            onChange={(e) => setEditingFrame(e.target.value)}
            placeholder="フレームを編集してください..."
          />
          {/* 中身の編集 */}
          <textarea
            value={editingContent}
            onChange={(e) => setEditingContent(e.target.value)}
            placeholder="パーツの中身を入力してください..."
          />
          <div>
            <button onClick={handleUpdatePart}>更新</button>
            <button
              onClick={() => {
                setSelectedPartId(null);
                setEditingContent("");
                setEditingFrame("");
              }}
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
