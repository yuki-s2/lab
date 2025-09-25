-- Add parent_id column to parts table for nested structure support
-- このファイルをSupabase Dashboard > SQL Editorで実行してください

-- parent_id カラムを追加（既に存在する場合はスキップ）
ALTER TABLE parts 
ADD COLUMN IF NOT EXISTS parent_id INTEGER REFERENCES parts(id) ON DELETE CASCADE;

-- parent_id にインデックスを追加（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_parts_parent_id ON parts(parent_id);

-- 確認用クエリ（テーブル構造を表示）
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'parts' 
ORDER BY ordinal_position;
