import { useEffect, useState } from "react";
import type { FrameTemplate } from "../types/FrameTemplate";
import type { Part } from "../types/Part";
// ==========================================================
// PartsModal コンポーネントの定義
// ==========================================================
interface PartsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedFrameTemplate: FrameTemplate | null;
  addPart: (
    name: string,
    frame: string,
    frameId: number,
    content: string
  ) => Promise<void>;
  updatePart: (id: number, name: string, content: string) => Promise<void>;
  editingPart: Part | null;
}

const PartsModal: React.FC<PartsModalProps> = ({
  isOpen,
  onClose,
  selectedFrameTemplate,
  addPart,
  updatePart,
  editingPart,
}) => {
  // モーダルが閉じていたら何もレンダリングしない
  if (!isOpen || !selectedFrameTemplate) return null;

  const [partName, setPartName] = useState("");
  const [partContent, setPartContent] = useState("");
  const [currentEditingPartId, setCurrentEditingPartId] = useState<
    number | null
  >(null);
  const [currentEditingPartName, setCurrentEditingPartName] = useState("");
  const [currentEditingPartContent, setCurrentEditingPartContent] =
    useState("");

  // モーダルが開かれたとき、またはeditingPartが変更されたときに、フォームの値をセット
  useEffect(() => {
    if (editingPart) {
      setCurrentEditingPartId(editingPart.id);
      setCurrentEditingPartName(editingPart.name);
      setCurrentEditingPartContent(editingPart.content ?? "");
      setPartName("");
      setPartContent("");
    } else {
      // editingPartがnullの場合は新規追加モードとしてフォームをクリア
      setCurrentEditingPartId(null);
      setCurrentEditingPartName("");
      setCurrentEditingPartContent("");
      setPartName("");
      setPartContent("");
    }
    //editingPart または isOpen のいずれかが変更されたら再実行
  }, [editingPart, isOpen]); // isOpenも依存配列に追加し、モーダルの開閉でリセットされるようにする

  // パーツ追加
  const handleAddPart = async () => {
    if (selectedFrameTemplate && partName.trim()) {
      addPart(
        partName.trim(),
        selectedFrameTemplate.frame,
        selectedFrameTemplate.id,
        partContent.trim()
      );
      setPartName("");
      setPartContent("");
      // 新規追加後、編集モードを解除
      setCurrentEditingPartId(null);
    }
  };

  // パーツ更新
  const handleUpdatePart = async () => {
    if (currentEditingPartId !== null) {
      await updatePart(
        currentEditingPartId,
        currentEditingPartName,
        currentEditingPartContent
      );
      setCurrentEditingPartId(null); // 編集モードを終了
      setCurrentEditingPartName("");
      setCurrentEditingPartContent("");
    }
  };

  // パーツ編集キャンセル
  const handleCancelEdit = () => {
    setCurrentEditingPartId(null);
    setCurrentEditingPartName("");
    setCurrentEditingPartContent("");
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          width: "80%",
          maxWidth: "700px",
          maxHeight: "80%",
          overflowY: "auto",
        }}
      >
        <h2>フレーム： {selectedFrameTemplate.name} に中身を追加</h2>

        {/* パーツ編集フォーム */}
        {currentEditingPartId !== null && ( // 編集モードの場合のみ表示
          <div
            style={{
              background: "#f0f0f0",
              padding: "15px",
              borderRadius: "5px",
              marginTop: "20px",
            }}
          >
            <h3>パーツを編集</h3>
            <input
              value={currentEditingPartName}
              onChange={(e) => setCurrentEditingPartName(e.target.value)}
              placeholder="パーツ名"
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />
            <textarea
              value={currentEditingPartContent}
              onChange={(e) => setCurrentEditingPartContent(e.target.value)}
              placeholder="中身"
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "10px",
                minHeight: "100px",
              }}
            />
            <button
              onClick={handleUpdatePart}
              style={{
                marginRight: "10px",
                padding: "8px 15px",
                background: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              更新
            </button>
            <button
              onClick={handleCancelEdit}
              style={{
                padding: "8px 15px",
                background: "#f44336",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              キャンセル
            </button>
          </div>
        )}
        {/* フレームの中身を入力 */}
        <div className="inputArea bg-gray">
          <input
            value={partName}
            onChange={(e) => setPartName(e.target.value)}
            placeholder="パーツ名"
          />
          <textarea
            value={partContent}
            onChange={(e) => setPartContent(e.target.value)}
            placeholder="中身"
          />
        </div>
        <button
          onClick={() => {
            handleAddPart();
          }}
        >
          保存
        </button>
        {/* フレームの中身を入力 */}

        <button
          onClick={onClose}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          閉じる
        </button>
      </div>
    </div>
  );
};

export default PartsModal;
