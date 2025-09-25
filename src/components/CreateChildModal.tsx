import { useState } from "react";

// 子要素作成モーダル
interface CreateChildModalProps {
  onSave: (name: string, content: string) => void;
  onClose: () => void;
  fullHtmlForReference: string;
}

export function CreateChildModal({
  onSave,
  onClose,
  fullHtmlForReference,
}: CreateChildModalProps) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const handleSave = () => {
    if (name.trim() && content.trim()) {
      onSave(name, content);
    }
  };
  

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "20px",
          width: "80%",
          maxWidth: "600px",
          maxHeight: "80%",
          overflow: "auto",
        }}
      >
        <h3>新しい子要素を作成</h3>

        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            名前:
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: メインボタン"
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            HTMLコンテンツ:
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="例: <button>クリック</button>"
            rows={4}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontFamily: "monospace",
            }}
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            参考: 現在のHTMLコード
          </label>
          <pre
            style={{
              fontSize: "11px",
              backgroundColor: "#f8f9fa",
              padding: "12px",
              borderRadius: "4px",
              maxHeight: "150px",
              overflow: "auto",
              border: "1px solid #eee",
            }}
          >
            {fullHtmlForReference}
          </pre>
        </div>

        <div
          style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              border: "1px solid #ddd",
              backgroundColor: "white",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !content.trim()}
            style={{
              padding: "8px 16px",
              border: "none",
              backgroundColor:
                name.trim() && content.trim() ? "#007bff" : "#ccc",
              color: "white",
              borderRadius: "4px",
              cursor: name.trim() && content.trim() ? "pointer" : "not-allowed",
            }}
          >
            作成
          </button>
        </div>
      </div>
    </div>
  );
}
