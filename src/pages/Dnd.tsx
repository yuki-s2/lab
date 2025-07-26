import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { useState, useEffect, useRef } from "react";
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

  const [isHovered, setIsHovered] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const mousePositionRef = useRef({ x: 0, y: 0 });

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.();
  };

  const handleMouseMove = (e: MouseEvent) => {
    mousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const checkMouseOutside = () => {
    const { x, y } = mousePositionRef.current;
    const el = elementRef.current;
    const btn = editButtonRef.current;

    if (!el) return;
    const rect = el.getBoundingClientRect();
    const btnRect = btn?.getBoundingClientRect();

    const insideEl =
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    const insideBtn = btnRect
      ? x >= btnRect.left &&
        x <= btnRect.right &&
        y >= btnRect.top &&
        y <= btnRect.bottom
      : false;

    if (!insideEl && !insideBtn) {
      setIsHovered(false);
      cancelAnimationFrame(animationFrameRef.current!);
      document.removeEventListener("mousemove", handleMouseMove);
    } else {
      animationFrameRef.current = requestAnimationFrame(checkMouseOutside);
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    document.addEventListener("mousemove", handleMouseMove);
    animationFrameRef.current = requestAnimationFrame(checkMouseOutside);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        elementRef.current = node;
      }}
      {...attributes}
      style={style}
      className="partsList_item"
      onMouseEnter={handleMouseEnter}
    >
      <div {...listeners} className="drag-handle">
        <PartItem part={part} compact={true} />
      </div>

      {isHovered && (
        <div className="partBtns">
          <button
            ref={editButtonRef}
            className="is-edit"
            onClick={handleEditClick}
            title="編集"
          >
            |||
          </button>
          <button
            ref={editButtonRef}
            className="is-delete"
            onClick={handleEditClick}
            title="削除"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
