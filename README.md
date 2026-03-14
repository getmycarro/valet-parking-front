# Valet Parking System

Next.js application for managing valet parking operations with two user roles: Administrators and Attendants.

## Supabase Realtime — Notificaciones en tiempo real

El sistema recibe notificaciones del backend vía **Supabase Realtime Broadcast**.

### Configuración actual

El frontend se conecta usando el **ANON KEY** de Supabase. La política RLS en `realtime.messages` permite recibir broadcasts en canales `company-{companyId}` sin restricción de usuario:

```sql
CREATE POLICY "Permitir broadcast en canales de compañía"
ON realtime.messages
FOR SELECT
TO anon, authenticated
USING (realtime.topic() LIKE 'company-%');
```

> **Nota:** Esta configuración permite que cualquier cliente con el anon key se suscriba a cualquier canal `company-*`. Es funcional para el estado actual del proyecto pero no restringe el acceso por compañía.

### TODO: Mejorar seguridad con Supabase Auth

Para un futuro desarrollo, se recomienda reemplazar la política permisiva por una basada en identidad de usuario. Esto requiere:

1. **Emitir tokens JWT de Supabase** desde NestJS firmados con el `JWT_SECRET` del proyecto Supabase, incluyendo el `company_id` como claim personalizado.
2. **Reemplazar la política RLS** por una que valide que el usuario pertenece a la compañía del canal:

```sql
-- Reemplazar política actual por esta
CREATE POLICY "Usuarios pueden recibir broadcasts de su compañía"
ON realtime.messages
FOR SELECT
TO authenticated
USING (
  realtime.topic() = 'company-' || (
    SELECT cu.company_id
    FROM company_users cu
    WHERE cu.user_id = auth.uid()
    LIMIT 1
  )
);
```

3. **En el frontend**, inicializar el cliente de Supabase con el JWT de Supabase (no el de NestJS) para que `auth.uid()` funcione en las políticas RLS.

Esto garantizaría que cada cliente solo puede suscribirse al canal de su propia compañía.
