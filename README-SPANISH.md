# Nombre del Proyecto: Integrador2

## Descripción General

Este proyecto es el integrador de Tetra 5.

---

## Índice

- [Descripción General](#descripción-general)
- [Prerrequisitos](#prerrequisitos)
- [Instrucciones de Configuración](#instrucciones-de-configuración)
- [Cómo Ejecutar](#cómo-ejecutar)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Alias de Importación (`@`)](#alias-de-importación-)
- [Mejores Prácticas para un Proyecto Expo React Native](#mejores-prácticas-para-un-proyecto-expo-react-native)
- [Extensiones Recomendadas para VS Code](#extensiones-recomendadas-para-vs-code)
- [Cómo programar](#cómo-programar)
  - [Early returns](#early-returns)
  - [JSDOC](#jsdoc)
  - [Funciones Flecha](#funciones-flecha)
  - [Reusabilidad](#reusabilidad)
  - [CamelCase](#camelcase)
  - [Solo inglés](#solo-inglés)
- [Dependencias](#dependencias)
  - [Dependencias Principales](#dependencias-principales)
    - [@react-native-async-storage/async-storage](#react-native-async-storageasync-storage)
    - [@react-navigation/native](#react-navigationnative)
    - [@react-navigation/native-stack](#react-navigationnative-stack)
    - [@supabase/supabase-js](#supabasesupabase-js)
    - [axios](#axios)
  - [Dependencias Específicas de Expo](#dependencias-específicas-de-expo)
    - [expo-background-fetch](#expo-background-fetch)
    - [expo-build-properties](#expo-build-properties)
    - [expo-notifications](#expo-notifications)
    - [expo-secure-store](#expo-secure-store)
    - [expo-status-bar](#expo-status-bar)
  - [Bibliotecas de UI y Animación](#bibliotecas-de-ui-y-animación)
    - [react-native-paper](#react-native-paper)
    - [react-native-reanimated](#react-native-reanimated)
    - [react-native-safe-area-context](#react-native-safe-area-context)
    - [react-native-screens](#react-native-screens)
    - [react-native-web](#react-native-web)

---

## Prerrequisitos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

- Node.js >= V22.0.0
- npm

## Instrucciones de Configuración

1. Clona el repositorio:
   ```bash
   git clone https://github.com/DEPREMU/Integrador2
   ```
2. Navega al directorio del proyecto:
   ```bash
   cd Integrador2
   ```
3. Instala las dependencias:

   ```bash
   npm install
   ```

4. Instala `tsc` para compilar TypeScript a JavaScript:
   ```bash
   npm install -g tsc
   ```

## Cómo Ejecutar

1. Ejecuta el script principal o inicia el servidor:
   ```bash
   npm start
   ```
2. Abre la app en Expo o abre tu navegador y navega a:
   ```
   http://localhost:8081
   ```

---

## Estructura del Proyecto

- `/src`: Contiene el código fuente.

  - `/api`: Clientes de API y capa de servicios.
  - `/components`: Componentes de UI reutilizables.
  - `/constants`: Constantes de toda la app (ej. colores, configuración).
  - `/context`: Contextos de React (ej. autenticación, tema).
  - `/hooks`: Hooks personalizados de React.
  - `/navigation`: Lógica y tipos de navegación (usando React Navigation).
  - `/screens`: Pantallas de la app como `LoginScreen` y `HomeScreen`.
  - `/store`: Manejo de estado global (ej. Zustand, Redux).
  - `/types`: Tipos y modelos TypeScript.
  - `/utils`: Funciones utilitarias y helpers.
  - `App.tsx`: Punto de entrada de la app y envoltorio del navegador raíz.

- `/assets`: Contiene todos los recursos estáticos.

  - `/images`: Imágenes.
  - `/fonts`: Tipografías personalizadas.
  - `/icons`: Archivos de íconos.

- `/server`: Contiene el backend

  - `/dist`: Después de compilar, aquí estarán todos los archivos `.js` compilados desde TypeScript (no disponibles directamente en el repositorio).
  - `/src`: Contiene todo el código fuente en TypeScript.
    - `/routes`: Contiene todas las rutas del servidor.
    - `app.ts`: Contiene la configuración (seguridad) del servidor.
    - `config.ts`: Contiene toda la configuración que usará el servidor.
    - `index.ts`: Contiene la ejecución del servidor.
    - `supabase.ts`: Contiene el cliente de Supabase.
    - `types.ts`: Contiene todos los tipos usados en el servidor.
  - `.env`: Variables de entorno.
  - `package.json`: Dependencias y scripts.
  - `tsconfig.json`: Configuración de TypeScript (para compilar el código ts a js).

- `app.json`: Configuración del proyecto Expo.
- `tsconfig.json`: Configuración de TypeScript (con alias de rutas usando `@`).
- `babel.config.js`: Configuración de Babel (con soporte para alias `@`).
- `package.json`: Dependencias y scripts.
- `README.md`: Documentación del proyecto.

---

## Alias de Importación (`@`)

Este proyecto usa el símbolo `@` como alias de ruta para referirse a la carpeta `/src`. Esto hace que las importaciones sean más limpias y fáciles de manejar:

### En lugar de:

```ts
import LoginScreen from "../../../screens/LoginScreen";
import { colors } from "../../../constants/colors";
```

### Puedes escribir:

```ts
import LoginScreen from "@screens/LoginScreen";
import { colors } from "@utils";
```

---

## Mejores Prácticas para un Proyecto Expo React Native

Para asegurar que este proyecto sea mantenible, escalable y eficiente, aquí te indico cómo recomiendo trabajar con él:

### 1. **Organiza tu trabajo**

- Mantén la estructura de carpetas existente. Por ejemplo, coloca componentes reutilizables en `/src/components` y la lógica específica de pantallas en `/src/screens`.
- Al agregar nuevas funcionalidades, agrupa los archivos relacionados. Por ejemplo, si creas una nueva pantalla, incluye sus estilos y hooks personalizados en el mismo directorio.

### 2. **Usa TypeScript Efectivamente**

- Siempre define tipos e interfaces para props, estado y respuestas de API. Esto te ayudará a detectar errores temprano y facilitará la comprensión del código.
- Si no estás seguro de un tipo, revisa la carpeta `/src/types` o crea una definición nueva allí.

### 3. **Crea Componentes Reutilizables**

- Al crear elementos de UI, piensa si pueden reutilizarse en otros lugares. Si es así, agrégalo a `/src/components`.
- Mantén cada componente enfocado en una sola responsabilidad para que sea más fácil de mantener y probar.

### 4. **Gestiona el Estado con Sabiduría**

- Para necesidades simples de estado, usa la API de Contexto o hooks en `/src/hooks`.

### 5. **Enfócate en el Rendimiento**

- Usa `React.memo` para componentes que no necesiten volver a renderizarse a menudo.
- Optimiza imágenes comprimiéndolas o usando `ImageManipulator` de Expo.
- Evita estilos en línea; en su lugar, usa `StyleSheet.create`.
- Usa funciones flecha para definir estilos, y utilízalos en la pantalla.

### 6. **Maneja los Errores Proactivamente**

- Piensa en cada posible error que pueda causar la lógica, y manéjalo.

### 7. **[Escribe Código Limpio](#cómo-programar)**

- Usa Prettier y ESLint para mantener la consistencia del código. El proyecto ya incluye configuraciones para estas herramientas.
- Usa early returns cuando sea posible [Early returns](#early-returns).
- Sigue las convenciones de nombres usadas en el proyecto para mantener la legibilidad.

### 8. **Prueba Tu Código**

- Escribe pruebas unitarias para nuevos componentes y utilidades.
- Al terminar de programar, prueba la app tanto en la web como en Android para asegurarte de que el código esté bien hecho.

### 9. **Protege los Datos Sensibles**

- Almacena la información sensible como tokens de forma segura usando `expo-secure-store`.
- Todos los datos sensibles serán manejados por el backend ([servidor](#estructura-del-proyecto)).

### 10. **Trabaja con Git**

- Haz commits frecuentemente con mensajes claros. Por ejemplo, “Add login screen” es mejor que “Fix stuff”.
- Usa ramas de características para nueva funcionalidad y haz merge al branch principal vía pull requests.

### 11. **Mantén las Dependencias Actualizadas**

- Revisa regularmente actualizaciones del SDK de Expo y otras dependencias. Ejecuta `npx expo install --check` para ver qué está disponible (**TIP**: No lo uses con todos tus cambios).
- Después de actualizar, prueba bien la app para asegurarte de que todo funcione correctamente.

---

## Extensiones Recomendadas para VS Code

Aquí tienes una lista de extensiones esenciales y útiles para mejorar tu experiencia de desarrollo en este proyecto:

### Extensiones Requeridas

1. **Code Spell Checker**  
   Ayuda a detectar errores ortográficos en tu código, incluyendo nombres de variables y comentarios.  
   [Instalar Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)

2. **Spanish - Code Spell Checker**  
   Verifica la ortografía específicamente en español, útil para comentarios o cadenas de texto en ese idioma.  
   [Instalar Spanish - Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker-spanish)

3. **ES7+ React/Redux/React-Native snippets**  
   Proporciona fragmentos de código útiles para React y Redux.  
   [Instalar ES7+ React/Redux/React-Native snippets](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets)

4. **Prettier - Code formatter**  
   Formatea tu código automáticamente para mantenerlo limpio y consistente.  
   [Instalar Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

5. **Better Comments**  
   Mejora la legibilidad de los comentarios destacando diferentes tipos como TODOs o notas.  
   [Instalar Better Comments](https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments)

6. **React Native Tools**  
   Herramientas para desarrollo, depuración y pruebas en React Native desde VS Code.  
   [Instalar React Native Tools](https://marketplace.visualstudio.com/items?itemName=msjsdiag.vscode-react-native)

### Extensiones Útiles

7. **Error Lens**  
   Muestra errores directamente en el código mientras escribes.  
   [Instalar Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens)

8. **Git History**  
   Visualiza la historia interactiva de tu repositorio Git.  
   [Instalar Git History](https://marketplace.visualstudio.com/items?itemName=donjayamanne.githistory)

9. **GitLens — Git supercharged**  
   Mejora la experiencia de Git con historial, blame y más información del repositorio.  
   [Instalar GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)

10. **Javascript Auto Backticks**  
    Formatea automáticamente comillas invertidas en JS/TS.  
    [Instalar Javascript Auto Backticks](https://marketplace.visualstudio.com/items?itemName=adammaras.javascript-auto-backticks)

11. **npm Intellisense**  
    Sugerencias automáticas al importar módulos npm.  
    [Instalar npm Intellisense](https://marketplace.visualstudio.com/items?itemName=christian-kohler.npm-intellisense)

12. **Path Intellisense**  
    Completa automáticamente rutas de archivos al escribir imports.  
    [Instalar Path Intellisense](https://marketplace.visualstudio.com/items?itemName=christian-kohler.path-intellisense)

---

---

---

# Cómo programar

## Retornos tempranos

Intenta usar retornos tempranos cuando sea posible, también es posible usarlos en bucles `for`.

**En lugar de esto:**

```typescript
const canLogin = (username: string, password: string): boolean => {
  if (username === "user") {
    if (password === "1234") {
      return true;
    }
  }
  return false;
};
```

**Escríbelo así:**

```typescript
const canLogin = (username: string, password: string): boolean => {
  // Esto hace que el código sea más legible.
  if (username !== "user") return false;
  if (password !== "1234") return false;

  return true;
};
```

---

## JSDOC

/\*\*

- JSDoc es una forma estandarizada de documentar código JavaScript. Utiliza una sintaxis especial de comentarios para describir el propósito, los parámetros, los valores de retorno y otros detalles de funciones, clases y otros elementos del código.
- Estos comentarios pueden ser procesados por herramientas para generar documentación o proporcionar asistencia en el editor.

- Elementos clave de JSDoc:
  - `@param`: Describe un parámetro de una función, incluyendo su nombre, tipo y propósito.
  - `@returns`: Describe el valor de retorno de una función, incluyendo su tipo y propósito.
  - `@type`: Especifica el tipo de una variable o propiedad.
  - `@example`: Proporciona un ejemplo de cómo usar el código documentado.
  - `@deprecated`: Marca una función o característica como obsoleta y sugiere alternativas.

Ejemplo:

```typescript
/**
 * Suma dos números.
 * @param {number} a - El primer número.
 * @param {number} b - El segundo número.
 * @returns {number} La suma de los dos números.
 * @example
 * logs(add(2, 3)); // Salida: 5
 *
 */
const add = (a: number, b: number): number => a + b;
```

- Usar JSDoc mejora la legibilidad del código, su mantenibilidad y ayuda a otros desarrolladores a entender el propósito y uso del código.
- **TIP**: Cuando una función o variable está documentada con JSDoc, puedes ver su documentación al pasar el cursor sobre la función o variable en tu editor de código. Esta característica proporciona una vista rápida del propósito, parámetros y valores de retorno, mejorando la experiencia de desarrollo.

---

## Funciones flecha

Las funciones flecha son una forma concisa de escribir funciones en JavaScript. Son especialmente útiles para escribir funciones cortas y mantener el contexto de `this` en ciertos escenarios.

### Sintaxis

Una función flecha utiliza la sintaxis `=>`:

```javascript
// Función tradicional
function add(a, b) {
  return a + b;
}

// Función flecha
const add = (a, b) => a + b;
```

### Características clave

1. **Sintaxis concisa**  
   Las funciones flecha permiten escribir expresiones de función más cortas. Si el cuerpo de la función contiene solo una expresión, puedes omitir las llaves `{}` y la palabra clave `return`.

   ```typescript
   // Función flecha de una sola línea
   const square = (x: number): number => x * x;
   ```

2. **Retorno implícito**  
   Cuando el cuerpo de la función es una única expresión, el resultado de esa expresión se devuelve implícitamente.

   ```typescript
   const greet = (name: Exclude<any, Falsy>): string => `Hello, ${name}!`;
   ```

3. **Sin enlace propio a `this`**  
   Las funciones flecha no tienen su propio contexto `this`. En cambio, lo heredan del ámbito que las rodea. Esto las hace ideales para callbacks y manejadores de eventos.

   ```javascript
   class Counter {
     count = 0;

     increment = () => {
       this.count++;
     };
   }
   ```

4. **Sin objeto `arguments`**  
   Las funciones flecha no tienen su propio objeto `arguments`. Si necesitas acceso a `arguments`, usa una función tradicional.

   ```typescript
   const logArgs = (...args) => console.log(args);
   ```

### Cuándo usar funciones flecha

- Para funciones cortas y simples.
- Cuando necesitas preservar el contexto de `this`.
- En métodos de arrays como `map`, `filter` y `reduce`.

### Cuándo **no** usar funciones flecha

- Al definir métodos en el prototipo de una clase (usa funciones tradicionales).
- Cuando necesitas acceso al objeto `arguments`.

---

## Reutilización

Todo puede ser reutilizable.

Por ejemplo:

```typescript
const formatPhoneNumber = (phoneNumber: string, countryCode: string) => {
  if (countryCode.toLowerCase() === "mx") {
    return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  } else if (countryCode.toLowerCase() === "us") {
    //...
  }
};
```

Esta función puede usarse en otras partes del código. Esta función debería estar en el archivo **[/src/utils/functions.ts](#project-structure)**.

---

## camelCase

camelCase es una convención de nombres ampliamente utilizada en programación, donde la primera palabra se escribe en minúsculas y cada palabra subsiguiente comienza con mayúscula. Este estilo mejora la legibilidad y ayuda a distinguir las palabras en nombres de variables, funciones y propiedades.

### Ejemplos

```typescript
import { User } from "@types";

// Nombres de variables
let userName: number = "JohnDoe";
let isLoggedIn: boolean = true;

// Nombres de funciones
const calculateTotal = (price: number, tax: number): number => price + tax;

// Propiedades de objetos
const user: User = {
  firstName: "John",
  lastName: "Doe",
};
```

### ¿Por qué usar camelCase?

1. **Legibilidad**  
   camelCase facilita leer, escribir y entender los nombres de variables y funciones, especialmente cuando tienen varias palabras.

2. **Consistencia**  
   Seguir una convención de nombres consistente mejora el mantenimiento del código y reduce la confusión.

3. **Estándares de la comunidad**  
   camelCase es la convención estándar de nombres en JavaScript y muchos otros lenguajes, lo que hace que tu código sea más familiar para otros desarrolladores.

---

## **Solo inglés**

Escribe funciones, nombres de variables, documentación y cualquier otro elemento **solo en inglés**.

**No hagas esto:**

```typescript
const nombreDeUsuario: string = "Nico";
/**
 * Suma dos números.
 * @param {number} numero1 - El primer número.
 * @param {number} b - El segundo número.
 * @returns {number} La suma de los dos números.
 * @example
 * log(sumar(2, 3)); // Salida: 5
 *
 */
const sumar = (numero1: number, numero2: number): number => numero1 + numero2;
```

**Haz esto:**

```typescript
const username: string = "Nico";
/**
 * Adds two numbers together.
 * @param {number} num1 - The first number.
 * @param {number} num2 - The second number.
 * @returns {number} The sum of the two numbers.
 * @example
 * log(add(2, 3)); // Outputs: 5
 *
 */
const add = (num1: number, num2: number): number => num1 + num2;
// o
const addition = (num1: number, num2: number): number => num1 + num2;
```

**Si el código está en otro idioma, el pull request será rechazado, incluso si solo una variable está en otro idioma.**

## Dependencias

Este proyecto utiliza las siguientes dependencias para proporcionar funcionalidad y mejorar la experiencia de desarrollo:

### Dependencias Principales

1. **`@react-native-async-storage/async-storage`**  
   Proporciona un sistema de almacenamiento de clave-valor simple, persistente y asíncrono para aplicaciones React Native. Útil para almacenar pequeñas cantidades de datos como preferencias de usuario o datos no sensibles.  
   [Más información](https://github.com/react-native-async-storage/async-storage)

2. **`@react-navigation/native`**  
   La biblioteca principal para la navegación en aplicaciones React Native. Proporciona una forma flexible y personalizable de manejar la navegación entre pantallas.  
   [Más información](https://reactnavigation.org/)

3. **`@react-navigation/native-stack`**  
   Un navegador de pila para React Navigation, optimizado para el rendimiento y facilidad de uso. Ideal para gestionar transiciones entre pantallas.  
   [Más información](https://reactnavigation.org/docs/native-stack-navigator)

4. **`@supabase/supabase-js`**  
   Una biblioteca cliente de JavaScript para interactuar con Supabase, una plataforma backend-as-a-service. Esto se usará solo para autenticación.  
   [Más información](https://supabase.com/docs/reference/javascript)

5. **`axios`**  
   Un cliente HTTP basado en promesas para realizar solicitudes API. Simplifica el manejo de solicitudes y respuestas, incluyendo el manejo de errores e interceptores.  
   [Más información](https://axios-http.com/)

### Dependencias Específicas de Expo

6. **`expo-background-fetch`**  
   Permite que las tareas en segundo plano se ejecuten periódicamente, incluso cuando la aplicación no está en primer plano. Útil para tareas como sincronización de datos.  
   [Más información](https://docs.expo.dev/versions/latest/sdk/background-fetch/)

7. **`expo-build-properties`**  
   Permite la personalización de propiedades de compilación nativas para aplicaciones Expo, como configuraciones de Gradle o Xcode. Esto se usa solo para solicitudes HTTP (eliminar en producción).  
   [Más información](https://docs.expo.dev/versions/latest/sdk/build-properties/)

8. **`expo-notifications`**  
   Proporciona herramientas para gestionar notificaciones push, incluyendo la programación y el manejo de interacciones del usuario.  
   [Más información](https://docs.expo.dev/versions/latest/sdk/notifications/)

9. **`expo-secure-store`**  
   Ofrece una forma segura de almacenar datos sensibles como tokens o credenciales utilizando los mecanismos de almacenamiento seguro del dispositivo.  
   [Más información](https://docs.expo.dev/versions/latest/sdk/securestore/)

10. **`expo-status-bar`**  
    Una biblioteca ligera para gestionar la apariencia de la barra de estado. Se usará para el manejo de temas.  
    [Más información](https://docs.expo.dev/versions/latest/sdk/status-bar/)

### Bibliotecas de UI y Animación

11. **`react-native-paper`**  
    Una biblioteca para construir componentes de Material Design hermosos y personalizables en React Native.  
    [Más información](https://callstack.github.io/react-native-paper/)

12. **`react-native-reanimated`**  
    Una poderosa biblioteca de animación para crear animaciones suaves y complejas en React Native.  
    [Más información](https://docs.swmansion.com/react-native-reanimated/)

13. **`react-native-safe-area-context`**  
    Proporciona utilidades para manejar los márgenes de áreas seguras, asegurando que la interfaz de usuario de tu aplicación se muestre correctamente en dispositivos con muescas o esquinas redondeadas.  
    [Más información](https://github.com/th3rdwave/react-native-safe-area-context)

14. **`react-native-screens`**  
    Optimiza el renderizado y las transiciones de pantallas en aplicaciones React Native, mejorando el rendimiento y el uso de memoria.  
    [Más información](https://github.com/software-mansion/react-native-screens)

15. **`react-native-web`**  
    Permite que los componentes de React Native se ejecuten en la web, permitiendo el desarrollo multiplataforma.  
    [Más información](https://necolas.github.io/react-native-web/)

---
