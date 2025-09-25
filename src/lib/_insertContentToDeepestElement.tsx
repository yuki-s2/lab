//もっとも深い層の空要素にcontentを追加する
export function insertContentToDeepestElement(
  part: string,
  content: string | null
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(part, "text/html");
  const root = doc.body.firstElementChild;

  const findEmptyElement = (node: Element): Element | null => {
    const textContent = node.textContent?.trim() || "";

    // 現在のノードが空、またはプレースホルダーテキストの場合
    const isEmptyOrPlaceholder =
      (textContent === "" && node.children.length === 0) ||
      textContent.includes("コンテンツを追加") ||
      textContent.includes("ここにコンテンツ") ||
      textContent.includes("ここにHTMLコードを入力") ||
      textContent.includes("テキストを入力") ||
      textContent === "..." ||
      /^[\s\u3000]*$/.test(textContent); // 空白文字のみ（全角スペース含む）

    if (isEmptyOrPlaceholder) {
      return node;
    }

    // 子要素（HTMLタグ）のみを取得
    const childElements = Array.from(node.children).filter(
      (child) => child.nodeType === Node.ELEMENT_NODE
    );

    // 各子要素を再帰的に調べる
    for (const child of childElements) {
      const emptyElement = findEmptyElement(child);
      if (emptyElement) {
        return emptyElement;
      }
    }

    return null; // 空の要素が見つからない
  };

  if (root) {
    const target = findEmptyElement(root);
    if (target) {
      console.log("空要素を発見:", {
        元のテキスト: target.textContent,
        挿入するコンテンツ: content,
      });
      target.innerHTML = content || "";
      return root.outerHTML;
    } else {
      console.log("空要素が見つかりませんでした:", part);
    }
  }

  // 空の要素が見つからない場合は、元のパーツをそのまま返す
  return part;
}
