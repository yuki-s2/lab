-- Remove area columns from both tables
-- このファイルをSupabase Dashboard > SQL Editorで実行してください

-- parts テーブルから area カラムを削除（存在する場合）
ALTER TABLE parts 
DROP COLUMN IF EXISTS area;

-- frame_templates テーブルから area カラムを削除（存在する場合）
ALTER TABLE frame_templates 
DROP COLUMN IF EXISTS area;

-- 確認用クエリ（テーブル構造を表示）
SELECT 'parts table:' as table_info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'parts' 
ORDER BY ordinal_position;

SELECT 'frame_templates table:' as table_info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'frame_templates' 
ORDER BY ordinal_position;
