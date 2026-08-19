DROP POLICY IF EXISTS "posts images user write" ON storage.objects;
CREATE POLICY "posts images user write" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'posts-instagram' AND (storage.foldername(name))[1] = (auth.uid())::text);

DROP POLICY IF EXISTS "posts images user update" ON storage.objects;
CREATE POLICY "posts images user update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'posts-instagram' AND (storage.foldername(name))[1] = (auth.uid())::text)
WITH CHECK (bucket_id = 'posts-instagram' AND (storage.foldername(name))[1] = (auth.uid())::text);

DROP POLICY IF EXISTS "posts images user delete" ON storage.objects;
CREATE POLICY "posts images user delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'posts-instagram' AND (storage.foldername(name))[1] = (auth.uid())::text);