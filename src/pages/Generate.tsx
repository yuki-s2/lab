import { useState } from "react";
import Layout from "../layout/Layout";
import { useFrameTemplates } from "../components/hooks/useFrameTemplates";
import { Link } from "react-router-dom";
import { useParts } from "../components/hooks/useParts";

export default function GenerateView() {
  const { addPart } = useParts();
  const { templates, addTemplate, updateTemplate, deleteTemplate } =
    useFrameTemplates();
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null
  );
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [frame, setFrame] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  const selectedTemplate = templates.find(
    (tpl) => tpl.id === selectedTemplateId
  );

  return (
    <Layout title="テンプレート作成">
      <Link className="btn" to="/">
        組み立てるボタン
      </Link>
      <h2>新規テンプレート</h2>
      <div className="inputArea">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="名前"
        />
        <textarea
          value={frame}
          onChange={(e) => setFrame(e.target.value)}
          placeholder="フレームHTML"
        />
      </div>
      <button
        onClick={() => {
          if (editId === null) addTemplate(name, frame);
          else updateTemplate(editId, name, frame);
          setName("");
          setFrame("");
          setEditId(null);
        }}
      >
        {editId === null ? "追加" : "更新"}
      </button>

      <h3>テンプレート一覧</h3>
      {templates.map((tpl) => (
        <div key={tpl.id}>
          <strong>{tpl.name}</strong>
          <pre>{tpl.frame}</pre>
          <button
            onClick={() => {
              setEditId(tpl.id);
              setName(tpl.name);
              setFrame(tpl.frame);
            }}
          >
            編集
          </button>
          <button onClick={() => deleteTemplate(tpl.id)}>削除</button>
        </div>
      ))}

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

      <div className="inputArea">
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
      </div>
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
    </Layout>
  );
}
