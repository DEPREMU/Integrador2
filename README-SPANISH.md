# Nombre del Proyecto: Integrador2

## Descripción General

Este proyecto es el integrador del Tetra 5.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalados los siguientes programas:

- Node.js >= V22.0.0
- npm

## Instrucciones de Configuración

1. Clona el repositorio:
   ```bash
   git clone https://github.com/DEPREMU/Integrador2
   ```

````

2. Navega al directorio del proyecto:
   ```bash
   cd Integrador2
   ```
3. Instala las dependencias:
   ```bash
   npm install
   ```

## Cómo Ejecutarlo

1. Ejecuta el script principal o inicia el servidor:
   ```bash
   npm start
   ```
2. Abre la aplicación en Expo o abre tu navegador y navega a:
   ```bash
   http://localhost:8081
   ```

---

## 📁 Estructura del Proyecto

- `/src`: Contiene el código fuente.
  - `/api`: Clientes de API y capa de servicios.
  - `/components`: Componentes reutilizables de la interfaz de usuario.
  - `/constants`: Constantes globales de la aplicación (por ejemplo, colores, configuración).
  - `/context`: Contextos de React (por ejemplo, autenticación, tema).
  - `/hooks`: Hooks personalizados de React.
  - `/navigation`: Lógica de navegación y tipos (usando React Navigation).
  - `/screens`: Pantallas de la aplicación como `LoginScreen` y `HomeScreen`.
  - `/store`: Gestión global del estado (por ejemplo, Zustand, Redux).
  - `/types`: Tipos y modelos de TypeScript.
  - `/utils`: Funciones y utilidades.
  - `App.tsx`: Punto de entrada de la aplicación y envoltorio del navegador raíz.
- `/assets`: Contiene todos los recursos estáticos.

  - `/images`: Archivos de imagen.
  - `/fonts`: Fuentes personalizadas.
  - `/icons`: Archivos de iconos.

- `app.json`: Configuración del proyecto de Expo.
- `tsconfig.json`: Configuración de TypeScript (con alias de ruta usando `@`).
- `babel.config.js`: Configuración de Babel (con soporte para alias `@`).
- `.env`: Variables de entorno.
- `package.json`: Dependencias y scripts.
- `README.md`: Documentación del proyecto.

---

## Alias de Importación (`@`)

Este proyecto utiliza el símbolo `@` como alias de ruta para referirse a la carpeta `/src`. Esto hace que las importaciones sean más limpias y fáciles de gestionar:

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

## Extensiones Recomendadas para VS Code

Aquí tienes una lista de extensiones esenciales y útiles para mejorar tu experiencia de desarrollo en este proyecto:

### Extensiones Requeridas

1. **Code Spell Checker**
   Ayuda a detectar errores de ortografía en tu código, incluidos los nombres de variables y los comentarios. Proporciona sugerencias para corregir la ortografía mientras escribes.
   [Instalar Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)

2. **Spanish - Code Spell Checker**
   Proporciona la comprobación ortográfica específicamente para el idioma español, ayudándote a encontrar y corregir errores en los comentarios o cadenas escritas en español.
   [Instalar Spanish - Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker-spanish)

3. **ES7+ React/Redux/React-Native snippets**
   Esta extensión ofrece una colección de fragmentos de código útiles para JavaScript y React, incluidos accesos directos para patrones comunes como `componentes funcionales`, `hooks` y `Redux`.
   [Instalar ES7+ React/Redux/React-Native snippets](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets)

4. **Prettier - Code formatter**
   Formatea automáticamente tu código para mantenerlo limpio y consistente en todo tu proyecto. Funciona con varios lenguajes y es especialmente útil para el desarrollo con React Native.
   [Instalar Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

5. **Better Comments**
   Ayuda a escribir comentarios más legibles y organizados, destacando diferentes tipos de comentarios (por ejemplo, TODOs, alertas, notas) con colores diferentes.
   [Instalar Better Comments](https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments)

6. **React Native Tools**
   Proporciona un conjunto completo de herramientas para el desarrollo de React Native, incluyendo depuración, ejecución de aplicaciones y pruebas directamente desde VS Code. Esta extensión es esencial para proyectos de React Native, ya que simplifica el proceso de desarrollo y depuración.
   [Instalar React Native Tools](https://marketplace.visualstudio.com/items?itemName=msjsdiag.vscode-react-native)

### Extensiones Útiles

7. **Error Lens**
   Muestra los errores y advertencias en línea en tu código mientras escribes, mejorando la visibilidad de los errores y reduciendo la necesidad de revisar constantemente el terminal o el panel de problemas.
   [Instalar Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens)

8. **Git History**
   Proporciona un historial interactivo de tus repositorios Git, facilitando la exploración de tus commits y ramas. Es genial para navegar por el historial de proyectos y los diffs.
   [Instalar Git History](https://marketplace.visualstudio.com/items?itemName=donjayamanne.githistory)

9. **GitLens — Git supercharged**
   Mejora tu experiencia con Git proporcionando información detallada sobre el autor de cada línea de código, historial de commits y más, directamente dentro de VS Code.
   [Instalar GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)

10. **Javascript Auto Backticks**
    Formatea automáticamente los backticks en JavaScript/TypeScript para permitir cadenas de varias líneas y literales de plantilla fácilmente.
    [Instalar Javascript Auto Backticks](https://marketplace.visualstudio.com/items?itemName=adammaras.javascript-auto-backticks)

11. **npm Intellisense**
    Proporciona IntelliSense (autocompletado) para módulos de npm, facilitando la importación de paquetes en tu código sugiriéndolos y autocompletándolos.
    [Instalar npm Intellisense](https://marketplace.visualstudio.com/items?itemName=christian-kohler.npm-intellisense)

12. **Path Intellisense**
    Completa automáticamente las rutas de los archivos mientras escribes tus declaraciones de importación. Acelera el proceso de desarrollo proporcionando sugerencias basadas en la estructura de tu sistema de archivos.
    [Instalar Path Intellisense](https://marketplace.visualstudio.com/items?itemName=christian-kohler.path-intellisense)
````
