import { useState, useCallback } from "react";

// 自己終了タグかどうかを判定するユーティリティ関数
export const isSelfClosingTag = (tag: string): boolean => {
  const selfClosingTags = [
    "img",
    "br",
    "hr",
    "input",
    "meta",
    "link",
    "area",
    "base",
    "col",
    "embed",
    "source",
    "track",
    "wbr",
  ];
  const tagName = tag
    .replace(/[<>\/]/g, "")
    .split(" ")[0]
    .toLowerCase();
  return selfClosingTags.includes(tagName);
};

// HTMLコードをフォーマットするユーティリティ関数
export const formatHtmlCode = (htmlCode: string): string => {
  try {
    let formatted = htmlCode;

    // 改行とスペースを正規化
    formatted = formatted.replace(/>\s+</g, "><");
    formatted = formatted.replace(/\s+/g, " ");
    formatted = formatted.trim();

    // インデントを追加
    let indentLevel = 0;
    let result = "";
    let i = 0;

    while (i < formatted.length) {
      if (formatted[i] === "<") {
        // 終了タグの場合はインデントを減らす
        if (formatted[i + 1] === "/") {
          indentLevel = Math.max(0, indentLevel - 1);
        }

        // 現在の行にインデントを追加
        if (result && !result.endsWith("\n")) {
          result += "\n";
        }
        result += "  ".repeat(indentLevel);

        // タグ全体を取得
        let tagEnd = formatted.indexOf(">", i);
        let tag = formatted.substring(i, tagEnd + 1);
        result += tag;

        // 自己終了タグでない開始タグの場合はインデントを増やす
        if (
          formatted[i + 1] !== "/" &&
          !tag.endsWith("/>") &&
          !isSelfClosingTag(tag)
        ) {
          indentLevel++;
        }

        i = tagEnd + 1;
      } else {
        // テキストコンテンツを処理
        let textEnd = formatted.indexOf("<", i);
        if (textEnd === -1) textEnd = formatted.length;

        let text = formatted.substring(i, textEnd).trim();
        if (text) {
          if (result && !result.endsWith("\n")) {
            result += "\n";
          }
          result += "  ".repeat(indentLevel) + text;
        }

        i = textEnd;
      }
    }

    return result;
  } catch (error) {
    console.error("フォーマットエラー:", error);
    return htmlCode; // エラーの場合は元のコードを返す
  }
};

// テキストエリアでのTabキー処理を行うユーティリティ関数
export const handleTabKeyInTextarea = (
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  currentValue: string,
  setValue: (value: string) => void
) => {
  if (e.key === "Tab") {
    e.preventDefault();
    const textarea = e.target as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // タブ文字を挿入
    const newValue =
      currentValue.substring(0, start) +
      "  " + // 2つのスペース
      currentValue.substring(end);

    setValue(newValue);

    // カーソル位置を調整
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + 2;
    }, 0);
  }
};

// HTMLフォーマット機能を提供するカスタムフック
export const useHtmlFormatter = () => {
  // HTMLコードをフォーマットする関数
  const formatHtml = useCallback((htmlCode: string): string => {
    return formatHtmlCode(htmlCode);
  }, []);

  // テキストエリアでのTabキー処理関数
  const createTabKeyHandler = useCallback(
    (currentValue: string, setValue: (value: string) => void) => {
      return (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        handleTabKeyInTextarea(e, currentValue, setValue);
      };
    },
    []
  );

  return {
    formatHtml,
    createTabKeyHandler,
    isSelfClosingTag,
  };
};

// HTMLエディター用のカスタムフック
export const useHtmlEditor = (initialValue: string = "") => {
  const [htmlContent, setHtmlContent] = useState(initialValue);
  const { formatHtml, createTabKeyHandler } = useHtmlFormatter();

  // HTMLコンテンツをフォーマットする
  const formatContent = useCallback(() => {
    const formatted = formatHtml(htmlContent);
    setHtmlContent(formatted);
  }, [htmlContent, formatHtml]);

  // Tabキー処理のハンドラー
  const handleKeyDown = createTabKeyHandler(htmlContent, setHtmlContent);

  return {
    htmlContent,
    setHtmlContent,
    formatContent,
    handleKeyDown,
    canFormat: htmlContent.trim().length > 0,
  };
};
