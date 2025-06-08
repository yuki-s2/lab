import { useState } from "react";
import Layout from "../layout/Layout";
import { useFrameTemplates } from "../components/hooks/useFrameTemplates";
import { Link } from "react-router-dom";

export default function GenerateView() {
  const { templates, addTemplate, updateTemplate, deleteTemplate } =
    useFrameTemplates();

  const [name, setName] = useState("");
  const [frame, setFrame] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  return (
    <Layout title="テンプレート作成">
      <Link className="btn" to="/">
        組み立てるボタン
      </Link>
      <h2>新規テンプレート</h2>
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
    </Layout>
  );
}
