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
  ) => Promise<Part | null>;
  updatePart: (id: number, name: string, content: string) => Promise<void>;
  editingPart: Part | null;
  onPartCreated?: (part: Part) => void;
}

const PartsModal: React.FC<PartsModalProps> = ({
  isOpen,
  onClose,
  selectedFrameTemplate,
  addPart,
  updatePart,
  editingPart,
  onPartCreated,
}) => {
  // モーダルが閉じていたら何もレンダリングしない
  if (!isOpen || !selectedFrameTemplate) return null;

  const [partName, setPartName] = useState("");
  const [partContent, setPartContent] = useState("");
  const [curEditingPartId, setCurEditingPartId] = useState<number | null>(null);
  const [curEditingPartName, setCurEditingPartName] = useState("");
  const [curEditingPartContent, setCurEditingPartContent] = useState("");

  // モーダルが開かれたとき、またはeditingPartが変更されたときに、フォームの値をセット
  useEffect(() => {
    if (editingPart) {
      setCurEditingPartId(editingPart.id);
      setCurEditingPartName(editingPart.name);
      setCurEditingPartContent(editingPart.content ?? "");
      setPartName("");
      setPartContent("");
    } else {
      // editingPartがnullの場合は新規追加モードとしてフォームをクリア
      setCurEditingPartId(null);
      setCurEditingPartName("");
      setCurEditingPartContent("");
      setPartName("");
      setPartContent("");
    }
    //editingPart または isOpen のいずれかが変更されたら再実行
  }, [editingPart, isOpen]); // isOpenも依存配列に追加し、モーダルの開閉でリセットされるようにする

  // パーツ追加
  const handleAddPart = async () => {
    if (selectedFrameTemplate && partName.trim()) {
      const createdPart = await addPart(
        partName.trim(),
        selectedFrameTemplate.frame,
        selectedFrameTemplate.id,
        partContent.trim()
      );

      // パーツが正常に作成された場合、ワークエリアに追加
      if (createdPart && onPartCreated) {
        onPartCreated(createdPart);
      }

      setPartName("");
      setPartContent("");
      setCurEditingPartId(null);
      onClose();
    }
  };

  // パーツ更新
  const handleUpdatePart = async () => {
    if (curEditingPartId !== null) {
      await updatePart(
        curEditingPartId,
        curEditingPartName,
        curEditingPartContent
      );
      setCurEditingPartId(null);
      setCurEditingPartName("");
      setCurEditingPartContent("");
      onClose();
    }
  };

  // パーツ編集キャンセル
  const handleCancelEdit = () => {
    setCurEditingPartId(null);
    setCurEditingPartName("");
    setCurEditingPartContent("");
    onClose();
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
        {curEditingPartId !== null && ( // 編集モードの場合のみ表示
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
              value={curEditingPartName}
              onChange={(e) => setCurEditingPartName(e.target.value)}
              placeholder="パーツ名"
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
            />
            <textarea
              value={curEditingPartContent}
              onChange={(e) => setCurEditingPartContent(e.target.value)}
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
        {curEditingPartId === null && (
          <>
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
          </>
        )}
        {/* フレームの中身を入力 */}
      </div>
    </div>
  );
};

export default PartsModal;
