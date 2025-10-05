-- =====================================================
-- SCRIPT DE AYUDA: Asignar rol God a un usuario
-- =====================================================

-- 1. Ver todos los usuarios registrados
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Ver roles de un usuario específico (reemplaza el email)
SELECT 
  p.email,
  p.full_name,
  ur.role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
WHERE p.email = 'tu-email@example.com';

-- 3. ASIGNAR ROL GOD a un usuario (reemplaza con el UUID del usuario)
-- Obtén el UUID del paso 1 o 2
INSERT INTO public.user_roles (user_id, role)
VALUES ('TU-USER-UUID-AQUI', 'god')
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Ejemplo completo: Asignar God al primer usuario registrado
-- (Ejecuta esto si quieres dar God al primer usuario automáticamente)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'god'::app_role
FROM auth.users
ORDER BY created_at ASC
LIMIT 1
ON CONFLICT (user_id, role) DO NOTHING;

-- 5. Ver todos los usuarios con rol God
SELECT 
  p.email,
  p.full_name,
  ur.role,
  p.created_at
FROM public.profiles p
INNER JOIN public.user_roles ur ON p.id = ur.user_id
WHERE ur.role = 'god'
ORDER BY p.created_at;

-- 6. Remover rol God de un usuario (si es necesario)
DELETE FROM public.user_roles
WHERE user_id = 'TU-USER-UUID-AQUI'
  AND role = 'god';

-- =====================================================
-- EJEMPLO DE USO RÁPIDO PARA TESTING:
-- =====================================================

-- Paso 1: Busca tu usuario por email
SELECT id, email FROM auth.users WHERE email = 'tu-email@example.com';

-- Paso 2: Copia el UUID que aparece y ejecútalo así:
INSERT INTO public.user_roles (user_id, role)
VALUES ('el-uuid-que-copiaste', 'god');

-- Paso 3: Verifica que se asignó correctamente
SELECT * FROM public.user_roles WHERE user_id = 'el-uuid-que-copiaste';

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
-- - El rol 'god' tiene permisos TOTALES sobre todo el sistema
-- - Solo asigna este rol a usuarios de confianza
-- - Cada usuario puede tener múltiples roles simultáneamente
-- - Los roles se definen en el enum public.app_role
