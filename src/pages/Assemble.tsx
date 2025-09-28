import { useState, useEffect, useMemo } from "react";
import Layout from "../layout/Layout";
import { useParts } from "../components/hooks/useParts";
import { useFrameTemplates } from "../components/hooks/useFrameTemplates";
import { useFrameChildren } from "../components/hooks/useFrameChildren";
import type { Part } from "../types/Part";
import PartItem from "../components/PartItem";
import FrameEditModal from "../components/FrameEditModal";
import type { FrameChild } from "../types/FrameChild";
import type { FrameTemplate } from "../types/FrameTemplate";
import { insertContentToDeepestElement } from "../lib/insertContentToDeepestElement";

export default function AssembleView() {
  const [localParts, setLocalParts] = useState<Part[]>([]);
  const { templates, deleteTemplate } = useFrameTemplates();
  const { parts, addPart, deletePart, refreshParts } = useParts();
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [generatedHtml, setGeneratedHtml] = useState<string>("");

  // partsが更新されたらlocalPartsも同期
  useEffect(() => {
    setLocalParts(parts);
  }, [parts]);
  const { frameChildren, getChildrenByParent } = useFrameChildren();

  // 子要素を含むHTMLを生成する関数（メモ化）
  const renderPartWithChildren = useMemo(() => {
    return (part: Part): string => {
      // パーツのテンプレートに紐づく子要素を取得
      const children = getChildrenByParent(part.frame_id, "template");

      // selected_children_idsで選択された子要素のみをフィルタ
      const selectedChildren = children.filter((child) =>
        part.selected_children_ids.includes(child.id)
      );
      if (selectedChildren.length === 0) return part.frame;

      const childrenHtml = selectedChildren
        .map((child) => child.content)
        .join("\n");

      // 最深層に子要素を挿入（正しい関数を使用）
      return insertContentToDeepestElement(part.frame, childrenHtml);
    };
  }, [frameChildren, getChildrenByParent]);

  // フレーム一覧の状態
  const [selectedFrame, setSelectedFrame] = useState<FrameTemplate | null>(
    null
  );

  // フレーム編集モーダルの状態
  const [frameEditModal, setFrameEditModal] = useState<{
    isOpen: boolean;
    editTarget: {
      type: "frame" | "child" | "create" | "template";
      id: number;
      data: Part | FrameChild | FrameTemplate | null;
    } | null;
  }>({
    isOpen: false,
    editTarget: null,
  });

  // localPartsをpartsから同期（フラットなリスト）
  useEffect(() => {
    setLocalParts(parts);
  }, [parts]);

  // 全パーツを結合したHTMLコードを生成
  const generateHtmlCode = () => {
    const htmlParts = localParts
      .map((part) => partsWithChildren[part.id])
      .join("\n");

    setGeneratedHtml(htmlParts);
    setViewMode("code");
  };

  // HTMLコードをクリップボードにコピー
  const handleCopyHtml = async () => {
    await navigator.clipboard.writeText(generatedHtml);
    alert("✅ HTMLコードをクリップボードにコピーしました！");
  };

  // 各パーツの子要素含みHTMLをメモ化
  const partsWithChildren = useMemo(() => {
    return localParts.reduce(
      (acc, part) => {
        acc[part.id] = renderPartWithChildren(part);
        return acc;
      },
      {} as Record<number, string>
    );
  }, [localParts, renderPartWithChildren]);

  // フレーム編集モーダルを開く（新しい機能）
  const handleFrameEdit = (part: Part) => {
    setFrameEditModal({
      isOpen: true,
      editTarget: {
        type: "frame",
        id: part.id,
        data: part,
      },
    });
  };

  // フレーム一覧からフレームを選択（表示のみ、追加はしない）
  const handleFrameSelect = (tpl: FrameTemplate) => {
    setSelectedFrame(tpl);
  };

  // 選択されたフレームをパーツとして追加
  const handleAddSelectedFrame = async (tpl: FrameTemplate) => {
    try {
      // フレームをパーツとして追加（子要素なしで開始）
      await addPart(
        tpl.name, // パーツの名前
        tpl.frame, // HTMLフレーム
        tpl.id, // 元になったテンプレートのID
        [] // 空の子要素ID配列で開始
      );

      // バックアップ：手動でpartsを再取得（リアルタイムが効かない場合の対策）
      await refreshParts();

      // 追加成功後、選択をクリア
      setSelectedFrame(null);
    } catch (error) {
      console.error("❌ パーツ追加エラー:", error);
    }
  };

  // フレーム作成モーダルを開く（新規作成）
  const handleFrameAdd = () => {
    setFrameEditModal({
      isOpen: true,
      editTarget: {
        type: "create",
        id: 0, // 新規作成時はダミーID
        data: null,
      },
    });
  };

  //テンプレート削除ボタンクリック時のハンドラ
  const handleFrameTemplateDelete = (id: number) => {
    deleteTemplate(id);
  };

  // 選択されたフレーム（テンプレート）を編集
  const handleFrameTemplateEdit = (template: FrameTemplate) => {
    setFrameEditModal({
      isOpen: true,
      editTarget: {
        type: "template", // 新しいタイプを追加
        id: template.id,
        data: template,
      },
    });
  };

  // フレーム編集モーダルを閉じる
  const handleCloseFrameEditModal = () => {
    setFrameEditModal({
      isOpen: false,
      editTarget: null,
    });
  };

  return (
    <Layout>
      <div className="btn_wrap">
        <button className="btn" onClick={() => setViewMode("preview")}>
          プレビュー
        </button>
        <button className="btn" onClick={generateHtmlCode}>
          HTML
        </button>
        <button className="btn" onClick={handleCopyHtml}>
          コードをコピー
        </button>
      </div>
      <div className="contentsWrap">
        <div className="contents is-works">
          {viewMode === "preview" ? (
            /* プレビューモード: パーツリスト表示 */
            localParts.length > 0 ? (
              localParts.map((part) => (
                <div
                  className={`part_Wrap ${part.selected_children_ids.length > 0 ? "" : "is-empty"}`}
                  key={part.id}
                >
                  <PartItem
                    part={part}
                    customHtml={partsWithChildren[part.id]}
                  />
                  {/* 編集・削除ボタン */}
                  <div className="partBtns">
                    <button
                      className="is-edit"
                      onClick={() => handleFrameEdit(part)}
                      title="編集"
                    >
                      <span>|||</span>
                    </button>
                    <button
                      onClick={async () => {
                        if (
                          window.confirm(`「${part.name}」を削除しますか？`)
                        ) {
                          await deletePart(part.id);
                          setLocalParts((prev) =>
                            prev.filter((p) => p.id !== part.id)
                          );
                        }
                      }}
                      title="削除"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <table
                width="100%"
                cellPadding="0"
                cellSpacing="0"
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  textAlign: "center",
                  backgroundColor: "#f9f9f9",
                }}
              >
                <tbody>
                  <tr>
                    <td style={{ padding: "20px", color: "#666" }}>
                      パーツが追加されていません
                      <br />
                      フレームを選択してパーツを作成してください
                    </td>
                  </tr>
                </tbody>
              </table>
            )
          ) : (
            /* HTMLコードモード: コード表示 */
            <div className="codeView">
              {generatedHtml ? (
                <pre
                  style={{
                    background: "#f5f5f5",
                    padding: "20px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    overflow: "auto",
                    fontSize: "14px",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {generatedHtml}
                </pre>
              ) : (
                <div
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#666",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    background: "#f9f9f9",
                  }}
                >
                  「HTML」ボタンを押してコードを生成してください
                </div>
              )}
            </div>
          )}
        </div>
        <div className="contents">
          <button className="btn is-primary" onClick={handleFrameAdd}>
            フレームを作成する
          </button>
          {selectedFrame && (
            <>
              <p className="mt-S">選択したフレームを...</p>
              <div className="btn_wrap">
                <button
                  className="btn"
                  onClick={() => handleAddSelectedFrame(selectedFrame)}
                >
                  追加
                </button>
                <button
                  className="btn"
                  onClick={() => handleFrameTemplateEdit(selectedFrame)}
                >
                  編集
                </button>
                <button
                  className="btn"
                  onClick={() => handleFrameTemplateDelete(selectedFrame.id)}
                >
                  削除
                </button>
              </div>
            </>
          )}

          {/* フレーム一覧ここから */}
          <div className="frameList">
            {templates.map((tpl) => (
              <button
                className={`frameList_item ${
                  selectedFrame?.id === tpl.id ? "is-active" : ""
                }`}
                key={tpl.id}
                onClick={() => handleFrameSelect(tpl)}
              >
                <div>{tpl.name}</div>
              </button>
            ))}
          </div>
          {/* フレーム一覧ここまで */}

          {/* フレーム編集モーダル */}
          <FrameEditModal
            isOpen={frameEditModal.isOpen}
            onClose={handleCloseFrameEditModal}
            editTarget={frameEditModal.editTarget}
          />
        </div>
      </div>
    </Layout>
  );
}
