import { useState } from "react";
import PartItem from "../components/PartItem";
import Layout from "../layout/Layout";
import { useParts } from "../components/hooks/useParts";
import { Link } from "react-router-dom";

export default function AssembleView() {
  const { parts, updatePart, deletePart } = useParts();
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editContent, setEditContent] = useState("");

  return (
    <Layout title="組み立てる">
      <Link className="btn" to="/Generate">
        フレームを作るボタン
      </Link>


      <h2>登録済みパーツ</h2>
      {parts.map((part) => (
        <PartItem
          key={part.id}
          part={part}
          onEdit={() => {
            setEditId(part.id);
            setEditName(part.name);
            setEditContent(part.content ?? "");
          }}
          onDelete={() => deletePart(part.id)}
        />
      ))}

      {editId !== null && (
        <div>
          <h3>編集中</h3>
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
          <button
            onClick={() => {
              updatePart(editId, editName, editContent);
              setEditId(null);
            }}
          >
            保存
          </button>
          <button onClick={() => setEditId(null)}>キャンセル</button>
        </div>
      )}
    </Layout>
  );
}
