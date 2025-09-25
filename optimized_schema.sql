-- 既存のpartsテーブルをframesとして使用（リネームするかそのまま使用）
-- ALTER TABLE parts RENAME TO frames;

-- frame_childrenテーブル（汎用的な子要素管理）
CREATE TABLE frame_children (
  id SERIAL PRIMARY KEY,
  parent_id INTEGER NOT NULL, -- frames.id または 他のframe_children.id
  parent_type VARCHAR(50) NOT NULL DEFAULT 'frame', -- 'frame' or 'child'
  name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL, -- HTMLコンテンツ
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_frame_children_parent ON frame_children(parent_id, parent_type);
CREATE INDEX idx_frame_children_order ON frame_children(parent_id, order_index);

-- 制約
ALTER TABLE frame_children 
ADD CONSTRAINT check_parent_type 
CHECK (parent_type IN ('frame', 'child'));

-- サンプルデータ
-- フレームに子パーツを追加する例
INSERT INTO frame_children (parent_id, parent_type, name, content, order_index) VALUES
(1, 'frame', 'ヘッダーボタン', '<button class="btn btn-primary">メインアクション</button>', 0),
(1, 'frame', 'テキスト説明', '<p>このフレームの説明文です。</p>', 1),
(1, 'frame', 'フッターリンク', '<a href="#" class="text-blue-500">詳細を見る →</a>', 2);

-- 子パーツに孫パーツを追加する例（無限ネスト）
INSERT INTO frame_children (parent_id, parent_type, name, content, order_index) VALUES
(1, 'child', 'ボタン内アイコン', '<i class="icon-arrow-right"></i>', 0),
(1, 'child', 'ボタン内テキスト', '<span>クリック</span>', 1);
