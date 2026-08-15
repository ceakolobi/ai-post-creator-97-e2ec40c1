CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

DROP POLICY IF EXISTS "own profile select" ON public.profiles;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated
USING ((auth.uid() = id) OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "own roles select" ON public.user_roles;
CREATE POLICY "own roles select" ON public.user_roles FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "own posts select" ON public.posts_gerados;
CREATE POLICY "own posts select" ON public.posts_gerados FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "own subscription select" ON public.subscriptions;
CREATE POLICY "own subscription select" ON public.subscriptions FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admin subscription update" ON public.subscriptions;
CREATE POLICY "admin subscription update" ON public.subscriptions FOR UPDATE TO authenticated
USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "own feedback select" ON public.feedback;
CREATE POLICY "own feedback select" ON public.feedback FOR SELECT TO authenticated
USING ((auth.uid() = user_id) OR private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admin feedback update" ON public.feedback;
CREATE POLICY "admin feedback update" ON public.feedback FOR UPDATE TO authenticated
USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "admins manage admin emails" ON public.admin_emails;
CREATE POLICY "admins manage admin emails" ON public.admin_emails FOR ALL TO authenticated
USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

DROP POLICY IF EXISTS "avatars owner read" ON storage.objects;
CREATE POLICY "avatars owner read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (auth.uid())::text);

DROP POLICY IF EXISTS "posts images read" ON storage.objects;
CREATE POLICY "posts images read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'posts-instagram' AND (storage.foldername(name))[1] = (auth.uid())::text);