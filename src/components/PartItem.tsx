import type { Part } from "../types/Part";

type Props = {
  part: Part;
  children?: React.ReactNode;
  customHtml?: string; // 子要素を含むHTMLを外部から渡せるように
};

export default function PartItem({
  part,
  children,
  customHtml,
}: Props) {
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
        {part.selected_children_ids.length > 0 ? (
          <div className="nested-parts">{children}</div>
        ) : (
          <p>ネストされたパーツはありません</p>
        )}
      </div>
    </div>
  );
}
