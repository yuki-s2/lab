//フレームの編集と中身を入力・編集する
type Props = {
  name: string;
  content: string;
  frame: string;
  onChangeContent: (v: string) => void;
  onChangeFrame: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export default function PartEditor({
  name,
  content,
  frame,
  onChangeContent,
  onChangeFrame,
  onSave,
  onCancel,
}: Props) {
  return (
    <div>
      <h2>編集中: {name}</h2>
      <textarea
        value={frame}
        onChange={(e) => onChangeFrame(e.target.value)}
        placeholder="テンプレートHTMLを編集"
      />
      <textarea
        value={content}
        onChange={(e) => onChangeContent(e.target.value)}
        placeholder="中身を入力"
      />
      <div>
        <button onClick={onSave}>保存</button>
        <button onClick={onCancel}>キャンセル</button>
      </div>
    </div>
  );
}
