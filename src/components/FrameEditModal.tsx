import { useState, useEffect } from "react";
import type { Part } from "../types/Part";
import type { FrameChild } from "../types/FrameChild";
import { useFrameChildren } from "./hooks/useFrameChildren";
import { useFrameTemplates } from "../components/hooks/useFrameTemplates";
import { useParts } from "../components/hooks/useParts";
import {
  formatHtmlCode,
  handleTabKeyInTextarea,
} from "../components/hooks/format";
import { CreateChildModal } from "./CreateChildModal";
import type { FrameTemplate } from "../types/FrameTemplate";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editTarget: {
    type: "frame" | "child" | "create" | "template";
    id: number;
    data: Part | FrameChild | FrameTemplate | null;
  } | null;
}

export default function FrameEditModal({ isOpen, onClose, editTarget }: Props) {
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [showCreateChild, setShowCreateChild] = useState(false);
  const [children, setChildren] = useState<FrameChild[]>([]);
  const [selectedChildrenIds, setSelectedChildrenIds] = useState<number[]>([]);

  const { frameChildren, addChild, deleteChild, refreshFrameChildren } =
    useFrameChildren();
  const { addTemplate, updateTemplate } = useFrameTemplates();
  const { addPart, updatePart, refreshParts, updatePartsByFrameId } =
    useParts();
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
    null
  );
  const [templateName, setTemplateName] = useState("");
  const [templateFrame, setTemplateFrame] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [autoAddToWorkspace, setAutoAddToWorkspace] = useState(false);

  const handleTplChange = async () => {
    //空白のみのデータが保存されるのを防ぐ
    if (!templateName.trim() || !templateFrame.trim()) {
      return;
    }

    //プレビューエリアに追加されたものは（frame_templatesのidをframe_idに持つ）
    //プレビューエリアに追加されないものは「frame_templates」とする

    //parts テーブルの frame_id に追加される
    let createdTemplateId: number | null = null;

    // 新規作成の場合
    if (editId === null) {
      createdTemplateId = await addTemplate(templateName, templateFrame);

      // チェックボックスがオンの場合、自動でパーツとして追加
      if (autoAddToWorkspace && createdTemplateId) {
        await addPart(
          templateName, // パーツの名前
          templateFrame, // HTMLフレーム
          createdTemplateId, // 元になったテンプレートのID
          [] // 空のコンテンツで開始
        );
        alert(
          `✅ フレーム「${templateName}」を作成し、contents is-worksに自動追加しました！\n\n組み立てページでDnDを使用できます。`
        );
      } else {
        alert(`✅ フレーム「${templateName}」を作成しました！`);
      }
    } else {
      // 編集の場合
      await updateTemplate(editId, templateName, templateFrame);

      // 同じframe_idを持つis-works内のパーツも更新
      await updatePartsByFrameId(editId, templateFrame);

      alert(
        `✅ フレーム「${templateName}」を更新しました！\nis-works内の同じレイアウトも自動更新されました。`
      );
    }

    setTemplateName("");
    setTemplateFrame("");
    setEditId(null);
    setSelectedTemplateId(null);
    setAutoAddToWorkspace(false);
  };

  // HTMLフォーマット関数
  const formatHtml = () => {
    const formatted = formatHtmlCode(templateFrame);
    setTemplateFrame(formatted);
  };
  // モーダルが閉じられたときにリセット
  useEffect(() => {
    if (!isOpen) {
      setViewMode("preview");
      setShowCreateChild(false);
      setChildren([]);
    }
  }, [isOpen]);

  // editTargetまたはframeChildrenが変わったときに子要素を更新
  useEffect(() => {
    console.log("editId", editId);
    if (isOpen && editTarget && editTarget.type === "frame") {
      // フレーム編集時は、そのフレームのテンプレートIDから子要素を取得
      const templateId = (editTarget.data as Part).frame_id;
      const updatedChildren = frameChildren
        .filter(
          (child) =>
            child.parent_id === templateId && child.parent_type === "template"
        )
        .sort((a, b) => a.order_index - b.order_index);
      setChildren(updatedChildren);

      // 既存のパーツの選択済み子要素IDを設定
      const partData = editTarget.data as Part;
      setSelectedChildrenIds(partData.selected_children_ids || []);
    } else if (isOpen && editTarget && editTarget.type === "template") {
      // テンプレート編集時は、そのテンプレートの情報を設定
      const templateData = editTarget.data as FrameTemplate;
      setTemplateName(templateData.name);
      setTemplateFrame(templateData.frame);
      setEditId(templateData.id);
    } else if (isOpen && editTarget && editTarget.type === "create") {
      // 新規作成時は、そのテンプレートIDから子要素を取得
      const updatedChildren = frameChildren
        .filter(
          (child) =>
            child.parent_id === editTarget.id &&
            child.parent_type === "template"
        )
        .sort((a, b) => a.order_index - b.order_index);
      setChildren(updatedChildren);

      // 新規作成時は選択済み子要素なし
      setSelectedChildrenIds([]);
    }
  }, [isOpen, editTarget, frameChildren]);

  if (!isOpen || !editTarget) return null;

  const { type, id, data } = editTarget;

  // data がnullの場合（create時）のデフォルト値
  const frameData = data || { frame: "", name: "" };

  // フレームまたは子要素のHTMLを子要素と組み合わせてレンダリング
  const renderWithChildren = (
    baseContent: string,
    childElements: FrameChild[]
  ): string => {
    if (childElements.length === 0) return baseContent;

    const childrenHtml = childElements.map((child) => child.content).join("\n");

    // 最深層に子要素を挿入
    return insertIntoDeepestElement(baseContent, childrenHtml);
  };

  // 簡易的な最深層挿入関数（後で改良可能）
  const insertIntoDeepestElement = (html: string, content: string): string => {
    // 空のdivやpタグを探して挿入
    const emptyTagPattern =
      /<(div|p|span|section)[^>]*><\/(div|p|span|section)>/gi;
    if (emptyTagPattern.test(html)) {
      return html.replace(emptyTagPattern, (match, _tag, closingTag) => {
        return match.replace(`</${closingTag}>`, `${content}</${closingTag}>`);
      });
    }

    // 空のタグがない場合は末尾に追加
    return html + content;
  };

  // 選択された子要素のみを取得
  const selectedChildren = children.filter((child) =>
    selectedChildrenIds.includes(child.id)
  );

  const fullHtml =
    type === "frame" || type === "create"
      ? renderWithChildren((frameData as Part).frame || "", selectedChildren)
      : renderWithChildren(
          (frameData as FrameChild).content || "",
          selectedChildren
        );

  const handleCreateChild = async (name: string, content: string) => {
    if (type === "frame" || type === "create") {
      // フレーム編集時は、そのフレームのテンプレートIDを取得
      const templateId = type === "frame" ? (frameData as Part).frame_id : id;

      try {
        const result = await addChild({
          parent_id: templateId,
          parent_type: "template",
          name: name.trim(),
          content: content.trim(),
        });

        if (!result) {
          alert("子要素の作成に失敗しました");
        } else {
          // 作成成功後にデータを手動でリフレッシュ
          await refreshFrameChildren();
        }
      } catch (error) {
        console.error("Error creating child:", error);
        alert("子要素の作成中にエラーが発生しました");
      }
    }
    setShowCreateChild(false);
  };

  const handleDeleteChild = async (childId: number) => {
    if (window.confirm("この子要素を削除しますか？")) {
      await deleteChild(childId);
      // 削除後にデータを手動でリフレッシュ
      await refreshFrameChildren();
    }
  };

  // 子要素選択の切り替え チェックボックスのON/OFF
  const handleToggleChildSelection = (childId: number) => {
    setSelectedChildrenIds((prev) =>
      //渡されたchildIdが含まれていたらそれ以外のIDを返す
      prev.includes(childId)
        ? prev.filter((id) => id !== childId)
        : [...prev, childId]
    );
  };

  // パーツの子要素選択を保存
  const handleSaveChildSelection = async () => {
    if (editTarget?.type === "frame") {
      const partData = editTarget.data as Part;
      await updatePart(partData.id, {
        selected_children_ids: selectedChildrenIds,
      });

      // 保存後にeditTarget.dataの状態を更新（保存ボタンを非表示にするため）
      if (editTarget.data) {
        (editTarget.data as Part).selected_children_ids = [
          ...selectedChildrenIds,
        ];
      }

      // 保存後にパーツを再取得してis-worksに反映
      await refreshParts();
    }
  };
  // テキストエリアでTabキーの処理
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    handleTabKeyInTextarea(e, templateFrame, setTemplateFrame);
  };

  // HTMLコードをクリップボードにコピー
  const handleCopyHtml = async () => {
    await navigator.clipboard.writeText(fullHtml);
  };

  const typeFrame = editTarget.type === "frame";
  const typeTemplate = editTarget.type === "template";
  const typeCreate = editTarget.type === "create";

  // Supabaseに保存されている選択済み子要素IDを取得
  const savedSelectedIds =
    editTarget.data && editTarget.type === "frame"
      ? (editTarget.data as Part).selected_children_ids || []
      : [];

  // 現在の選択と保存済みの選択を比較
  const hasChanges =
    selectedChildrenIds.length !== savedSelectedIds.length ||
    selectedChildrenIds.some((id) => !savedSelectedIds.includes(id)) ||
    savedSelectedIds.some((id) => !selectedChildrenIds.includes(id));
  return (
    <div className="modal__overlay">
      <div className="modal__content">
        <button className="modal__closeBtn" onClick={onClose}>
          ×
        </button>
        <div className="modal__header">
          <h2>
            {typeFrame
              ? `${frameData.name}を編集`
              : typeTemplate
                ? `${frameData.name}テンプレートを編集`
                : "新規作成"}
          </h2>
        </div>

        {/* メインコンテンツ */}
        <div className={`modal__mainContents ${typeFrame ? "is-grid" : ""}`}>
          <>
            {typeFrame && (
              //   {/* 左側: 子要素リスト */}
              <div className="editChild">
                <h3>子要素 ({children.length})</h3>
                <button
                  className="btn is-primary"
                  onClick={() => setShowCreateChild(true)}
                >
                  子要素を新規作成
                </button>
                {/* 子要素リスト - シンプル表示 */}
                {children.length === 0 ? (
                  <>子要素がありません</>
                ) : (
                  <>
                    <ul className="edit__childEleList">
                      {children.map((child) => (
                        <li key={child.id}>
                          <div className="edit__childEleItemBtnWrap">
                            <input
                              type="checkbox"
                              checked={selectedChildrenIds.includes(child.id)}
                              onChange={() =>
                                handleToggleChildSelection(child.id)
                              }
                            />
                            <strong style={{ fontSize: "14px" }}>
                              {child.name}
                            </strong>

                            <button
                              className="modalBtn"
                              onClick={() => handleDeleteChild(child.id)}
                            >
                              ×
                            </button>
                          </div>
                          <div
                            className="edit__childEleItem"
                            dangerouslySetInnerHTML={{
                              __html: child.content,
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            )}
            {/* 右側: プレビューまたはコード */}
            <div className="mainContents">
              <div className="btn_wrap">
                {/* 表示モード切り替え */}
                {typeTemplate || typeCreate ? (
                  <button className="btn" onClick={handleTplChange}>
                    {editId === null ? "追加" : "更新"}
                  </button>
                ) : (
                  <>
                    <button
                      className="btn"
                      onClick={() => setViewMode("preview")}
                    >
                      プレビュー
                    </button>
                    <button className="btn" onClick={() => setViewMode("code")}>
                      HTML
                    </button>
                    <button className="btn" onClick={handleCopyHtml}>
                      コピー
                    </button>
                    {hasChanges && (
                      <button
                        className="btn is-primary"
                        onClick={handleSaveChildSelection}
                      >
                        保存
                      </button>
                    )}
                  </>
                )}
              </div>

              <div>
                {typeTemplate || typeCreate ? (
                  <>
                    <div className="inputItem">
                      <h3>フレームのコード{editId === null ? "" : "を編集"}</h3>
                      <button
                        className="adjustButton"
                        onClick={formatHtml}
                        type="button"
                        disabled={!templateFrame.trim()}
                      >
                        コード整形
                      </button>
                      <textarea
                        className="is-code"
                        value={templateFrame}
                        onChange={(e) => setTemplateFrame(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="ここにHTMLコードを入力..."
                        spellCheck={false}
                      />
                    </div>
                    <div className="inputItem">
                      <h3>
                        フレームのタイトル{editId === null ? "" : "を編集"}
                      </h3>
                      <input
                        className="textInput"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="名前"
                      />
                    </div>
                    {editId === null && (
                      <div className="inputItem">
                        <label className="checkBox">
                          <input
                            type="checkbox"
                            checked={autoAddToWorkspace}
                            onChange={(e) =>
                              setAutoAddToWorkspace(e.target.checked)
                            }
                            style={{ cursor: "pointer" }}
                          />
                          <span>作成と同時にis-worksに追加する</span>
                        </label>
                      </div>
                    )}
                  </>
                ) : viewMode === "preview" ? (
                  <div
                    className="previewArea"
                    dangerouslySetInnerHTML={{ __html: fullHtml }}
                  />
                ) : (
                  <pre className="previewArea is-code">{fullHtml}</pre>
                )}
              </div>
            </div>
            {/* 子要素作成モーダル */}
            {showCreateChild && (
              <CreateChildModal
                onSave={handleCreateChild}
                onClose={() => setShowCreateChild(false)}
                fullHtmlForReference={fullHtml}
              />
            )}
          </>
        </div>
      </div>
    </div>
  );
}
