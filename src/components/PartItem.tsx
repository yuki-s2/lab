import { insertContentToDeepestElement } from "../lib/insertContentToDeepestElement";
import type { Part } from "../types/Part";

type Props = {
  part: Part;
  onEdit: () => void;
  onDelete: () => void;
};

export default function PartItem({ part, onEdit, onDelete }: Props) {
  return (
    <div>
      <h3>{part.name}</h3>
      <pre>{part.frame}</pre>
      <div
        dangerouslySetInnerHTML={{
          __html: insertContentToDeepestElement(part.frame, part.content),
        }}
      />

      <pre
        style={{ background: "#f8f8f8", padding: "1rem", overflowX: "auto" }}
      >
        {part.frame}
      </pre>

      {/* 実際のHTMLを描画 */}
      <h4>HTMLレンダリング結果</h4>
      <div
        style={{
          border: "1px dashed gray",
          padding: "1rem",
          marginBottom: "1rem",
        }}
        dangerouslySetInnerHTML={{ __html: part.frame }}
      />
      <button onClick={onEdit}>編集</button>
      <button onClick={onDelete}>削除</button>
    </div>
  );
}
