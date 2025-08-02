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

export default function AssembleView() {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [localParts, setLocalParts] = useState<Part[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [viewMode, setViewMode] = useState<"parts" | "code">("parts");
  const [generatedHtml, setGeneratedHtml] = useState("");

  const { templates } = useFrameTemplates();
  const { parts, addPart, updatePart, deletePart, updatePartsOrder } =
    useParts();
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

    setGeneratedHtml(htmlParts);
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
      <div className="save-controls">
        <button
          onClick={handleSave}
          disabled={!hasUnsavedChanges}
          className={hasUnsavedChanges ? "save-btn unsaved" : "save-btn"}
        >
          {hasUnsavedChanges ? "save" : "saved"}
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
          className="export-btn"
        >
          {viewMode === "parts" ? "HTML" : "preview"}
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
            <div
              style={
                {
                  fontFamily:
                    "'Hiragino Sans', 'ヒラギノ角ゴ ProN', 'Meiryo', 'メイリオ', sans-serif",
                  backgroundColor: "#fce7f3",
                  margin: 0,
                  padding: 0,
                  WebkitTextSizeAdjust: "100%",
                  textSizeAdjust: "100%",
                } as any
              }
            >
              <table
                align="center"
                border={0}
                cellPadding="0"
                cellSpacing="0"
                width="100%"
                style={
                  {
                    borderCollapse: "collapse",
                    msoTableLspace: "0pt",
                    msoTableRspace: "0pt",
                    backgroundColor: "#fce7f3",
                  } as any
                }
              >
                <tr>
                  <td align="center" style={{ padding: "20px 0" }}>
                    <table
                      align="center"
                      border={0}
                      cellPadding="0"
                      cellSpacing="0"
                      width="600"
                      style={
                        {
                          borderCollapse: "collapse",
                          msoTableLspace: "0pt",
                          msoTableRspace: "0pt",
                          backgroundColor: "#ffffff",
                          borderRadius: "20px",
                          overflow: "hidden",
                          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                        } as any
                      }
                    >
                      <tr>
                        <td align="center">
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
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
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
