export function insertContentToDeepestElement(
  frame: string,
  content: string | null
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(frame, "text/html");
  const root = doc.body.firstElementChild;

  const findDeepest = (node: Element): Element => {
    const firstChild = Array.from(node.children).find(
      (child) => child.nodeType === Node.ELEMENT_NODE
    );
    return firstChild ? findDeepest(firstChild) : node;
  };

  if (root) {
    const target = findDeepest(root);
    target.innerHTML = content || "";
    return root.outerHTML;
  }
  return frame;
}
