# 🛡️ GOD MODE - Guía Completa de Implementación y Uso

## 📋 Tabla de Contenidos
1. [¿Qué es God Mode?](#qué-es-god-mode)
2. [Características Principales](#características-principales)
3. [Estructura de Archivos](#estructura-de-archivos)
4. [Instalación y Configuración](#instalación-y-configuración)
5. [Asignar Rol God a un Usuario](#asignar-rol-god-a-un-usuario)
6. [Uso del Panel God Mode](#uso-del-panel-god-mode)
7. [Seguridad y Permisos](#seguridad-y-permisos)
8. [API y Funciones Disponibles](#api-y-funciones-disponibles)

---

## 🎯 ¿Qué es God Mode?

**God Mode** es un rol especial de superadministrador que otorga permisos totales sobre toda la aplicación. Un usuario con este rol puede:

- ✅ Ver y administrar **todos los usuarios** del sistema
- ✅ Asignar y remover **cualquier rol** a cualquier usuario
- ✅ Crear, editar y eliminar **cualquier evento**, sin importar quién lo creó
- ✅ Crear, editar y eliminar **cualquier noticia**, sin importar quién la creó
- ✅ Acceder a funcionalidades administrativas especiales
- ✅ **Bypass completo de las restricciones RLS** (Row Level Security)

---

## 🚀 Características Principales

### 1. **Panel de Administración de Usuarios**
- Lista completa de todos los usuarios registrados
- Visualización de roles asignados a cada usuario
- Asignación rápida de roles mediante selectores
- Remoción de roles con un solo clic

### 2. **Gestión Total de Contenido**
- Edición de eventos y noticias creados por otros usuarios
- Eliminación de contenido inapropiado o duplicado
- Sin restricciones de propiedad (campo `created_by`)

### 3. **Interfaz Dedicada**
- Botón "God Mode" visible solo para usuarios God
- Panel con diseño distintivo (colores morados)
- Indicadores visuales de acciones administrativas

---

## 📁 Estructura de Archivos

### **Backend (Supabase)**
```
supabase/migrations/
├── 20251005030000_add_god_mode.sql         # Migración principal con roles y políticas
└── HELPER_assign_god_role.sql              # Script de ayuda para asignar God
```

### **Frontend (React + TypeScript)**
```
src/
├── components/
│   └── GodModePanel.tsx                    # Panel principal de administración
├── hooks/
│   ├── useGodMode.tsx                      # Hook para funcionalidades God
│   └── useUserRoles.tsx                    # Hook actualizado con rol 'god'
└── pages/
    └── Index.tsx                           # Página principal con botón God Mode
```

---

## 🛠️ Instalación y Configuración

### **Paso 1: Aplicar Migración en Supabase**

#### Opción A: Desde el Dashboard de Supabase
1. Ve a tu proyecto en https://app.supabase.com
2. Navega a **SQL Editor**
3. Copia y pega el contenido de `20251005030000_add_god_mode.sql`
4. Ejecuta la migración
5. Verifica que no haya errores

#### Opción B: Desde CLI de Supabase
```bash
# En la raíz del proyecto
supabase db push

# O ejecutar la migración específica
supabase db reset
```

### **Paso 2: Verificar que el Enum se Actualizó**
```sql
-- Ejecuta en SQL Editor
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'public.app_role'::regtype;

-- Deberías ver:
-- viewer
-- news_creator
-- event_creator
-- god
```

### **Paso 3: Compilar el Frontend**
```bash
# Instalar dependencias (si es necesario)
npm install

# Ejecutar en modo desarrollo
npm run dev

# O compilar para producción
npm run build
```

---

## 👑 Asignar Rol God a un Usuario

### **Método 1: SQL Editor (Recomendado para primera vez)**

#### 1. Obtener el UUID del usuario
```sql
-- Buscar usuario por email
SELECT id, email FROM auth.users WHERE email = 'tu-email@example.com';
```

#### 2. Asignar el rol God
```sql
-- Reemplaza 'TU-UUID-AQUI' con el UUID del paso anterior
INSERT INTO public.user_roles (user_id, role)
VALUES ('TU-UUID-AQUI', 'god')
ON CONFLICT (user_id, role) DO NOTHING;
```

#### 3. Verificar que se asignó correctamente
```sql
SELECT * FROM public.user_roles WHERE user_id = 'TU-UUID-AQUI';
```

### **Método 2: Asignar God al Primer Usuario (Testing)**
```sql
-- Esto asigna God automáticamente al primer usuario registrado
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'god'::app_role
FROM auth.users
ORDER BY created_at ASC
LIMIT 1
ON CONFLICT (user_id, role) DO NOTHING;
```

### **Método 3: Desde la App (Si ya eres God)**
1. Inicia sesión como usuario con rol God
2. Haz clic en el botón **"God Mode"** (🛡️ Shield icon)
3. Selecciona el usuario y el rol "God Mode" en los selectores
4. Haz clic en **"Asignar Rol"**

---

## 🎮 Uso del Panel God Mode

### **Acceder al Panel**
1. Inicia sesión con un usuario que tenga el rol `god`
2. Verás un nuevo botón **"God Mode"** en la barra de navegación (color morado)
3. Haz clic en el botón para abrir el panel de administración

### **Gestionar Usuarios**

#### Ver Lista de Usuarios
- El panel muestra automáticamente todos los usuarios registrados
- Cada usuario muestra:
  - Nombre completo (si está disponible)
  - Email
  - Lista de roles asignados (con badges de colores)

#### Asignar un Rol
1. **Selecciona el usuario** en el primer dropdown
2. **Selecciona el rol** que deseas asignar:
   - `God Mode` - Superadministrador
   - `Creador de Eventos` - Puede crear eventos
   - `Creador de Noticias` - Puede crear noticias
   - `Espectador` - Solo lectura
3. Haz clic en **"Asignar Rol"**
4. Verás un mensaje de confirmación

#### Remover un Rol
1. Busca al usuario en la lista
2. Haz clic en el ícono **❌ (XCircle)** junto al badge del rol
3. Confirma la acción
4. El rol se eliminará inmediatamente

### **Gestionar Eventos y Noticias**

Aunque no está en el panel principal de God Mode, los usuarios God tienen permisos para:

- **Eliminar cualquier evento**:
  ```typescript
  const { deleteEvent } = useGodMode();
  await deleteEvent('event-id-aqui');
  ```

- **Actualizar cualquier evento**:
  ```typescript
  const { updateEvent } = useGodMode();
  await updateEvent('event-id-aqui', {
    name: 'Nuevo nombre',
    description: 'Nueva descripción'
  });
  ```

- **Lo mismo aplica para noticias** con `deleteNews()` y `updateNews()`

---

## 🔒 Seguridad y Permisos

### **Políticas RLS Implementadas**

#### 1. **Permisos sobre `user_roles`**
```sql
-- God puede ver, insertar, actualizar y eliminar roles
CREATE POLICY "God puede ver todos los roles" ...
CREATE POLICY "God puede asignar roles" ...
CREATE POLICY "God puede actualizar roles" ...
CREATE POLICY "God puede eliminar roles" ...
```

#### 2. **Permisos sobre `profiles`**
```sql
-- God puede actualizar y eliminar cualquier perfil
CREATE POLICY "God puede actualizar cualquier perfil" ...
CREATE POLICY "God puede eliminar perfiles" ...
```

#### 3. **Permisos sobre `events` y `news`**
```sql
-- God puede hacer CUALQUIER acción (INSERT, UPDATE, DELETE)
-- Sin importar el valor de created_by
```

### **Funciones de Seguridad**

#### `is_god(_user_id UUID)`
Verifica si un usuario tiene el rol God.
```sql
SELECT public.is_god(auth.uid()); -- Devuelve true/false
```

#### `assign_role_to_user(_user_id UUID, _role app_role)`
Asigna un rol a un usuario (solo ejecutable por God).
```sql
SELECT public.assign_role_to_user('user-uuid', 'event_creator');
```

#### `remove_role_from_user(_user_id UUID, _role app_role)`
Remueve un rol de un usuario (solo ejecutable por God).
```sql
SELECT public.remove_role_from_user('user-uuid', 'viewer');
```

#### `get_all_users_with_roles()`
Obtiene todos los usuarios con sus roles (solo ejecutable por God).
```sql
SELECT * FROM public.get_all_users_with_roles();
```

### **Protecciones Implementadas**

✅ **No puedes remover tu propio rol God** (desde la UI)  
✅ **Solo God puede ejecutar funciones administrativas**  
✅ **Todas las funciones usan `SECURITY DEFINER`** para bypass de RLS  
✅ **Verificación de rol antes de cada acción**  

---

## 🧩 API y Funciones Disponibles

### **Hook `useGodMode()`**

```typescript
import { useGodMode } from '@/hooks/useGodMode';

const MyComponent = () => {
  const {
    isGod,              // boolean - Si el usuario actual es God
    loading,            // boolean - Cargando estado inicial
    getAllUsers,        // () => Promise - Obtener todos los usuarios
    assignRole,         // (userId, role) => Promise - Asignar rol
    removeRole,         // (userId, role) => Promise - Remover rol
    getAllEvents,       // () => Promise - Obtener todos los eventos
    getAllNews,         // () => Promise - Obtener todas las noticias
    deleteEvent,        // (eventId) => Promise - Eliminar evento
    deleteNews,         // (newsId) => Promise - Eliminar noticia
    updateEvent,        // (eventId, updates) => Promise - Actualizar evento
    updateNews,         // (newsId, updates) => Promise - Actualizar noticia
  } = useGodMode();

  // Ejemplo de uso
  const handleDeleteEvent = async (eventId: string) => {
    const { success, error } = await deleteEvent(eventId);
    if (success) {
      toast.success('Evento eliminado');
    }
  };

  return <div>...</div>;
};
```

### **Hook `useUserRoles()` (Actualizado)**

```typescript
import { useUserRoles } from '@/hooks/useUserRoles';

const MyComponent = () => {
  const {
    roles,              // string[] - Lista de roles del usuario
    loading,            // boolean - Cargando roles
    hasRole,            // (role) => boolean - Verificar si tiene un rol
    canCreateNews,      // boolean - Puede crear noticias (incluye God)
    canCreateEvents,    // boolean - Puede crear eventos (incluye God)
    isGod,              // boolean - Es usuario God
  } = useUserRoles();

  return (
    <div>
      {isGod && <button>Panel God Mode</button>}
    </div>
  );
};
```

---

## 🐛 Troubleshooting

### **Problema: No veo el botón God Mode**
✅ Verifica que el rol esté asignado:
```sql
SELECT * FROM public.user_roles WHERE user_id = 'tu-uuid' AND role = 'god';
```

✅ Cierra sesión y vuelve a iniciar para refrescar el token de autenticación

✅ Limpia la caché del navegador

### **Problema: Error al asignar roles**
✅ Verifica que la migración se aplicó correctamente:
```sql
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'public.app_role'::regtype;
```

✅ Verifica que las funciones existan:
```sql
SELECT proname FROM pg_proc WHERE proname LIKE '%god%';
```

### **Problema: No puedo eliminar eventos/noticias**
✅ Verifica que las políticas RLS estén activas:
```sql
SELECT * FROM pg_policies WHERE tablename IN ('events', 'news');
```

✅ Verifica que seas realmente God:
```sql
SELECT public.is_god(auth.uid());
```

---

## 📚 Recursos Adicionales

- [Documentación de Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Enum Types](https://www.postgresql.org/docs/current/datatype-enum.html)
- [React Query (TanStack)](https://tanstack.com/query/latest)

---

## 🎉 ¡Listo!

Ahora tienes un sistema completo de God Mode implementado en tu aplicación. Recuerda:

⚠️ **Solo asigna el rol God a usuarios de máxima confianza**  
⚠️ **Usa God Mode responsablemente**  
⚠️ **Implementa auditoría si es producción** (logs de cambios)

**¿Preguntas?** Revisa la sección de troubleshooting o contacta al equipo de desarrollo.
