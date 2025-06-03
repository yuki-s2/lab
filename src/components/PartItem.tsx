//パーツの名前とフレームを表示
import type { Part } from "../types/Part";

// フレームの最も深い要素にコンテンツを挿入する関数
function insertContentToDeepestElement(
    frame: string,
    content: string | null
  ): string {
  
    const parser = new DOMParser();
    const doc = parser.parseFromString(frame, "text/html");
    const root = doc.body.firstElementChild;
  
    const findDeepest = (node: Element): Element => {
      const firstChild = Array.from(node.children).find(
        (child) => child.nodeType === Node.ELEMENT_NODE
      );

      return firstChild ? findDeepest(firstChild) : node;
    };
  
    if (root) {
      const target = findDeepest(root);
      target.innerHTML = content || "";
      return root.outerHTML;
    }
  
    return frame;
  }

type Props = {
  part: Part;
  onEdit: () => void;
  onDelete: () => void;
};

export default function PartItem({ part, onEdit, onDelete }: Props) {
  return (
    <div>
      <div>{part.name}</div>
      {part.frame && (
        <div
          dangerouslySetInnerHTML={{
            __html: insertContentToDeepestElement(part.frame, part.content),
          }}
        />
      )}
      <div>
        <button onClick={onEdit}>編集</button>
        <button onClick={onDelete}>削除</button>
      </div>
    </div>
  );
}
