import { useEffect, useState } from "react";
import type { FrameTemplate } from "../types/FrameTemplate";
import type { Part } from "../types/Part";
import { formatHtmlCode, handleTabKeyInTextarea } from "./hooks/format";
import React from "react";

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
    // editingPartのみに依存し、isOpenは除外（無限ループを防ぐ）
  }, [editingPart]);

  // モーダルが開いたときの初期化は別のuseEffectで処理
  useEffect(() => {
    if (isOpen && !editingPart) {
      // 新規作成モードでモーダルが開いたときのみフォームをクリア
      setPartName("");
      setPartContent("");
      setCurEditingPartId(null);
      setCurEditingPartName("");
      setCurEditingPartContent("");
    }
  }, [isOpen]); // isOpenのみに依存

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

  // HTMLフォーマット関数（編集中コンテンツ用）
  const formatEditingHtml = () => {
    const formatted = formatHtmlCode(curEditingPartContent);
    setCurEditingPartContent(formatted);
  };

  // HTMLフォーマット関数（新規作成コンテンツ用）
  const formatNewHtml = () => {
    const formatted = formatHtmlCode(partContent);
    setPartContent(formatted);
  };

  // テキストエリアでTabキーの処理（編集用）
  const handleEditingKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    handleTabKeyInTextarea(e, curEditingPartContent, setCurEditingPartContent);
  };

  // テキストエリアでTabキーの処理（新規用）
  const handleNewKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    handleTabKeyInTextarea(e, partContent, setPartContent);
  };

  return (
    <div className="modal_bg">
      <div className="modal">
        <button className="modal_deleteBtn" onClick={onClose}>
          ×
        </button>

        <div className="modal_head">
          <h2>「{selectedFrameTemplate.name} 」に中身を追加</h2>
        </div>
        <div className="modal_contents">
          <div className="modal_inputArea">
            {/* パーツ編集フォーム */}
            {curEditingPartId !== null && ( // 編集モードの場合のみ表示
              <div className="input_item">
                <div className="title">パーツの名前</div>
                <input
                  value={curEditingPartName}
                  onChange={(e) => setCurEditingPartName(e.target.value)}
                  placeholder="パーツ名"
                  style={{
                    width: "100%",
                    padding: "8px",
                    marginBottom: "10px",
                  }}
                />
                <div className="input_item">
                  <div className="titleWrap">
                    <div className="title">パーツを編集</div>
                    <button
                      className="adjustButton"
                      onClick={formatEditingHtml}
                      type="button"
                      disabled={!curEditingPartContent.trim()}
                    >
                      コード整形
                    </button>
                  </div>
                  <textarea
                    className="codeEditor"
                    value={curEditingPartContent}
                    onChange={(e) => setCurEditingPartContent(e.target.value)}
                    onKeyDown={handleEditingKeyDown}
                    placeholder="中身（HTMLコード）"
                    spellCheck={false}
                    style={{
                      width: "100%",
                      marginBottom: "10px",
                      minHeight: "150px",
                    }}
                  />
                </div>
                <div className="inputBtn_wrap">
                  <button className="inputBtn" onClick={handleUpdatePart}>
                    更新
                  </button>
                  <button className="inputBtn" onClick={handleCancelEdit}>
                    キャンセル
                  </button>
                </div>
              </div>
            )}

            {/* フレームの中身を入力 */}
            {curEditingPartId === null && (
              <>
                <div className="input_item">
                  <div className="title">パーツ名</div>
                  <input
                    value={partName}
                    onChange={(e) => setPartName(e.target.value)}
                    placeholder="パーツ名"
                  />
                </div>
                <div className="input_item">
                  <div className="titleWrap">
                    <div className="title">中身</div>
                    <button
                      className="adjustButton"
                      onClick={formatNewHtml}
                      type="button"
                      disabled={!partContent.trim()}
                    >
                      コード整形
                    </button>
                  </div>
                  <textarea
                    className="codeEditor"
                    value={partContent}
                    onChange={(e) => setPartContent(e.target.value)}
                    onKeyDown={handleNewKeyDown}
                    placeholder="ここにHTMLコードを入力..."
                    spellCheck={false}
                  />
                </div>
                <div className="inputBtn_wrap">
                  <button
                    className="inputBtn"
                    onClick={() => {
                      handleAddPart();
                    }}
                  >
                    保存
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartsModal;
