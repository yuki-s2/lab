import { useState } from "react";
import Layout from "../layout/Layout";
import { useFrameTemplates } from "../components/hooks/useFrameTemplates";
import { Link } from "react-router-dom";

export default function GenerateView() {
  const { templates, addTemplate, updateTemplate, deleteTemplate } =
    useFrameTemplates();
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null
  );
  const [templateName, setTemplateName] = useState("");
  const [templateFrame, setTemplateFrame] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  //templates の中からクリックされたフレームのidを探す
  const selectedTemplate = templates.find(
    (tpl) => tpl.id === selectedTemplateId
  );

  const handleTplChange = async () => {
    if (!templateName.trim() || !templateFrame.trim()) {
      return;
    }
    if (editId === null) {
      await addTemplate(templateName, templateFrame);
    } else {
      await updateTemplate(editId, templateName, templateFrame);
    }
    setTemplateName("");
    setTemplateFrame("");
    setEditId(null);
    setSelectedTemplateId(null);
  };

  //テンプレート編集ボタンクリック時のハンドラ
  const handleEditTemplate = (tpl: (typeof templates)[0]) => {
    setEditId(tpl.id);
    setTemplateName(tpl.name);
    setTemplateFrame(tpl.frame);
    setSelectedTemplateId(tpl.id);
  };

  // テンプレート削除ボタンクリック時のハンドラ
  const handleDeleteTemplate = (id: number) => {
    deleteTemplate(id);
    // 削除したテンプレートが選択中だった場合、選択を解除 フォームをリセット
    if (selectedTemplateId === id) {
      setSelectedTemplateId(null);
      setTemplateName("");
      setTemplateFrame("");
      setEditId(null);
    }
  };

  return (
    <Layout title="フレームを作成する">
      <Link className="linkBtn" to="/">
        ← 組み立てる
      </Link>
      <div className="contentsWrap">
        <div className="contents is-works bg-gray">
          <div className="inputArea">
            {/* 編集・削除ボタンと入力フォームのエリア */}
            <div className="inputArea">
              {selectedTemplate && (
                <>
                  <div className="frameList_btns">
                    <button
                      onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                    >
                      フレームを削除する
                    </button>
                  </div>
                </>
              )}

              <div className="input_item">
                <div className="title">フレームを生成する</div>
                <textarea
                  className=""
                  value={templateFrame}
                  onChange={(e) => setTemplateFrame(e.target.value)}
                  placeholder="<p></p>"
                />
              </div>
              <div className="input_item">
                <div className="title">フレームのタイトル</div>
                <input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="名前"
                />
              </div>
              <div className="inputBtn_wrap">
                <button className="inputBtn" onClick={handleTplChange}>
                  {editId === null ? "追加" : "更新"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="contents">
          <div className="frameList">
            {templates.map((tpl) => (
              <button
                className={`frameList_item ${
                  tpl.id === selectedTemplateId ? "is-active" : ""
                }`}
                key={tpl.id}
                onClick={() => handleEditTemplate(tpl)}
              >
                <div>{tpl.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
