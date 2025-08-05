# Flujo Completo del Pastillero Inteligente (Capsy)

## 📋 Descripción General

El sistema Capsy es un pastillero inteligente que funciona mediante conexiones WebSocket bidireccionales entre dispositivos ESP32, el servidor y aplicaciones móviles. Permite gestionar múltiples pastilleros de forma independiente con horarios y configuraciones personalizadas.

---

## � Resumen del Proceso Completo

### **De Principio a Fin: 7 Pasos Esenciales**

1. **🔌 Conexión del Pastillero**: El ESP32 se conecta al servidor WebSocket
2. **👤 Inicialización del Usuario**: El usuario inicia sesión en la aplicación móvil
3. **🔗 Vinculación del Dispositivo**: El usuario vincula el pastillero a su cuenta
4. **⚙️ Configuración Individual**: Se configuran horarios específicos para cada pastillero
5. **⏰ Alertas Automáticas**: El sistema envía notificaciones y activa el pastillero
6. **📱 Confirmación del Usuario**: El usuario confirma que tomó la medicación
7. **✅ Cierre del Ciclo**: El sistema registra la toma y programa la siguiente

---

## �🔄 Flujo Principal del Sistema

### **Paso 1: Conexión del Pastillero (ESP32)**

El dispositivo Capsy se conecta al servidor WebSocket enviando su identificador único.

**Mensaje del ESP32 al Servidor:**

```json
{
  "type": "init",
  "capsyId": "CAPSY_001"
}
```

**Respuesta del Servidor:**

```json
{
  "type": "init-success",
  "message": "Capsy WebSocket initialized correctly",
  "timestamp": "2025-08-03T10:00:00.000Z"
}
```

### **Paso 2: Inicialización del Usuario**

El usuario inicia sesión en la aplicación móvil y se conecta al servidor.

**Mensaje del Usuario al Servidor:**

```json
{
  "type": "init",
  "userId": "user123"
}
```

**Respuesta del Servidor:**

```json
{
  "type": "init-success",
  "message": "WebSocket it's correctly initialized",
  "timestamp": "2025-08-03T10:00:00.000Z"
}
```

### **Paso 3: Vinculación del Pastillero**

El usuario debe ingresar el ID del pastillero en su aplicación para vincularlo a su cuenta.

**Mensaje del Usuario al Servidor:**

```json
{
  "type": "add-capsy",
  "capsyId": "CAPSY_001"
}
```

**Respuesta del Servidor:**

```json
{
  "type": "notification",
  "notification": {
    "reason": "Initial Notification",
    "title": "Capsy CAPSY_001 vinculado",
    "body": "El dispositivo Capsy se ha vinculado correctamente a tu cuenta.",
    "screen": "Dashboard",
    "trigger": null
  },
  "timestamp": "2025-08-03T10:00:00.000Z"
}
```

### **Paso 4: Configuración Individual del Pastillero**

El usuario configura los horarios y medicaciones específicas para cada pastillero.

**Configuración Individual por Pastillero:**

```json
{
  "type": "capsy-individual",
  "capsyId": "CAPSY_001",
  "pastilla": [
    {
      "id": 1,
      "cantidad": 2,
      "type": "scheduled",
      "startTime": "07:30",
      "intervalMs": 28800000 // 8 horas en millisegundos
    },
    {
      "id": 2,
      "cantidad": 1,
      "type": "interval",
      "timeout": 43200000 // 12 horas en millisegundos
    }
  ]
}
```

**Respuesta del Servidor:**

```json
{
  "type": "capsy",
  "message": "Capsy CAPSY_001 configured successfully with individual schedule",
  "timestamp": "2025-08-03T10:00:00.000Z"
}
```

### **Paso 5: Alerta Automática de Medicación**

Cuando llega la hora programada, el sistema ejecuta automáticamente el recordatorio.

**Notificación al Usuario:**

```json
{
  "type": "notification",
  "notification": {
    "reason": "Medication Reminder",
    "title": "Hora de tomar medicación",
    "body": "Es hora de tomar tu medicación - Capsy CAPSY_001",
    "screen": "Home",
    "trigger": null
  },
  "timestamp": "2025-08-03T10:00:00.000Z"
}
```

**Alerta al Pastillero (ESP32):**

```json
{
  "type": "capsy-alert",
  "pastilla": { "id": 1, "cantidad": 2 },
  "timestamp": "2025-08-03T10:00:00.000Z"
}
```

### **Paso 6: Emisión de Alerta Sonora**

El pastillero ESP32 recibe la alerta y emite una señal sonora para notificar al usuario.

**Acciones del ESP32:**

- Activar buzzer/altavoz
- Encender LED indicador
- Mostrar información en pantalla (opcional)
- Esperar confirmación del usuario

### **Paso 7: Confirmación de Medicación Tomada**

Cuando el usuario presiona el botón del pastillero, confirma que tomó la medicación.

**Mensaje del ESP32 al Servidor:**

```json
{
  "type": "medication-taken",
  "timestamp": "2025-08-03T10:15:00.000Z"
}
```

**Notificación de Confirmación al Usuario:**

```json
{
  "type": "notification",
  "notification": {
    "reason": "Medication Taken",
    "title": "Medicación tomada",
    "body": "Has tomado tu medicación correctamente.",
    "screen": "Home",
    "trigger": null
  },
  "timestamp": "2025-08-03T10:15:00.000Z"
}
```

---

## 🔄 Flujos Alternativos

### **Flujo A: Solicitud Manual desde ESP32**

El pastillero puede enviar solicitudes manuales cuando detecta que es hora de una medicación.

**Mensaje del ESP32:**

```json
{
  "type": "capsy-pill-request",
  "pastilla": [{ "id": 3, "cantidad": 1 }]
}
```

### **Flujo B: Configuración Global (Legado)**

Configuración de todos los pastilleros con la misma programación.

**Mensaje del Usuario:**

```json
{
  "type": "capsy",
  "pastilla": [
    {
      "id": 1,
      "cantidad": 1,
      "type": "interval",
      "timeout": 86400000 // 24 horas
    }
  ]
}
```

### **Flujo C: Manejo de Errores**

**Pastillero No Conectado:**

```json
{
  "type": "notification",
  "notification": {
    "reason": "Capsy not connected",
    "title": "Dispositivo desconectado",
    "body": "El pastillero no está conectado al servidor.",
    "screen": "Home"
  },
  "timestamp": "2025-08-03T10:00:00.000Z"
}
```

**Pastillero No Encontrado:**

```json
{
  "type": "error-capsy",
  "message": "Capsy device not found or not connected",
  "timestamp": "2025-08-03T10:00:00.000Z"
}
```

---

## 🏗️ Arquitectura del Sistema

### **Componentes Principales:**

1. **ESP32 (Pastillero Físico)**
   - Conexión WiFi
   - Cliente WebSocket
   - Sensores y actuadores
   - Botones de confirmación

2. **Servidor Node.js**
   - WebSocket Server
   - Gestión de usuarios y dispositivos
   - Programación de horarios
   - Sistema de notificaciones

3. **Aplicación Móvil**
   - Cliente WebSocket
   - Interfaz de usuario
   - Gestión de dispositivos
   - Configuración de horarios

### **Almacenamiento de Datos:**

```typescript
// Estructura de clientes usuarios
clients: Record<string, UserWebSocket> = {
  user123: {
    ws: WebSocket,
    wsCapsy: {
      CAPSY_001: { ws: WebSocket, id: "CAPSY_001", userId: "user123" },
      CAPSY_002: { ws: WebSocket, id: "CAPSY_002", userId: "user123" },
    },
    intervalCapsy: {
      CAPSY_001_1: { id: TimerID, type: "interval" },
      CAPSY_002_2: { id: TimerID, type: "timeout" },
    },
    user: UserData,
    userConfig: UserConfig,
  },
};

// Estructura de pastilleros
clientsCapsy: Record<string, CapsyWebSocket> = {
  CAPSY_001: { ws: WebSocket, id: "CAPSY_001", userId: "user123" },
  CAPSY_002: { ws: WebSocket, id: "CAPSY_002", userId: "user123" },
};
```

---

## ⚙️ Configuraciones Avanzadas

### **Múltiples Pastilleros por Usuario**

```json
// Pastillero para medicación matutina (hora específica)
{
  "type": "capsy-individual",
  "capsyId": "CAPSY_MORNING",
  "pastilla": [
    {
      "id": 1,
      "cantidad": 1,
      "type": "scheduled",
      "startTime": "08:00",
      "intervalMs": 86400000  // 24 horas
    }
  ]
}

// Pastillero para medicación nocturna (hora específica)
{
  "type": "capsy-individual",
  "capsyId": "CAPSY_NIGHT",
  "pastilla": [
    {
      "id": 2,
      "cantidad": 2,
      "type": "scheduled",
      "startTime": "22:00",
      "intervalMs": 86400000  // 24 horas
    }
  ]
}

// Pastillero para medicación cada 8 horas empezando ahora
{
  "type": "capsy-individual",
  "capsyId": "CAPSY_FREQUENT",
  "pastilla": [
    {
      "id": 3,
      "cantidad": 1,
      "type": "interval",
      "timeout": 28800000  // 8 horas desde ahora
    }
  ]
}
```

### **Diferentes Tipos de Temporizadores**

- **interval**: Se repite cada X millisegundos desde el momento de configuración
- **timeout**: Se ejecuta una sola vez después de X millisegundos
- **scheduled**: Inicia a una hora específica y luego se repite cada X millisegundos

### **Configuración con Hora Específica (Tipo "scheduled")**

El tipo "scheduled" permite configurar medicaciones que deben tomarse a horas específicas:

```json
{
  "id": 1,
  "cantidad": 2,
  "type": "scheduled",
  "startTime": "07:30", // Primera toma a las 7:30 AM
  "intervalMs": 28800000 // Luego cada 8 horas (7:30 AM, 3:30 PM, 11:30 PM)
}
```

**Lógica de funcionamiento:**

1. **Primera ejecución**: setTimeout hasta la hora especificada en `startTime`
2. **Ejecuciones posteriores**: setInterval cada `intervalMs` millisegundos
3. **Si ya pasó la hora**: Calcula la próxima ocurrencia basada en el intervalo

### **Gestión de Intervalos Únicos**

Cada pastillero mantiene sus propios temporizadores con claves únicas:

- Formato: `{capsyId}_{pillId}`
- Ejemplo: `CAPSY_001_1`, `CAPSY_002_3`

---

## 🔧 Estados del Sistema

### **Estados del Pastillero:**

1. **Desconectado**: No hay conexión WebSocket
2. **Conectado**: WebSocket activo, esperando vinculación
3. **Vinculado**: Asociado a un usuario específico
4. **Configurado**: Horarios programados y activos
5. **Alertando**: Emitiendo señal sonora/visual
6. **Confirmado**: Usuario confirmó medicación tomada

### **Estados del Usuario:**

1. **Sin pastilleros**: No tiene dispositivos vinculados
2. **Pastilleros vinculados**: Dispositivos asociados sin configurar
3. **Configuración activa**: Horarios programados y funcionando
4. **Recibiendo notificaciones**: Sistema enviando recordatorios

---

## 📱 Integración con ESP32

### **Librerías Necesarias:**

```cpp
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
```

### **Función de Conexión:**

```cpp
void connectToWebSocket() {
  webSocket.begin(server_ip, server_port, "/");
  webSocket.onEvent(webSocketEvent);

  // Enviar mensaje de inicialización
  StaticJsonDocument<200> initMsg;
  initMsg["type"] = "init";
  initMsg["capsyId"] = "CAPSY_001";

  String message;
  serializeJson(initMsg, message);
  webSocket.sendTXT(message);
}
```

### **Manejo de Eventos:**

```cpp
void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case WStype_TEXT:
      handleIncomingMessage((char*)payload);
      break;
    case WStype_CONNECTED:
      Serial.println("Conectado al servidor");
      break;
    case WStype_DISCONNECTED:
      Serial.println("Desconectado del servidor");
      break;
  }
}
```

---

## 🚀 Ventajas del Sistema

### **✅ Escalabilidad**

- Soporte para múltiples pastilleros por usuario
- Configuración independiente de cada dispositivo
- Sin límite en el número de usuarios

### **✅ Flexibilidad**

- Horarios personalizados por pastillero
- Diferentes tipos de medicaciones
- Configuración en tiempo real

### **✅ Robustez**

- Manejo de errores y desconexiones
- Reconexión automática
- Tolerancia a fallos de red

### **✅ Usabilidad**

- Notificaciones claras y específicas
- Confirmación bidireccional
- Interfaz intuitiva

### **✅ Mantenibilidad**

- Código modular y bien estructurado
- Tipos TypeScript bien definidos
- Documentación completa

---

## 🔍 Casos de Uso Típicos

### **Caso 1: Paciente con Medicación Múltiple**

- **CAPSY_MORNING**: Vitaminas a las 8:00 AM diariamente
  ```json
  { "type": "scheduled", "startTime": "08:00", "intervalMs": 86400000 }
  ```
- **CAPSY_AFTERNOON**: Antibiótico cada 8h empezando a las 2:00 PM
  ```json
  { "type": "scheduled", "startTime": "14:00", "intervalMs": 28800000 }
  ```
- **CAPSY_NIGHT**: Pastillas para dormir a las 10:00 PM diariamente
  ```json
  { "type": "scheduled", "startTime": "22:00", "intervalMs": 86400000 }
  ```

### **Caso 2: Cuidador de Ancianos**

- **CAPSY_GRANDPA**: Medicación cardiaca cada 12h desde las 7:00 AM
  ```json
  { "type": "scheduled", "startTime": "07:00", "intervalMs": 43200000 }
  ```
- **CAPSY_GRANDMA**: Medicación diabetes cada 6h desde las 8:30 AM
  ```json
  { "type": "scheduled", "startTime": "08:30", "intervalMs": 21600000 }
  ```
- Notificaciones a familiares sobre cumplimiento

### **Caso 3: Tratamiento Temporal**

- **CAPSY_TEMP**: Antibiótico por 7 días cada 8h empezando inmediatamente
  ```json
  { "type": "interval", "timeout": 28800000 }
  ```
- Configuración manual para finalizar después de 7 días

---

## � GUÍA PASO A PASO: Del Setup a la Confirmación

### 🎯 **FASE 1: PREPARACIÓN INICIAL**

#### **Paso 1.1: Encender y Conectar el Pastillero**

1. **Acción del Usuario**: Conectar el pastillero Capsy a la corriente
2. **Acción del ESP32**:
   - Establecer conexión WiFi
   - Conectarse al servidor WebSocket
   - Enviar mensaje de inicialización

```json
// El ESP32 envía:
{
  "type": "init",
  "capsyId": "CAPSY_001" // Aleatorizado
}
```

3. **Respuesta del Servidor**: Confirma la conexión del dispositivo
4. **Estado**: Pastillero conectado pero no vinculado

#### **Paso 1.2: Iniciar Sesión en la App**

1. **Acción del Usuario**: Abrir la aplicación móvil e iniciar sesión
2. **Acción de la App**: Conectarse al servidor WebSocket

```json
// La app envía:
{
  "type": "init",
  "userId": "user123"
}
```

3. **Respuesta del Servidor**: Confirma la conexión del usuario
4. **Estado**: Usuario conectado, listo para vincular dispositivos

---

### 🔗 **FASE 2: VINCULACIÓN**

#### **Paso 2.1: Vincular Pastillero a la Cuenta**

1. **Acción del Usuario**:
   - Ir a la sección "Agregar Dispositivo"
   - Ingresar el ID del pastillero (ej: "CAPSY_001")
   - Presionar "Vincular"

2. **Acción de la App**: Enviar solicitud de vinculación

```json
// La app envía:
{
  "type": "add-capsy",
  "capsyId": "CAPSY_001"
}
```

3. **Procesamiento del Servidor**:
   - Verificar que el Capsy existe y está conectado
   - Vincular el dispositivo al usuario
   - Actualizar registros internos

4. **Confirmación**: Usuario recibe notificación de vinculación exitosa
5. **Estado**: Pastillero vinculado y listo para configurar

---

### ⚙️ **FASE 3: CONFIGURACIÓN**

#### **Paso 3.1: Configurar Horarios de Medicación**

1. **Acción del Usuario**:
   - Ir a "Configuración de Pastillero"
   - Seleccionar el pastillero CAPSY_001
   - Configurar medicaciones:
     - **Medicación 1**: 2 pastillas cada 8 horas empezando a las 7:30
     - **Medicación 2**: 1 pastilla cada 12 horas empezando ahora

2. **Acción de la App**: Enviar configuración al servidor

```json
// La app envía:
{
  "type": "capsy-individual",
  "capsyId": "CAPSY_001",
  "pastilla": [
    {
      "id": 1,
      "cantidad": 2,
      "type": "scheduled",
      "startTime": "07:30",
      "intervalMs": 28800000 // 8 horas
    },
    {
      "id": 2,
      "cantidad": 1,
      "type": "interval",
      "timeout": 43200000 // 12 horas
    }
  ]
}
```

3. **Procesamiento del Servidor**:
   - Calcular próximas horas de medicación
   - Programar timers individuales para este pastillero
   - Confirmar configuración exitosa

4. **Estado**: Pastillero configurado con horarios automáticos activos

---

### ⏰ **FASE 4: EJECUCIÓN AUTOMÁTICA**

#### **Paso 4.1: Llegada de la Hora Programada**

1. **Trigger Automático**: El servidor detecta que es hora de una medicación
2. **Cálculo del Sistema**:
   - Ejemplo: Son las 7:30 AM, hora de la medicación ID 1
   - El usuario debe tomar 2 pastillas del compartimento 1

#### **Paso 4.2: Envío de Notificaciones**

1. **Al Usuario (App Móvil)**:

```json
{
  "type": "notification",
  "notification": {
    "title": "Hora de tomar medicación",
    "body": "Es hora de tomar tu medicación - Capsy CAPSY_001",
    "screen": "Home"
  }
}
```

2. **Al Pastillero (ESP32)**:

```json
{
  "type": "capsy-alert",
  "pastilla": { "id": 1, "cantidad": 2 }
}
```

---

### 📢 **FASE 5: ALERTA FÍSICA**

#### **Paso 5.1: Activación del Pastillero**

1. **Recepción del ESP32**: El pastillero recibe la alerta
2. **Acciones Físicas**:
   - ✅ **Buzzer**: Emite sonido intermitente
   - ✅ **LED**: Parpadea indicando compartimento 1
   - ✅ **Pantalla** (opcional): Muestra "TOMAR 2 PASTILLAS - COMP 1"
   - ✅ **Tiempo**: Continúa alertando hasta confirmación

3. **Estado**: Pastillero en modo alerta activa

---

### ✅ **FASE 6: CONFIRMACIÓN**

#### **Paso 6.1: Usuario Toma la Medicación**

1. **Acción del Usuario**:
   - Abrir el compartimento 1
   - Tomar las 2 pastillas
   - Presionar el botón de confirmación en el pastillero

#### **Paso 6.2: Confirmación del ESP32**

1. **Detección**: El botón del pastillero es presionado
2. **Acciones del ESP32**:
   - Detener buzzer y LED
   - Enviar confirmación al servidor

```json
// El ESP32 envía:
{
  "type": "medication-taken",
  "timestamp": "2025-08-03T07:30:15.000Z"
}
```

#### **Paso 6.3: Notificación Final**

1. **Procesamiento del Servidor**: Registrar toma exitosa
2. **Notificación al Usuario**:

```json
{
  "type": "notification",
  "notification": {
    "title": "Medicación tomada",
    "body": "Has tomado tu medicación correctamente.",
    "screen": "Home"
  }
}
```

---

### 🔄 **FASE 7: CICLO CONTINUO**

#### **Paso 7.1: Programación de la Siguiente Dosis**

1. **Cálculo Automático**: El servidor programa la siguiente alerta
   - **Medicación 1**: Próxima dosis a las 15:30 (3:30 PM)
   - **Medicación 2**: Próxima dosis a las 19:30 (7:30 PM)

2. **Estado Final**: Sistema listo para la siguiente iteración

---

## 📊 **RESUMEN DEL FLUJO COMPLETO**

| **Fase**          | **Actor Principal** | **Duración Típica** | **Resultado**           |
| ----------------- | ------------------- | ------------------- | ----------------------- |
| 1. Preparación    | Usuario + ESP32     | 2-3 minutos         | Dispositivos conectados |
| 2. Vinculación    | Usuario + App       | 30 segundos         | Pastillero vinculado    |
| 3. Configuración  | Usuario + App       | 2-5 minutos         | Horarios programados    |
| 4. Ejecución      | Servidor (auto)     | Instantáneo         | Alertas enviadas        |
| 5. Alerta Física  | ESP32               | Hasta confirmación  | Usuario notificado      |
| 6. Confirmación   | Usuario + ESP32     | 10-30 segundos      | Toma registrada         |
| 7. Reprogramación | Servidor (auto)     | Instantáneo         | Ciclo continuo          |

---

## 🎯 **PUNTOS CLAVE DEL SISTEMA**

### **Ventajas del Flujo:**

- ✅ **Automatización Completa**: Sin intervención manual después de la configuración
- ✅ **Configuración Individual**: Cada pastillero funciona independientemente
- ✅ **Confirmación Bidireccional**: Usuario y sistema confirman las tomas
- ✅ **Notificaciones Múltiples**: App móvil + alerta física
- ✅ **Horarios Precisos**: Manejo de horarios específicos con intervalos

### **Casos de Uso Especiales:**

- **Pastillero Desconectado**: El sistema notifica al usuario y reagenda
- **Usuario No Confirma**: El pastillero sigue alertando por tiempo determinado
- **Múltiples Pastilleros**: Cada uno opera con su propia configuración
- **Horarios Complejos**: Soporte para horarios específicos con intervalos

---

_Este documento describe el flujo completo del sistema de pastillero inteligente Capsy, incluyendo todas las funcionalidades, casos de uso y consideraciones técnicas._
