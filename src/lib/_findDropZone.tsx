//パーツに空の要素があるかどうかを判定する
export function hasEmptyElement(html: string): boolean {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const root = doc.body.firstElementChild;

  if (!root) return false;

  // 空の要素が1つでもあればtrue
  return findEmptyElement(root) !== null;
}

function findEmptyElement(node: Element): Element | null {
  // 完全に空の要素かチェック（テキストなし、子要素なし）
  if (node.textContent?.trim() === "" && node.children.length === 0) {
    return node;
  }

  // 子要素を再帰的に調べる
  for (const child of node.children) {
    const emptyElement = findEmptyElement(child as Element);
    if (emptyElement) {
      return emptyElement;
    }
  }

  return null; // 空の要素が見つからない
}
