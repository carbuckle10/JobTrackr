-- Run this query in Supabase SQL Editor to check RLS status
-- This will show if RLS is enabled and what policies exist

SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename IN ('applications', 'contacts')
  AND schemaname = 'public';

-- Check what RLS policies exist
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as operation,
  qual as using_expression
FROM pg_policies
WHERE tablename IN ('applications', 'contacts')
ORDER BY tablename, policyname;
