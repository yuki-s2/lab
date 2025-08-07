import { useState, useEffect } from "react";
import Layout from "../layout/Layout";
import { useFrameTemplates } from "../components/hooks/useFrameTemplates";
import { Link } from "react-router-dom";
import {
  formatHtmlCode,
  handleTabKeyInTextarea,
} from "../components/hooks/format";

export default function GenerateView() {
  const { templates, addTemplate, updateTemplate, deleteTemplate } =
    useFrameTemplates();
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null
  );
  const [templateName, setTemplateName] = useState("");
  const [templateFrame, setTemplateFrame] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  // tableスタイル設定用の状態を追加
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const [tableStyles, setTableStyles] = useState({
    outerTable: `width: 100%; border: 0; cellspacing: 0; cellpadding: 0; background-color: #f4f4f4;`,
    outerTd: `text-align: center;`,
    innerTable: `width: 600px; max-width: 100%; border: 0; cellspacing: 0; cellpadding: 0; background-color: #ffffff;`,
    innerTd: `padding: 0;`,
  });

  // LocalStorageからtableスタイルを読み込み
  useEffect(() => {
    const savedStyles = localStorage.getItem("tableStyles");
    if (savedStyles) {
      setTableStyles(JSON.parse(savedStyles));
    }
  }, []);

  // tableスタイルをLocalStorageに保存
  const saveTableStyles = () => {
    localStorage.setItem("tableStyles", JSON.stringify(tableStyles));
    setShowStyleEditor(false);
    alert("テーブルスタイルが保存されました！");
  };

  //templates の中からクリックされたフレームのidを探す
  const selectedTemplate = templates.find(
    (tpl) => tpl.id === selectedTemplateId
  );

  const handleTplAdd = () => {
    setEditId(null);
    setTemplateName("");
    setTemplateFrame("");
    setSelectedTemplateId(null);
  };

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

  // 事前定義されたtableテンプレートを設定するハンドラ
  const handleSetPredefinedTable = () => {
    setEditId(null);
    setTemplateName("外側フレーム - HTMLメールテンプレート");
    setTemplateFrame(`<body style="margin:0; padding:0; background-color:#f4f4f4;">
  <!-- 全体ラッパー -->
  <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f4f4f4" style="{{outerTableStyle}}">
    <tr>
      <td align="center" style="{{outerTdStyle}}">
        <!-- メインコンテナ -->
        <table width="600" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="{{innerTableStyle}}">
          <tr>
            <td style="{{innerTdStyle}}">
              {{content}}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>`);
    setSelectedTemplateId(null);
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

  // HTMLフォーマット関数
  const formatHtml = () => {
    const formatted = formatHtmlCode(templateFrame);
    setTemplateFrame(formatted);
  };

  // テキストエリアでTabキーの処理
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    handleTabKeyInTextarea(e, templateFrame, setTemplateFrame);
  };

  return (
    <Layout title="フレームを作成する">
      <Link className="linkBtn" to="/">
        ← 組み立てる
      </Link>
      <div className="contentsWrap">
        <div className="contents is-works bg-gray">
          <div className="inputFlame">
            <div className="inputFlame_btns">
              <button
                className={`btn ${!selectedTemplate && "is-active"}`}
                onClick={handleTplAdd}
              >
                追加
              </button>
              {selectedTemplate && (
                <>
                  <div className="btn is-active">編集</div>
                  <button
                    className="btn"
                    onClick={() => handleDeleteTemplate(selectedTemplate.id)}
                  >
                    削除
                  </button>
                </>
              )}
              <button
                className={`btn ${showStyleEditor ? "is-active" : ""}`}
                onClick={() => setShowStyleEditor(!showStyleEditor)}
              >
                スタイルを指定
              </button>
            </div>

            {/* スタイル設定エリア */}
            {showStyleEditor && (
              <div
                className="styleEditor"
                style={{
                  backgroundColor: "#f8f9fa",
                  padding: "20px",
                  marginBottom: "20px",
                  borderRadius: "8px",
                }}
              >
                <div
                  className="title"
                  style={{ marginBottom: "15px", fontWeight: "bold" }}
                >
                  テーブルスタイル設定
                </div>

                <div className="input_item" style={{ marginBottom: "15px" }}>
                  <div className="title">外側テーブルスタイル</div>
                  <textarea
                    value={tableStyles.outerTable}
                    onChange={(e) =>
                      setTableStyles((prev) => ({
                        ...prev,
                        outerTable: e.target.value,
                      }))
                    }
                    placeholder="border-collapse: collapse; ..."
                    style={{}}
                  />
                </div>

                <div className="input_item" style={{ marginBottom: "15px" }}>
                  <div className="title">外側セルスタイル (td)</div>
                  <textarea
                    value={tableStyles.outerTd}
                    onChange={(e) =>
                      setTableStyles((prev) => ({
                        ...prev,
                        outerTd: e.target.value,
                      }))
                    }
                    placeholder="padding: 20px 0; ..."
                    style={{}}
                  />
                </div>

                <div className="input_item" style={{ marginBottom: "15px" }}>
                  <div className="title">内側テーブルスタイル</div>
                  <textarea
                    value={tableStyles.innerTable}
                    onChange={(e) =>
                      setTableStyles((prev) => ({
                        ...prev,
                        innerTable: e.target.value,
                      }))
                    }
                    placeholder="background-color: #ffffff; border-radius: 20px; ..."
                    style={{
                      width: "100%",
                      height: "80px",
                      resize: "vertical",
                    }}
                  />
                </div>

                <div className="input_item" style={{ marginBottom: "15px" }}>
                  <div className="title">内側セルスタイル (td)</div>
                  <textarea
                    value={tableStyles.innerTd}
                    onChange={(e) =>
                      setTableStyles((prev) => ({
                        ...prev,
                        innerTd: e.target.value,
                      }))
                    }
                    placeholder="padding: 0; ..."
                    style={{
                      width: "100%",
                      height: "60px",
                      resize: "vertical",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button className="inputBtn" onClick={saveTableStyles}>
                    スタイルを保存
                  </button>
                  <button
                    className="btn"
                    onClick={() => setShowStyleEditor(false)}
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}

            <div className="input_item">
              <div className="titleWrap">
                <div className="title">フレームのコード</div>
                <button
                  className="adjustButton"
                  onClick={formatHtml}
                  type="button"
                  disabled={!templateFrame.trim()}
                >
                  コード整形
                </button>
              </div>
              <textarea
                className="codeEditor"
                value={templateFrame}
                onChange={(e) => setTemplateFrame(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="<p>ここにHTMLコードを入力...</p>"
                spellCheck={false}
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

        <div className="contents">
          <div className="frameList">
            <button
              className="frameList_item"
              onClick={handleSetPredefinedTable}
            >
              <div>body直下 wrapper table</div>
            </button>
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
