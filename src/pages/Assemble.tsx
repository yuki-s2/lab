import {
  DndContext,
  DragOverlay,
  useSensor,
  PointerSensor,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import Layout from "../layout/Layout";
import { Link } from "react-router-dom";

interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

function SortableItem({ id, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

interface Items extends Record<string, string[]> {
  box01: string[];
  box02: string[];
}
//React.Dispatch → useState フックによって返される state 更新関数 の型
//Record<string, React.Dispatch<React.SetStateAction<string[]>>> → キー 【string】, 値 【React.Dispatch<React.SetStateAction<string[]>>】
interface SetItems
  extends Record<string, React.Dispatch<React.SetStateAction<string[]>>> {
  box01: React.Dispatch<React.SetStateAction<string[]>>;
  box02: React.Dispatch<React.SetStateAction<string[]>>;
}

function App() {
  //sensors → どの種類の入力デバイスからのドラッグ＆ドロップ操作を監視するかを @dnd-kit/core に伝えます。
  const sensors = useSensor(PointerSensor);
  const [box01Items, setBox01Items] = useState<string[]>([
    "box01-item10",
    "box01-item20",
    "box01-item30",
  ]);
  const [box02Items, setBox02Items] = useState<string[]>([
    "box02-item3",
    "box02-item4",
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);

  const items: Items = {
    box01: box01Items,
    box02: box02Items,
  };

  const setItems: SetItems = {
    box01: setBox01Items,
    box02: setBox02Items,
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      //keyof Items → 型 'box01' | 'box02' このいずれかの文字列リテラル型であるという意味
      const activeContainer =
        typeof active.id === "string"
          ? (active.id.split("-")[0] as keyof Items)
          : null;
      const overContainer =
        typeof over?.id === "string"
          ? (over.id.split("-")[0] as keyof Items)
          : null;

      if (activeContainer && overContainer) {
        const activeIndex = items[activeContainer].indexOf(active.id as string);
        const overIndex = items[overContainer].indexOf(over.id as string);

        if (activeContainer === overContainer) {
          setItems[activeContainer]((currentItems) =>
            arrayMove(currentItems, activeIndex, overIndex)
          );
        } else if (activeContainer !== "box01" && overContainer !== "box02") {
          const activeItem = items[activeContainer][activeIndex];
          setItems[overContainer]((currentItems) => [
            ...currentItems,
            `${overContainer}-${activeItem.split("-")[1]}-${uuidv4()}`,
          ]);
        }
      }
    }

    setActiveId(null);
  };

  return (
    <Layout title="組み立てる">
      <Link className="btn" to="/">
        組み立てる
      </Link>
      <div className="wrap" style={{ display: "flex" }}>
        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          sensors={[sensors]}
        >
          <div className="box01">
            <SortableContext id="box01" items={box01Items}>
              {box01Items.map((id) => (
                <SortableItem key={id} id={id}>
                  <div>{id}</div>
                </SortableItem>
              ))}
            </SortableContext>
          </div>

          <div className="box02">
            <SortableContext id="box02" items={box02Items}>
              {box02Items.map((id) => (
                <SortableItem key={id} id={id}>
                  <div>{id}</div>
                </SortableItem>
              ))}
            </SortableContext>
          </div>

          <DragOverlay>{activeId && <div>{activeId}</div>}</DragOverlay>
        </DndContext>
      </div>
    </Layout>
  );
}

export default App;
