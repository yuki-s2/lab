import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { useState, useEffect, useRef } from "react";
import type { Part } from "../types/Part";
import PartItem from "./PartItem";

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
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const mousePositionRef = useRef({ x: 0, y: 0 });

  const handleEditPart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.();
  };

  const handleDeletePart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.();
  };

  const handleMouseMove = (e: MouseEvent) => {
    mousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const checkMouseOutside = () => {
    const { x, y } = mousePositionRef.current;
    const el = elementRef.current;
    const editBtn = editButtonRef.current;
    const deleteBtn = deleteButtonRef.current;

    if (!el) return;
    const rect = el.getBoundingClientRect();
    const editBtnRect = editBtn?.getBoundingClientRect();
    const deleteBtnRect = deleteBtn?.getBoundingClientRect();

    const insideEl =
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

    const insideEditBtn = editBtnRect
      ? x >= editBtnRect.left &&
        x <= editBtnRect.right &&
        y >= editBtnRect.top &&
        y <= editBtnRect.bottom
      : false;

    const insideDeleteBtn = deleteBtnRect
      ? x >= deleteBtnRect.left &&
        x <= deleteBtnRect.right &&
        y >= deleteBtnRect.top &&
        y <= deleteBtnRect.bottom
      : false;

    if (!insideEl && !insideEditBtn && !insideDeleteBtn) {
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
            onClick={handleEditPart}
            title="編集"
          >
            <span>|||</span>
          </button>
          <button
            ref={deleteButtonRef}
            className="is-delete"
            onClick={handleDeletePart}
            title="削除"
          >
            <span>×</span>
          </button>
        </div>
      )}
    </div>
  );
}
