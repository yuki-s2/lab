-- frame_childrenテーブルのCHECK制約を修正

BEGIN;

-- 既存のCHECK制約を削除
ALTER TABLE public.frame_children DROP CONSTRAINT IF EXISTS check_parent_type;
ALTER TABLE public.frame_children DROP CONSTRAINT IF EXISTS frame_children_parent_type_check;

-- 新しいCHECK制約を追加
ALTER TABLE public.frame_children ADD CONSTRAINT check_parent_type 
    CHECK (parent_type IN ('template', 'child'));

-- 確認のため制約を表示
SELECT 
    conname, 
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'public.frame_children'::regclass 
    AND contype = 'c';

COMMIT;
