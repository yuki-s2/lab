import { useState } from "react";
import PartItem from "../components/PartItem";
import Layout from "../layout/Layout";
import { useParts } from "../components/hooks/useParts";
import { useFrameTemplates } from "../components/hooks/useFrameTemplates";
import { Link } from "react-router-dom";

export default function AssembleView() {
  const { parts, addPart, updatePart, deletePart } = useParts();
  const { templates } = useFrameTemplates();
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null
  );
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editContent, setEditContent] = useState("");

  const selectedTemplate = templates.find(
    (tpl) => tpl.id === selectedTemplateId
  );

  return (
    <Layout title="組み立てる">
      <Link className="btn" to="/Generate">
        フレームを作るボタン
      </Link>

      <h3>テンプレートを選択</h3>
      <ul>
        {templates.map((tpl) => (
          <li key={tpl.id}>
            <button
              onClick={() => setSelectedTemplateId(tpl.id)}
              style={{
                backgroundColor: tpl.id === selectedTemplateId ? "#cceeff" : "",
                marginBottom: "4px",
              }}
            >
              {/* これは複製元 */}
              {tpl.name}
              {tpl.frame}
            </button>
          </li>
        ))}
      </ul>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="パーツ名"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="中身"
      />
      <button
        onClick={() => {
          if (selectedTemplate && name.trim()) {
            addPart(
              name.trim(),
              selectedTemplate.frame,
              selectedTemplate.id,
              content.trim()
            );
            setName("");
            setContent("");
          }
        }}
      >
        保存
      </button>

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
