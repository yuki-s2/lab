import { insertContentToDeepestElement } from "../lib/insertContentToDeepestElement";
import type { Part } from "../types/Part";

type Props = {
  part: Part;
  onEdit: () => void;
  onDelete: () => void;
};

export default function PartItem({ part, onEdit, onDelete }: Props) {
  return (
    <div className="part">
      {/* <h3>{part.name}</h3> */}
      {/* <pre>{part.part}</pre> */}
      <div className="preview">
        <div
          dangerouslySetInnerHTML={{
            __html: insertContentToDeepestElement(part.part, part.content),
          }}
        />
      </div>

      <div className="partBtns">
        <button onClick={onEdit}>|||</button>
        <button onClick={onDelete}>×</button>
      </div>
    </div>
  );
}
