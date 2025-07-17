import { useState, useEffect } from "react";
import Layout from "../layout/Layout";
import { useParts } from "../components/hooks/useParts";
import { Link } from "react-router-dom";
import { useFrameTemplates } from "../components/hooks/useFrameTemplates";
import type { FrameTemplate } from "../types/FrameTemplate";
import PartsModal from "../components/PartsModal";
import type { Part } from "../types/Part";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortablePartItem } from "./Dnd";

type UniqueIdentifier = string | number;

function DroppableArea({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: "droppable-area" });

  return (
    <div
      ref={setNodeRef}
      className={`droppableArea ${isOver ? "is-over" : ""}`}
    >
      {children}
    </div>
  );
}

export default function AssembleView() {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [localParts, setLocalParts] = useState<Part[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

  // パーツをワークエリアに追加
  const handleAddPartToWork = async (part: Part) => {
    // パーツは既にデータベースに保存されているので、
    // useEffectで自動同期される
    // 特に追加処理は不要
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

  // ★プルダウンのonChangeハンドラ
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(event.target.value, 10); // valueは文字列なので数値に変換
    const selectedTpl = templates.find((tpl) => tpl.id === selectedId);

    if (selectedTpl) {
      handleFrameClick(selectedTpl); // 見つかったテンプレートでモーダルを開く
    } else {
      // "選択してください" が選ばれた場合や、見つからなかった場合の処理
      setSelectedFrameTemplateForModal(null);
      setShowPartsModal(false);
      setEditingPart(null);
    }
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
          {hasUnsavedChanges ? "保存する" : "保存済み"}
        </button>
      </div>

      {selectedFrameTemplateForModal && (
        <h3>選択中のフレーム: {selectedFrameTemplateForModal.name}</h3>
      )}
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
            <SortableContext
              items={localParts.map((p) => `part-${p.id}`)}
              strategy={verticalListSortingStrategy}
            >
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
          </div>
          <div className="contents">
            {/* フレーム一覧ここから */}
            <div className="frameList">
              <select
                id="frame-select"
                className="frameList_select"
                value={selectedFrameTemplateForModal?.id || ""} // 選択中のIDを設定、未選択なら空文字列
                onChange={handleSelectChange}
              >
                <option
                  className="frameList_selectBtn"
                  value=""
                  disabled
                  hidden
                >
                  フレームを選択してください
                </option>
                {templates.map((tpl) => (
                  <option
                    className="frameList_selectItem"
                    key={tpl.id}
                    value={tpl.id}
                  >
                    {tpl.name}
                  </option>
                ))}
              </select>
            </div>
            {/* フレーム一覧ここまで */}

            {/* パーツ作成セクション */}
            {selectedFrameTemplateForModal && (
              <div
                className="inputArea"
                style={{
                  marginTop: "2rem",
                  padding: "1rem",
                  border: "1px solid #ccc",
                  borderRadius: "0.5rem",
                }}
              >
                <h3>パーツを作成</h3>
                <div className="input_item">
                  <div className="title">パーツ名</div>
                  <input
                    value={newPartName}
                    onChange={(e) => setNewPartName(e.target.value)}
                    placeholder="パーツ名を入力"
                  />
                </div>
                <div className="input_item">
                  <div className="title">パーツコンテンツ</div>
                  <textarea
                    value={newPartContent}
                    onChange={(e) => setNewPartContent(e.target.value)}
                    placeholder="パーツの中身を入力してください"
                    rows={3}
                  />
                </div>
                <div className="inputBtn_wrap">
                  <button className="inputBtn" onClick={handleCreatePart}>
                    パーツを作成
                  </button>
                </div>
              </div>
            )}

            {/* PartsModal コンポーネント */}
            <PartsModal
              isOpen={showPartsModal}
              onClose={handleCloseModal}
              selectedFrameTemplate={selectedFrameTemplateForModal}
              addPart={addPart}
              updatePart={updatePart}
              editingPart={editingPart}
              onPartCreated={handleAddPartToWork}
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
