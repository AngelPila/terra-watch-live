-- =====================================================
-- MIGRACIÓN: GOD MODE
-- Descripción: Agrega el rol 'god' con permisos totales
-- Fecha: 2025-10-05
-- =====================================================

-- 1. Agregar 'god' al enum de roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'god';

-- 2. Función para verificar si un usuario es God
CREATE OR REPLACE FUNCTION public.is_god(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'god'
  )
$$;

-- 3. Políticas RLS para God Mode en user_roles
-- God puede ver todos los roles
CREATE POLICY "God puede ver todos los roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.is_god(auth.uid()));

-- God puede insertar cualquier rol
CREATE POLICY "God puede asignar roles"
  ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_god(auth.uid()));

-- God puede actualizar cualquier rol
CREATE POLICY "God puede actualizar roles"
  ON public.user_roles
  FOR UPDATE
  TO authenticated
  USING (public.is_god(auth.uid()));

-- God puede eliminar cualquier rol
CREATE POLICY "God puede eliminar roles"
  ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (public.is_god(auth.uid()));

-- 4. Políticas RLS para God Mode en profiles
-- God puede actualizar cualquier perfil
CREATE POLICY "God puede actualizar cualquier perfil"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_god(auth.uid()));

-- God puede eliminar cualquier perfil
CREATE POLICY "God puede eliminar perfiles"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (public.is_god(auth.uid()));

-- 5. Políticas RLS para God Mode en events
-- God puede crear cualquier evento
CREATE POLICY "God puede crear cualquier evento"
  ON public.events
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_god(auth.uid()));

-- God puede actualizar cualquier evento
CREATE POLICY "God puede actualizar cualquier evento"
  ON public.events
  FOR UPDATE
  TO authenticated
  USING (public.is_god(auth.uid()));

-- God puede eliminar cualquier evento
CREATE POLICY "God puede eliminar cualquier evento"
  ON public.events
  FOR DELETE
  TO authenticated
  USING (public.is_god(auth.uid()));

-- 6. Políticas RLS para God Mode en news
-- God puede crear cualquier noticia
CREATE POLICY "God puede crear cualquier noticia"
  ON public.news
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_god(auth.uid()));

-- God puede actualizar cualquier noticia
CREATE POLICY "God puede actualizar cualquier noticia"
  ON public.news
  FOR UPDATE
  TO authenticated
  USING (public.is_god(auth.uid()));

-- God puede eliminar cualquier noticia
CREATE POLICY "God puede eliminar cualquier noticia"
  ON public.news
  FOR DELETE
  TO authenticated
  USING (public.is_god(auth.uid()));

-- 7. Función para obtener todos los usuarios con sus roles (solo God)
CREATE OR REPLACE FUNCTION public.get_all_users_with_roles()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  roles TEXT[]
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id as user_id,
    p.email,
    p.full_name,
    ARRAY_AGG(ur.role::TEXT) as roles
  FROM public.profiles p
  LEFT JOIN public.user_roles ur ON p.id = ur.user_id
  WHERE public.is_god(auth.uid())
  GROUP BY p.id, p.email, p.full_name
  ORDER BY p.created_at DESC
$$;

-- 8. Función para asignar rol (solo God)
CREATE OR REPLACE FUNCTION public.assign_role_to_user(
  _user_id UUID,
  _role app_role
)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar que quien ejecuta es God
  IF NOT public.is_god(auth.uid()) THEN
    RAISE EXCEPTION 'Solo God puede asignar roles';
  END IF;

  -- Insertar el rol (ignorar si ya existe)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN TRUE;
END;
$$;

-- 9. Función para remover rol (solo God)
CREATE OR REPLACE FUNCTION public.remove_role_from_user(
  _user_id UUID,
  _role app_role
)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar que quien ejecuta es God
  IF NOT public.is_god(auth.uid()) THEN
    RAISE EXCEPTION 'Solo God puede remover roles';
  END IF;

  -- Eliminar el rol
  DELETE FROM public.user_roles
  WHERE user_id = _user_id AND role = _role;

  RETURN TRUE;
END;
$$;

-- 10. Comentarios para documentación
COMMENT ON FUNCTION public.is_god IS 'Verifica si un usuario tiene el rol god';
COMMENT ON FUNCTION public.get_all_users_with_roles IS 'Obtiene todos los usuarios con sus roles (solo God)';
COMMENT ON FUNCTION public.assign_role_to_user IS 'Asigna un rol a un usuario (solo God)';
COMMENT ON FUNCTION public.remove_role_from_user IS 'Remueve un rol de un usuario (solo God)';
