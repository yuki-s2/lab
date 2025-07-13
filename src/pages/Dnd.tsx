import { useDraggable, type DragEndEvent } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { nanoid } from "nanoid";
import React from "react";
import type { Part } from "../types/Part";
import PartItem from "../components/PartItem";

type Props = {
  id: string;
  children: React.ReactNode;
};

type DroppedPart = Part & { uid: string };

export function DraggablePartItem({
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
        <PartItem part={part} />
      </div>
      <div className="partBtns">
        <button className="is-edit" onClick={onEdit}>
          <span>|||</span>
        </button>
        <button onClick={onDelete}>×</button>
      </div>
    </div>
  );
}

export function SortablePartItem({
  part,
  onEdit,
  onDelete,
}: {
  part: DroppedPart;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: `dropped-${part.uid}` });

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
        <PartItem part={part} />
      </div>
      {/* <div className="partBtns">
        <button className="is-edit" onClick={onEdit}>
          <span>|||</span>
        </button>
        <button onClick={onDelete}>×</button>
      </div> */}
    </div>
  );
}

export const createHandleDragEnd = (
  parts: Part[],
  droppedParts: DroppedPart[],
  setDroppedParts: React.Dispatch<React.SetStateAction<DroppedPart[]>>,
  setActiveId: React.Dispatch<React.SetStateAction<string | number | null>>
) => {
  return (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // 新しいパーツをドロップエリアにドロップする場合
    const part = parts.find((p) => `part-${p.id}` === activeId);
    if (part && overId === "droppable-area") {
      // 複製として新しいIDを生成
      const newDroppedPart: DroppedPart = {
        ...part,
        uid: nanoid(),
      };

      setDroppedParts((prev) => [...prev, newDroppedPart]);
      setActiveId(null);
      return;
    }

    // 既存のドロップされたパーツの並び替えの場合
    if (activeId.startsWith("dropped-") && overId.startsWith("dropped-")) {
      const activeDroppedPartId = activeId.replace("dropped-", "");
      const overDroppedPartId = overId.replace("dropped-", "");

      if (activeDroppedPartId !== overDroppedPartId) {
        setDroppedParts((prev) => {
          const oldIndex = prev.findIndex((p) => p.uid === activeDroppedPartId);
          const newIndex = prev.findIndex((p) => p.uid === overDroppedPartId);

          if (oldIndex !== -1 && newIndex !== -1) {
            const newParts = [...prev];
            const [movedPart] = newParts.splice(oldIndex, 1);
            newParts.splice(newIndex, 0, movedPart);
            return newParts;
          }

          return prev;
        });
      }
    }

    setActiveId(null);
  };
};

export type { DroppedPart };
