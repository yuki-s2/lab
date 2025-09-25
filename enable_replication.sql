-- Replicationを有効化
ALTER TABLE public.frame_templates REPLICA IDENTITY FULL;
ALTER TABLE public.frame_children REPLICA IDENTITY FULL;
ALTER TABLE public.parts REPLICA IDENTITY FULL;

-- 確認
SELECT schemaname, tablename, relreplident
FROM pg_class c
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public'
  AND c.relname IN ('frame_templates', 'frame_children', 'parts')
  AND c.relkind = 'r';

-- より詳細な確認
SELECT 
    t.table_name,
    CASE 
        WHEN c.relreplident = 'f' THEN 'FULL'
        WHEN c.relreplident = 'd' THEN 'DEFAULT'
        WHEN c.relreplident = 'n' THEN 'NOTHING'
        WHEN c.relreplident = 'i' THEN 'INDEX'
        ELSE 'UNKNOWN'
    END as replica_identity
FROM information_schema.tables t
JOIN pg_class c ON c.relname = t.table_name
WHERE t.table_schema = 'public'
  AND t.table_name IN ('frame_templates', 'frame_children', 'parts');
