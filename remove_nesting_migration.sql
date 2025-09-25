BEGIN;

-- ネスト関連のカラムを削除
ALTER TABLE parts DROP COLUMN IF EXISTS nested_part_ids;
ALTER TABLE parts DROP COLUMN IF EXISTS parent_id;

-- ネスト関連のインデックスを削除
DROP INDEX IF EXISTS idx_parts_nested_part_ids;
DROP INDEX IF EXISTS idx_parts_parent_id;

-- ネスト関連の制約を削除
ALTER TABLE parts DROP CONSTRAINT IF EXISTS check_nested_part_ids_is_array;

COMMIT;
