import { insertContentToDeepestElement } from "../lib/insertContentToDeepestElement";
import type { Part } from "../types/Part";

type Props = {
  part: Part;
};

export default function PartItem({ part }: Props) {
  return (
    <div className="part">
      <div className="preview">
        <div
          dangerouslySetInnerHTML={{
            __html: insertContentToDeepestElement(part.part, part.content),
          }}
        />
      </div>
    </div>
  );
}
