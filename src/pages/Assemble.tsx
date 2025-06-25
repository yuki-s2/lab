import { useState } from "react";
import Layout from "../layout/Layout";
import { useParts } from "../components/hooks/useParts";
import { Link } from "react-router-dom";
import { useFrameTemplates } from "../components/hooks/useFrameTemplates";
import type { FrameTemplate } from "../types/FrameTemplate";
import PartsModal from "../components/PartsModal";
import type { Part } from "../types/Part";
import PartItem from "../components/PartItem";

export default function AssembleView() {
  const { templates } = useFrameTemplates();
  const { parts, addPart, updatePart, deletePart } = useParts();

  const [showPartsModal, setShowPartsModal] = useState(false);
  const [selectedFrameTemplateForModal, setSelectedFrameTemplateForModal] =
    useState<FrameTemplate | null>(null);
    const [editingPartInAssembleView, setEditingPartInAssembleView] = useState<Part | null>(null);

  // フレームリストのボタンクリック
  const handleFrameClick = (tpl: FrameTemplate) => {
    setSelectedFrameTemplateForModal(tpl); // モーダルに渡すフレームを設定
    setShowPartsModal(true); // モーダルを表示
    setEditingPartInAssembleView(null);
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setShowPartsModal(false);
    setSelectedFrameTemplateForModal(null); // モーダルが閉じたら選択を解除
  };
  

    // パーツ編集開始
    const handleEditPart = (part: Part) => {
      // 編集対象のフレームテンプレートをセット
      const frameOfPart = templates.find(tpl => tpl.id === part.frame_id);
      setSelectedFrameTemplateForModal(frameOfPart || null);
  
      setEditingPartInAssembleView(part);
      setShowPartsModal(true); // モーダルを表示
    };



  return (
    <Layout title="組み立てる">
      <Link className="btn" to="/Generate">
        フレームを作るボタン
      </Link>
      {/* 例: モーダルで選択したフレームのHTMLを表示 */}
      {selectedFrameTemplateForModal && (
        <h3>選択中のフレーム: {selectedFrameTemplateForModal.name}</h3>
      )}
      <div className="contentsWrap">
        <div className="contents" style={{ background: "#f8ffc0" }}></div>
        <div className="contents" style={{ background: "#b1f6fa" }}>
          <div className="frameList">
            {templates.map((tpl) => (
              <button
                className={`frameList_item ${
                  tpl.id === selectedFrameTemplateForModal?.id
                    ? "is-active"
                    : ""
                }`}
                key={tpl.id}
                onClick={() => handleFrameClick(tpl)} // クリックでモーダルを開く
              >
                <div>{tpl.name}</div>
              </button>
            ))}
          </div>
          {/* フレーム一覧 */}

                  {/* パーツ一覧 */}
        <div style={{ marginBottom: "20px" }}>
          <h3>既存パーツ一覧</h3>
          {parts.length === 0 ? (
            <p>このフレームに紐づくパーツはまだありません。</p>
          ) : (
            <div className="partsList">
              {parts.map((part) => (
                <div className="partsList_item" key={part.id}>
                  <PartItem
                    part={part}
                    onEdit={() => handleEditPart(part)} 
                    onDelete={() => deletePart(part.id)}
                  />
                </div>
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
            editingPart={editingPartInAssembleView}
          />
        </div>
      </div>
    </Layout>
  );
}
