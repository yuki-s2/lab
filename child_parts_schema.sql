-- 子パーツライブラリテーブル
CREATE TABLE child_parts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL, -- HTMLコンテンツ
  category VARCHAR(100), -- ボタン、テキスト、画像など
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- フレームと子パーツの関連テーブル
CREATE TABLE frame_children (
  id SERIAL PRIMARY KEY,
  frame_id INTEGER REFERENCES parts(id) ON DELETE CASCADE,
  child_part_id INTEGER REFERENCES child_parts(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(frame_id, child_part_id) -- 同じフレームに同じ子パーツは1つまで
);

-- インデックス
CREATE INDEX idx_frame_children_frame_id ON frame_children(frame_id);
CREATE INDEX idx_frame_children_order ON frame_children(frame_id, order_index);
CREATE INDEX idx_child_parts_category ON child_parts(category);

-- サンプル子パーツデータ
INSERT INTO child_parts (name, content, category, description) VALUES
('プライマリボタン', '<button class="btn btn-primary">クリック</button>', 'ボタン', '青色の主要アクションボタン'),
('セカンダリボタン', '<button class="btn btn-secondary">キャンセル</button>', 'ボタン', 'グレーのセカンダリボタン'),
('見出しテキスト', '<h3>見出しタイトル</h3>', 'テキスト', 'H3レベルの見出し'),
('段落テキスト', '<p>ここに説明文が入ります。</p>', 'テキスト', '通常の段落テキスト'),
('画像プレースホルダー', '<img src="https://via.placeholder.com/300x200" alt="画像" style="max-width: 100%;">', '画像', 'プレースホルダー画像'),
('入力フィールド', '<input type="text" placeholder="入力してください" class="form-control">', 'フォーム', 'テキスト入力フィールド');
