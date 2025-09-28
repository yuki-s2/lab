import type { Part } from "../types/Part";

type Props = {
  part: Part;
  customHtml?: string; // 子要素を含むHTMLを外部から渡せるように
};

export default function PartItem({ part, customHtml }: Props) {
  const renderedContent = customHtml || part.frame;

  return (
    <div
      className={`part ${part.selected_children_ids.length > 0 ? "" : "is-empty"}`}
    >
      <div className="preview">
        <div
          dangerouslySetInnerHTML={{
            __html: renderedContent,
          }}
        />
      </div>
    </div>
  );
}
