# 🆕 Cómo Crear Tu Propio Proyecto de Supabase

## Si no tienes acceso al proyecto actual, sigue estos pasos:

### **Paso 1: Crear Nuevo Proyecto en Supabase**

1. Ve a https://app.supabase.com
2. Haz clic en **"New Project"**
3. Completa los datos:
   - **Name**: `terra-watch-live` (o el nombre que quieras)
   - **Database Password**: (genera una contraseña segura)
   - **Region**: Elige la más cercana a ti
4. Haz clic en **"Create new project"**
5. Espera 2-3 minutos mientras se crea

---

### **Paso 2: Obtener Credenciales**

Una vez creado el proyecto:

1. Ve a **Settings** (⚙️) en el menú izquierdo
2. Haz clic en **API**
3. Copia estos valores:
   - **Project URL** (algo como: `https://xxxxx.supabase.co`)
   - **anon/public key** (una clave larga que empieza con `eyJ...`)

---

### **Paso 3: Actualizar .env en tu Proyecto**

Edita el archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_PROJECT_ID="tu-nuevo-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="tu-nueva-anon-key-aqui"
VITE_SUPABASE_URL="https://tu-nuevo-project-id.supabase.co"
```

**Cómo obtener el Project ID:**
- Está en la URL del dashboard: `https://app.supabase.com/project/ESTE-ES-EL-ID`
- O en Settings > General > Reference ID

---

### **Paso 4: Aplicar las Migraciones**

Una vez tengas tu nuevo proyecto, debes crear las tablas:

1. Ve a **SQL Editor** en el dashboard de Supabase
2. Abre y ejecuta **EN ESTE ORDEN**:
   
   **a) Primera migración** - Copia y pega TODO el contenido de:
   ```
   supabase/migrations/20251005020553_fd675222-2520-4cc6-850f-3354a44b6435.sql
   ```
   
   **b) Segunda migración** - Copia y pega TODO el contenido de:
   ```
   supabase/migrations/20251005020611_42c3419e-90a5-4747-b3b4-424daf6a2df8.sql
   ```
   
   **c) Migración de God Mode** - Copia y pega TODO el contenido de:
   ```
   supabase/migrations/20251005030000_add_god_mode.sql
   ```

3. Haz clic en **"Run"** después de cada uno
4. Verifica que no haya errores

---

### **Paso 5: Verificar que Todo Funciona**

1. En el dashboard, ve a **Table Editor**
2. Deberías ver estas tablas:
   - ✅ `profiles`
   - ✅ `user_roles`
   - ✅ `events`
   - ✅ `news`

3. Ve a **Authentication** > **Users**
4. Deberías poder ver la lista de usuarios (vacía al inicio)

---

### **Paso 6: Reiniciar la Aplicación**

```bash
# En la terminal, detén el servidor si está corriendo (Ctrl+C)
# Luego reinicia:
npm run dev
```

---

### **Paso 7: Crear tu Primer Usuario y Asignar God**

1. Abre la aplicación en el navegador
2. Regístrate con tu email
3. Ve al dashboard de Supabase > **Authentication** > **Users**
4. Copia tu `ID` (UUID)
5. Ve a **SQL Editor** y ejecuta:

```sql
-- Asignar rol God a tu usuario
INSERT INTO public.user_roles (user_id, role)
VALUES ('TU-UUID-AQUI', 'god')
ON CONFLICT (user_id, role) DO NOTHING;
```

6. Cierra sesión en la app y vuelve a iniciar
7. ¡Deberías ver el botón "God Mode"!

---

## 🎯 Resumen Visual

```
1. Crear proyecto → https://app.supabase.com
2. Copiar credenciales → Settings > API
3. Actualizar .env → Pegar nuevas credenciales
4. Ejecutar migraciones → SQL Editor (3 archivos)
5. Verificar tablas → Table Editor
6. Reiniciar app → npm run dev
7. Registrarse → /auth
8. Asignar God → SQL Editor
9. ¡Listo! → Ver botón God Mode
```

---

## 🆘 Problemas Comunes

### Error: "relation does not exist"
**Solución:** No ejecutaste las migraciones. Ve al Paso 4.

### Error: "invalid api key"
**Solución:** Las credenciales en `.env` no coinciden. Verifica Paso 3.

### No veo las tablas
**Solución:** Las migraciones fallaron. Revisa los errores en SQL Editor.

### No puedo registrarme
**Solución:** Ve a Authentication > Settings > Enable email provider

---

## ✅ Checklist Final

- [ ] Proyecto creado en Supabase
- [ ] Credenciales copiadas
- [ ] `.env` actualizado
- [ ] 3 migraciones ejecutadas sin errores
- [ ] Tablas visibles en Table Editor
- [ ] Usuario registrado
- [ ] Rol God asignado
- [ ] Botón God Mode visible en la app

---

**¡Ahora tienes control total de tu proyecto Supabase! 🎉**
