BEGIN;

-- frame_childrenテーブル作成
CREATE TABLE frame_children (
  id SERIAL PRIMARY KEY,
  parent_id INTEGER NOT NULL,
  parent_type VARCHAR(50) NOT NULL DEFAULT 'frame', -- 'frame' or 'child'
  name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL, -- HTMLコンテンツ
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_frame_children_parent ON frame_children(parent_id, parent_type);
CREATE INDEX idx_frame_children_order ON frame_children(parent_id, parent_type, order_index);

-- 制約追加
ALTER TABLE frame_children 
ADD CONSTRAINT check_parent_type 
CHECK (parent_type IN ('frame', 'child'));

-- サンプルデータ（テスト用）
-- 既存のpartsテーブルのIDを使用してサンプルを作成
INSERT INTO frame_children (parent_id, parent_type, name, content, order_index) VALUES
(1, 'frame', 'プライマリボタン', '<button class="btn btn-primary" style="background: #007bff; color: white; border: none; padding: 12px 24px; border-radius: 6px; font-size: 16px; cursor: pointer;">メインアクション</button>', 0),
(1, 'frame', '説明テキスト', '<p style="color: #666; font-size: 14px; line-height: 1.6; margin: 16px 0;">この機能について詳しく説明するテキストがここに入ります。</p>', 1),
(1, 'frame', 'リンクボタン', '<a href="#" style="color: #007bff; text-decoration: none; font-weight: 500;">詳細を見る →</a>', 2);

COMMIT;
