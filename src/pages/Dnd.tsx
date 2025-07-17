import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Part } from "../types/Part";
import PartItem from "../components/PartItem";

export function SortablePartItem({
  part,
  onEdit,
  onDelete,
}: {
  part: Part;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: `part-${part.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={style}
      className="partsList_item"
    >
      <div {...listeners} className="drag-handle">
        <PartItem part={part} compact={true} />
      </div>
    </div>
  );
}
