BEGIN;

-- 1. frame_childrenのparent_typeを更新（"frame" → "template"）
UPDATE frame_children 
SET parent_type = 'template'
WHERE parent_type = 'frame';

-- 2. parent_typeのCHECK制約を更新
ALTER TABLE frame_children 
DROP CONSTRAINT IF EXISTS frame_children_parent_type_check;

ALTER TABLE frame_children 
ADD CONSTRAINT frame_children_parent_type_check 
CHECK (parent_type IN ('template', 'child'));

-- 3. 外部キー制約を更新（partsテーブルではなくframe_templatesテーブルに紐付け）
ALTER TABLE frame_children 
DROP CONSTRAINT IF EXISTS fk_parent_frame;

ALTER TABLE frame_children 
ADD CONSTRAINT fk_parent_template
  FOREIGN KEY (parent_id) REFERENCES frame_templates(id)
  ON DELETE CASCADE;

-- 4. インデックスを再作成
DROP INDEX IF EXISTS idx_frame_children_parent;
CREATE INDEX idx_frame_children_parent ON frame_children (parent_id, parent_type);

COMMIT;
