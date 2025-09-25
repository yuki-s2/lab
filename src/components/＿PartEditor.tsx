//フレームの編集と中身を入力・編集する
type Props = {
  page?: "Assemble" | "Generate";
  name: string;
  content: string;
  part: string;
  onChangeName: (v: string) => void;
  onChangeContent: (v: string) => void;
  onChangePart: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export default function PartEditor({
  page,
  name,
  content,
  part,
  onChangeName,
  onChangeContent,
  onChangePart,
  onSave,
  onCancel,
}: Props) {
  return (
    <div>
      <h2>編集中: {name}</h2>
      <input
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder="パーツ名"
        />
      <textarea
        value={part}
        onChange={(e) => onChangePart(e.target.value)}
        placeholder="テンプレートHTMLを編集"
      />
      {page !== "Assemble" && (
        <textarea
          value={content}
          onChange={(e) => onChangeContent(e.target.value)}
          placeholder="中身を入力"
        />
      )}
      <div>
        <button onClick={onSave}>保存</button>
        <button onClick={onCancel}>キャンセル</button>
      </div>
    </div>
  );
}
