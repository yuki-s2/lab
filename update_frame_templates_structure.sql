BEGIN;

-- 1. RLSポリシーを確認・更新
ALTER TABLE frame_templates ENABLE ROW LEVEL SECURITY;

-- 既存ポリシーを削除して再作成
DROP POLICY IF EXISTS "Enable read access for all users" ON frame_templates;
CREATE POLICY "Enable read access for all users" 
ON frame_templates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON frame_templates;
CREATE POLICY "Enable insert for authenticated users only" 
ON frame_templates FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable update for authenticated users only" ON frame_templates;
CREATE POLICY "Enable update for authenticated users only" 
ON frame_templates FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON frame_templates;
CREATE POLICY "Enable delete for authenticated users only" 
ON frame_templates FOR DELETE USING (auth.role() = 'authenticated');

-- 2. インデックスを最適化
CREATE INDEX IF NOT EXISTS idx_frame_templates_name ON frame_templates (name);
CREATE INDEX IF NOT EXISTS idx_frame_templates_created_at ON frame_templates (created_at DESC);

COMMIT;
