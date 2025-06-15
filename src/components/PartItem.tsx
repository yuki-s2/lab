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
      <pre>{part.part}</pre>
      <div
        dangerouslySetInnerHTML={{
          __html: insertContentToDeepestElement(part.part, part.content),
        }}
      />

      <button onClick={onEdit}>編集</button>
      <button onClick={onDelete}>削除</button>
    </div>
  );
}
