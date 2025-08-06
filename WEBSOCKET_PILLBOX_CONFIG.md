# Configuración del Pastillero mediante WebSocket

## Resumen de Cambios

Se ha migrado la configuración del pastillero de usar APIs REST HTTP a usar WebSocket para una comunicación más eficiente y en tiempo real.

## Cambios Realizados

### 1. Tipos de WebSocket (server/src/types/WebSocket.ts)

**Nuevos tipos de mensajes agregados:**

```typescript
// Mensajes de entrada
| {
    type: "save-pillbox-config";
    userId: string;
    patientId: string;
    pillboxId: string;
    compartments: any[];
  }
| {
    type: "get-pillbox-config";
    userId: string;
    patientId: string;
  }
| {
    type: "delete-pillbox-config";
    userId: string;
    patientId: string;
  }

// Respuestas
| {
    type: "pillbox-config-saved";
    success: boolean;
    config?: any;
    error?: { message: string; timestamp: string };
    timestamp: string;
  }
| {
    type: "pillbox-config-loaded";
    config?: any;
    error?: { message: string; timestamp: string };
    timestamp: string;
  }
| {
    type: "pillbox-config-deleted";
    success: boolean;
    error?: { message: string; timestamp: string };
    timestamp: string;
  }
```

### 2. Manejadores de WebSocket (server/src/websocket.ts)

**Nuevas funciones agregadas:**

1. **handleSavePillboxConfig**: Guarda configuración via WebSocket
   - Valida campos requeridos
   - Guarda en MongoDB usando upsert
   - Responde con éxito o error

2. **handleGetPillboxConfig**: Carga configuración via WebSocket
   - Busca configuración en MongoDB
   - Responde con datos o error si no existe

3. **handleDeletePillboxConfig**: Elimina configuración via WebSocket
   - Elimina de MongoDB
   - Responde con confirmación o error

**Switch de mensajes actualizado:**

```typescript
switch (parsedMessage.type) {
  // ... casos existentes ...
  case "save-pillbox-config":
    if (!clientId) break;
    handleSavePillboxConfig(clientId, ws, parsedMessage);
    break;
  case "get-pillbox-config":
    if (!clientId) break;
    handleGetPillboxConfig(clientId, ws, parsedMessage);
    break;
  case "delete-pillbox-config":
    if (!clientId) break;
    handleDeletePillboxConfig(clientId, ws, parsedMessage);
    break;
}
```

### 3. Context de WebSocket (src/context/WebSocketContext.tsx)

**Nuevo manejo de mensajes:**

```typescript
case "pillbox-config-saved":
case "pillbox-config-loaded":
case "pillbox-config-deleted":
  // Emit custom event for pillbox configuration messages
  const event = new CustomEvent("pillbox-config-message", {
    detail: parsedMessage,
  });
  window.dispatchEvent(event);
  log("Pillbox config message dispatched:", parsedMessage.type);
  break;
```

### 4. Frontend - PillboxSettings.tsx

**Funciones migradas a WebSocket:**

1. **savePillboxConfig**:
   - Antes: Llamada fetch a `/savePillboxConfig`
   - Ahora: Mensaje WebSocket `save-pillbox-config`

2. **loadPillboxConfig**:
   - Antes: Llamada fetch a `/getPillboxConfig`
   - Ahora: Mensaje WebSocket `get-pillbox-config`

3. **removePillboxConfig**:
   - Antes: Llamada fetch a `/deletePillboxConfig`
   - Ahora: Mensaje WebSocket `delete-pillbox-config`

**Nuevo listener de eventos:**

```typescript
useEffect(() => {
  const handleWebSocketMessage = (event: CustomEvent) => {
    const message = event.detail;
    switch (message.type) {
      case "pillbox-config-saved":
        // Actualizar estado local con configuración guardada
        break;
      case "pillbox-config-loaded":
        // Cargar configuración en el estado
        break;
      case "pillbox-config-deleted":
        // Confirmar eliminación
        break;
    }
  };

  window.addEventListener("pillbox-config-message", handleWebSocketMessage);
  return () => {
    window.removeEventListener(
      "pillbox-config-message",
      handleWebSocketMessage,
    );
  };
}, []);
```

### 5. Tipos Frontend (src/types/TypesAPI.ts)

**Tipos WebSocket agregados** que coinciden con los del servidor para compatibilidad.

## Ventajas de la Migración

### ✅ Comunicación en Tiempo Real

- Las actualizaciones se reflejan inmediatamente
- No necesidad de polling o refrescar

### ✅ Mejor Performance

- Menos overhead de HTTP headers
- Conexión persistente
- Menor latencia

### ✅ Consistencia de Arquitectura

- Toda la comunicación del pastillero ahora usa WebSocket
- Flujo unificado con el resto del sistema

### ✅ Manejo de Errores Mejorado

- Respuestas inmediatas sobre el estado de las operaciones
- Mejor experiencia de usuario con feedback instantáneo

## Flujo de Operaciones

### Guardar Configuración

1. Usuario modifica configuración → `savePillboxConfig()`
2. Frontend envía mensaje `save-pillbox-config` via WebSocket
3. Servidor valida y guarda en MongoDB
4. Servidor responde con `pillbox-config-saved`
5. Frontend actualiza estado local inmediatamente

### Cargar Configuración

1. Usuario selecciona paciente → `loadPillboxConfig()`
2. Frontend envía mensaje `get-pillbox-config` via WebSocket
3. Servidor busca en MongoDB
4. Servidor responde con `pillbox-config-loaded`
5. Frontend carga datos en el formulario

### Eliminar Configuración

1. Usuario confirma eliminación → `removePillboxConfig()`
2. Frontend envía mensaje `delete-pillbox-config` via WebSocket
3. Servidor elimina de MongoDB
4. Servidor responde con `pillbox-config-deleted`
5. Frontend actualiza estado y resetea formulario

## Compatibilidad

- ✅ Los endpoints HTTP anteriores siguen funcionando
- ✅ Migración gradual posible
- ✅ Fallback a HTTP si WebSocket falla
- ✅ Tipos TypeScript mantienen compatibilidad

## Próximos Pasos

1. **Testing**: Probar todas las operaciones CRUD via WebSocket
2. **Optimización**: Implementar debouncing para autosave
3. **Error Handling**: Mejorar manejo de errores de conexión
4. **Documentación**: Actualizar documentación del API

## Notas Técnicas

- **Base de Datos**: Se mantiene la misma estructura en MongoDB
- **Validación**: Se conservan las mismas validaciones del servidor
- **Seguridad**: Se mantiene la autenticación por userId
- **Performance**: Operaciones asíncronas con feedback inmediato
