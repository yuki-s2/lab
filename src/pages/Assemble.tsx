import { useState } from "react";
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
import {
  DraggablePartItem,
  SortablePartItem,
  createHandleDragEnd,
  type DroppedPart,
} from "./Dnd";

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
  const [droppedParts, setDroppedParts] = useState<DroppedPart[]>([]);

  const { templates } = useFrameTemplates();
  const { parts, addPart, updatePart, deletePart } = useParts();
  //モーダルの開閉
  const [showPartsModal, setShowPartsModal] = useState(false);
  //モーダルに渡すフレーム情報
  const [selectedFrameTemplateForModal, setSelectedFrameTemplateForModal] =
    useState<FrameTemplate | null>(null);
  //編集するパーツ情報
  const [editingPart, setEditingPart] = useState<Part | null>(null);

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
      {selectedFrameTemplateForModal && (
        <h3>選択中のフレーム: {selectedFrameTemplateForModal.name}</h3>
      )}
      <div className="contentsWrap">
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={createHandleDragEnd(
            parts,
            droppedParts,
            setDroppedParts,
            setActiveId
          )}
          onDragStart={(event) => setActiveId(event.active.id.toString())}
        >
          <div className="contents is-works">
            {/* 受け取る */}
            <SortableContext
              items={droppedParts.map((p) => `dropped-${p.uid}`)}
              strategy={verticalListSortingStrategy}
            >
              <DroppableArea>
                {droppedParts.length > 0 ? (
                  droppedParts.map((part) => (
                    <SortablePartItem
                      key={part.uid}
                      part={part}
                      onEdit={() => handleEditPart(part)}
                      onDelete={() => deletePart(part.id)}
                    />
                  ))
                ) : (
                  <div className="drop-placeholder">Drop here</div>
                )}
              </DroppableArea>
            </SortableContext>
            {/* 受け取る */}
          </div>
          <div className="contents">
            {/* ★フレームリストをプルダウンに置き換え */}
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

            {/* パーツ一覧 */}
            <div style={{ marginBottom: "20px" }}>
              {parts.length === 0 ? (
                <p>パーツはまだありません...</p>
              ) : (
                <div className="partsList">
                  {parts.map((part) => (
                    //dnd-kit の id は内部的に string 型を想定して使われている
                    <DraggablePartItem
                      key={part.id}
                      part={part}
                      onEdit={() => handleEditPart(part)}
                      onDelete={() => deletePart(part.id)}
                    />
                  ))}
                </div>
              )}
            </div>

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
                {
                  parts
                    .concat(droppedParts)
                    .find((p) => `part-${p.id}` === activeId)?.name
                }
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </Layout>
  );
}
