import { useState, useEffect } from "react";
import Layout from "../layout/Layout";
import { useParts } from "../components/hooks/useParts";
import { Link } from "react-router-dom";
import { useFrameTemplates } from "../components/hooks/useFrameTemplates";
import type { FrameTemplate } from "../types/FrameTemplate";
import PartsModal from "../components/PartsModal";
import type { Part } from "../types/Part";
import { DndContext, DragOverlay, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortablePartItem } from "../components/Dnd";
type UniqueIdentifier = string | number;

// CSS文字列をオブジェクトに変換するヘルパー関数
const parseStyleString = (styleStr: string): Record<string, string> => {
  const styles: Record<string, string> = {};
  if (!styleStr) return styles;

  styleStr.split(";").forEach((style) => {
    const [property, value] = style.split(":").map((s) => s.trim());
    if (property && value) {
      // CSS property をキャメルケースに変換
      const camelProperty = property.replace(/-([a-z])/g, (match, letter) =>
        letter.toUpperCase()
      );
      styles[camelProperty] = value;
    }
  });
  return styles;
};

export default function AssembleView() {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [localParts, setLocalParts] = useState<Part[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [viewMode, setViewMode] = useState<"parts" | "code">("parts");
  const [generatedHtml, setGeneratedHtml] = useState("");

  const { templates } = useFrameTemplates();
  const { parts, addPart, updatePart, deletePart, updatePartsOrder } =
    useParts();

  // 外側フレームテンプレートを自動検出（名前が「外側フレーム」で始まるもの）
  const outerFrameTemplate = templates.find((tpl) =>
    tpl.name.startsWith("外側フレーム")
  );

  // LocalStorageからtableスタイルを読み込み
  const [tableStyles, setTableStyles] = useState({
    outerTable:
      "width: 100%; border: 0; cellspacing: 0; cellpadding: 0; background-color: #f4f4f4;",
    outerTd: "text-align: center;",
    innerTable:
      "width: 600px; max-width: 100%; border: 0; cellspacing: 0; cellpadding: 0; background-color: #ffffff;",
    innerTd: "padding: 0;",
  });

  useEffect(() => {
    const savedStyles = localStorage.getItem("tableStyles");
    if (savedStyles) {
      setTableStyles(JSON.parse(savedStyles));
    }
  }, []);

  //モーダルの開閉
  const [showPartsModal, setShowPartsModal] = useState(false);
  //モーダルに渡すフレーム情報
  const [selectedFrameTemplateForModal, setSelectedFrameTemplateForModal] =
    useState<FrameTemplate | null>(null);
  //編集するパーツ情報
  const [editingPart, setEditingPart] = useState<Part | null>(null);
  //パーツ作成用の状態
  const [newPartName, setNewPartName] = useState("");
  const [newPartContent, setNewPartContent] = useState("");

  // 初期読み込み時にローカル状態を同期
  useEffect(() => {
    setLocalParts(parts);
  }, [parts]);

  // 保存ボタンの処理（並び替えの結果を保存）
  const handleSave = async () => {
    // 並び替えの結果をデータベースに反映
    const orderedParts = localParts.map((p, index) => ({
      id: p.id,
      order_index: index,
    }));

    await updatePartsOrder(orderedParts);
    setHasUnsavedChanges(false);
  };

  // HTMLコード生成機能
  const generateHtmlCode = () => {
    const htmlParts = localParts
      .map((part) => {
        // frameにcontentを挿入
        if (part.content && part.content.trim()) {
          return part.frame.replace(/{{content}}/g, part.content);
        }
        // contentが空の場合はそのままframeを返す
        return part.frame;
      })
      .join("\n");

    // 外側フレームテンプレートがある場合は、それで全体をラップ
    let finalHtml = htmlParts;
    if (outerFrameTemplate) {
      finalHtml = outerFrameTemplate.frame.replace(/{{content}}/g, htmlParts);
    }

    setGeneratedHtml(finalHtml);
    setViewMode("code");
  };

  // クリップボードにコピー
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedHtml);
      alert("HTMLコードをクリップボードにコピーしました！");
    } catch (error) {
      alert("コピーに失敗しました");
    }
  };

  // パーツ作成機能
  const handleCreatePart = async () => {
    if (
      !newPartName.trim() ||
      !newPartContent.trim() ||
      !selectedFrameTemplateForModal
    ) {
      alert("パーツ名、コンテンツ、選択されたフレームが必要です");
      return;
    }

    await addPart(
      newPartName,
      selectedFrameTemplateForModal.frame,
      selectedFrameTemplateForModal.id,
      newPartContent
    );
    setNewPartName("");
    setNewPartContent("");
    alert("パーツが作成されました！");
  };

  // フレームリストのボタンクリック
  const handleFrameClick = (tpl: FrameTemplate) => {
    setSelectedFrameTemplateForModal(tpl);
    setShowPartsModal(true);
    setEditingPart(null);
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setShowPartsModal(false);
    setSelectedFrameTemplateForModal(null);
    setEditingPart(null);
  };

  // パーツ編集開始
  const handleEditPart = (part: Part) => {
    const frameOfPart = templates.find((tpl) => tpl.id === part.frame_id);
    setSelectedFrameTemplateForModal(frameOfPart || null);
    setEditingPart(part);
    setShowPartsModal(true);
  };

  return (
    <Layout title="組み立てる">
      <Link className="linkBtn" to="/Generate">
        ← フレームを作るボタン
      </Link>

      {/* 保存ボタン */}
      <div className="saveBtns">
        <button
          onClick={handleSave}
          disabled={!hasUnsavedChanges}
          className={hasUnsavedChanges ? "is-save" : "is-saved"}
        >
          {hasUnsavedChanges ? "保存する" : "保存済み"}
        </button>
        <button
          onClick={() => {
            if (viewMode === "parts") {
              generateHtmlCode();
            } else {
              setViewMode("parts");
            }
          }}
          disabled={localParts.length === 0}
        >
          {viewMode === "parts" ? "HTML" : "previewを確認"}
        </button>
      </div>

      <div className="contentsWrap">
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={(event) => {
            const { active, over } = event;
            if (!over) return;

            const activeId = active.id.toString();
            const overId = over.id.toString();

            // パーツ同士での並び替え
            if (activeId.startsWith("part-") && overId.startsWith("part-")) {
              const activePartId = parseInt(activeId.replace("part-", ""));
              const overPartId = parseInt(overId.replace("part-", ""));

              if (activePartId !== overPartId) {
                const oldIndex = localParts.findIndex(
                  (p) => p.id === activePartId
                );
                const newIndex = localParts.findIndex(
                  (p) => p.id === overPartId
                );

                if (oldIndex !== -1 && newIndex !== -1) {
                  const newParts = [...localParts];
                  const [movedPart] = newParts.splice(oldIndex, 1);
                  newParts.splice(newIndex, 0, movedPart);
                  setLocalParts(newParts);
                  setHasUnsavedChanges(true);
                }
              }
            }
            setActiveId(null);
          }}
          onDragStart={(event) => setActiveId(event.active.id.toString())}
        >
          <div className="contents is-works">
            {/* 外側フレーム適用状態を表示 */}
            {outerFrameTemplate && (
              <div>外側フレーム適用中: {outerFrameTemplate.name}</div>
            )}

            {/* HTMLメール風のコンテナ */}
            <div
              style={{
                margin: 0,
                padding: 0,
                backgroundColor: "#f4f4f4",
                fontFamily:
                  "'Hiragino Sans', 'ヒラギノ角ゴ ProN', 'Meiryo', 'メイリオ', sans-serif",
              }}
            >
              {/* table構造をdivに変更してDnDエラーを解決 */}
              <div
                style={
                  {
                    width: "100%",
                    backgroundColor: "#f4f4f4",
                    display: "table",
                    ...parseStyleString(tableStyles.outerTable),
                  } as any
                }
              >
                <div
                  style={
                    {
                      display: "table-cell",
                      textAlign: "center",
                      ...parseStyleString(tableStyles.outerTd),
                    } as any
                  }
                >
                  <div
                    style={
                      {
                        width: "600px",
                        maxWidth: "100%",
                        backgroundColor: "#ffffff",
                        margin: "0 auto",
                        ...parseStyleString(tableStyles.innerTable),
                      } as any
                    }
                  >
                    <div
                      style={
                        {
                          padding: 0,
                          ...parseStyleString(tableStyles.innerTd),
                        } as any
                      }
                    >
                      {viewMode === "parts" ? (
                        // 既存のパーツ表示（DnD機能付き）
                        <SortableContext
                          items={localParts.map((p) => `part-${p.id}`)}
                          strategy={verticalListSortingStrategy}
                        >
                          {/* パーツ一覧 */}
                          {localParts.length > 0 ? (
                            localParts.map((part) => (
                              <SortablePartItem
                                key={part.id}
                                part={part}
                                onEdit={() => handleEditPart(part)}
                                onDelete={async () => {
                                  // データベースから削除
                                  await deletePart(part.id);

                                  // ローカル状態からも削除（useEffectで同期されるが、即座に反映するため）
                                  setLocalParts((prev) =>
                                    prev.filter((p) => p.id !== part.id)
                                  );
                                }}
                              />
                            ))
                          ) : (
                            <div className="drop-placeholder">
                              パーツをドラッグして並べてください
                            </div>
                          )}
                        </SortableContext>
                      ) : (
                        // HTMLコード表示
                        <div className="code-view">
                          <div className="code-header">
                            <button
                              className="copy-btn"
                              onClick={copyToClipboard}
                            >
                              📋 copy
                            </button>
                          </div>
                          <pre className="code-display">
                            <code>{generatedHtml}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="contents">
            {/* フレーム一覧ここから */}
            <div className="frameList">
              {templates.map((tpl) => (
                <button
                  className={`frameList_item ${
                    selectedFrameTemplateForModal?.id === tpl.id
                      ? "is-active"
                      : ""
                  }`}
                  key={tpl.id}
                  onClick={() => handleFrameClick(tpl)}
                >
                  <div>{tpl.name}</div>
                </button>
              ))}
            </div>
            {/* フレーム一覧ここまで */}

            {/* PartsModal コンポーネント */}
            <PartsModal
              isOpen={showPartsModal}
              onClose={handleCloseModal}
              selectedFrameTemplate={selectedFrameTemplateForModal}
              addPart={addPart}
              updatePart={updatePart}
              editingPart={editingPart}
            />
          </div>

          {/* ドラッグ中のパーツの名前 */}
          <DragOverlay>
            {activeId ? (
              <div className="drag-preview">
                {localParts.find((p) => `part-${p.id}` === activeId)?.name}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </Layout>
  );
}
