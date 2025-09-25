BEGIN;

-- 1. partsテーブルにselected_children_idsカラムを追加
ALTER TABLE parts 
ADD COLUMN IF NOT EXISTS selected_children_ids bigint[] DEFAULT '{}';

-- 2. contentカラムを削除（不要になったため）
ALTER TABLE parts 
DROP COLUMN IF EXISTS content;

-- 3. インデックスを追加（selected_children_idsでの検索を高速化）
CREATE INDEX IF NOT EXISTS idx_parts_selected_children 
ON parts USING GIN (selected_children_ids);

-- 4. frame_idの外部キー制約にカスケード削除を追加
-- 既存の制約を削除
ALTER TABLE parts 
DROP CONSTRAINT IF EXISTS parts_frame_id_fkey;

-- カスケード削除付きの制約を追加
ALTER TABLE parts 
ADD CONSTRAINT parts_frame_id_fkey 
  FOREIGN KEY (frame_id) REFERENCES frame_templates(id)
  ON DELETE CASCADE;

COMMIT;
