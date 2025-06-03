import { useState } from "react";
import PartItem from "../components/PartItem";
import PartEditor from "../components/PartEditor";
import Layout from "../layout/Layout";
import { useParts } from "../components/hooks/supabase";
import { Link } from "react-router-dom";

export default function GenerateView() {
  const { parts, addPart, updatePart, deletePart, loading, error } = useParts();
  const [newName, setNewName] = useState("");
  const [newFrame, setNewFrame] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [editingFrame, setEditingFrame] = useState("");

  const startEdit = (id: number, content: string, frame: string) => {
    setEditingId(id);
    setEditingContent(content || "");
    setEditingFrame(frame);
  };

  return (
    <Layout title="組み立てる">
      <Link className="btn" to="/Generate">
        フレームを作るボタン
      </Link>
      {/* フレームを作成して保存する */}
      <div>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="パーツ名"
        />
        <textarea
          value={newFrame}
          onChange={(e) => setNewFrame(e.target.value)}
          placeholder="HTMLテンプレート"
        />
        <button
          onClick={() => {
            addPart(newName, newFrame);
            setNewName("");
            setNewFrame("");
          }}
        >
          保存
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}

      {/* パーツの名前とフレームを表示 */}
      {parts.map((part: any) => (
        <PartItem
          key={part.id}
          part={part}
          onEdit={() => startEdit(part.id, part.content ?? "", part.frame)}
          onDelete={() => deletePart(part.id)}
        />
      ))}

      {/* フレームと中身を編集する */}
      {editingId !== null && (
        <PartEditor
          name={parts.find((p: any) => p.id === editingId)?.name || ""}
          content={editingContent}
          frame={editingFrame}
          onChangeContent={setEditingContent}
          onChangeFrame={setEditingFrame}
          onSave={() => {
            updatePart(editingId, editingContent, editingFrame);
            setEditingId(null);
          }}
          onCancel={() => setEditingId(null)}
        />
      )}
    </Layout>
  );
}
