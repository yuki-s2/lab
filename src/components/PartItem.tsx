import { insertContentToDeepestElement } from "../lib/insertContentToDeepestElement";
import type { Part } from "../types/Part";

type Props = {
  part: Part;
  compact?: boolean;
};

export default function PartItem({ part, compact = false }: Props) {
  if (compact) {
    return (
      <div
        dangerouslySetInnerHTML={{
          __html: insertContentToDeepestElement(part.frame, part.content),
        }}
      />
    );
  }

  return (
    <div className="part">
      <div className="preview">
        <div
          dangerouslySetInnerHTML={{
            __html: insertContentToDeepestElement(part.frame, part.content),
          }}
        />
      </div>
    </div>
  );
}
