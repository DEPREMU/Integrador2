# Project Name: Integrador2

## Overview

This project is the Tetra 5 integrative.

---

## Index

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [How to Run](#how-to-run)
- [Project Structure](#project-structure)
- [Import Aliasing (`@`)](#import-aliasing-)
- [Best Practices for an Expo React Native Project](#best-practices-for-an-expo-react-native-project)
- [Recommended VS Code Extensions](#recommended-vs-code-extensions)
- [How to code](#how-to-code)
  - [Early returns](#early-returns)
  - [JSDOC](#jsdoc)
  - [Arrow Functions](#arrow-functions)
  - [Reusability](#reusability)
  - [CamelCase](#camelcase)
  - [Only English](#only-english)
- [Dependencies](#dependencies)
  - [Core Dependencies](#core-dependencies)
    - [@react-native-async-storage/async-storage](#react-native-async-storageasync-storage)
    - [@react-navigation/native](#react-navigationnative)
    - [@react-navigation/native-stack](#react-navigationnative-stack)
    - [@supabase/supabase-js](#supabasesupabase-js)
    - [axios](#axios)
  - [Expo-Specific Dependencies](#expo-specific-dependencies)
    - [expo-background-fetch](#expo-background-fetch)
    - [expo-build-properties](#expo-build-properties)
    - [expo-notifications](#expo-notifications)
    - [expo-secure-store](#expo-secure-store)
    - [expo-status-bar](#expo-status-bar)
  - [UI and Animation Libraries](#ui-and-animation-libraries)
    - [react-native-paper](#react-native-paper)
    - [react-native-reanimated](#react-native-reanimated)
    - [react-native-safe-area-context](#react-native-safe-area-context)
    - [react-native-screens](#react-native-screens)
    - [react-native-web](#react-native-web)

---

## Prerequisites

Before starting, ensure you have the following installed:

- Node.js >= V22.0.0
- npm

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/DEPREMU/Integrador2
   ```
2. Navigate to the project directory:
   ```bash
   cd Integrador2
   ```
3. Install dependencies:

   ```bash
   npm install
   ```

4. Install tsc to compile ts to js
   ```bash
   npm install -g tsc
   ```

## How to Run

1. Execute the main script or start the server:
   ```bash
   npm start
   ```
2. Open the app in expo or open your browser and navigate to:
   ```
   http://localhost:8081
   ```

---

## Project Structure

- `/src`: Contains the source code.

  - `/api`: API clients and service layer.
  - `/components`: Reusable UI components.
  - `/constants`: App-wide constants (e.g., colors, config).
  - `/context`: React contexts (e.g., authentication, theme).
  - `/hooks`: Custom React hooks.
  - `/navigation`: Navigation logic and types (using React Navigation).
  - `/screens`: App screens like `LoginScreen` and `HomeScreen`.
  - `/store`: Global state management (e.g., Zustand, Redux).
  - `/types`: TypeScript types and models.
  - `/utils`: Utility functions and helpers.
  - `App.tsx`: App entry point and root navigator wrapper.

- `/assets`: Contains all static assets.

  - `/images`: Image assets.
  - `/fonts`: Custom fonts.
  - `/icons`: Icon files.

- `/server`: Contains the backend

  - `/dist`: After compilation, here will be all files .js compiled from ts (not available directly in the repository).
  - `/src`: Contains all source code in ts.
    - `/routes`: Contains all routes in the server.
    - `app.ts`: Contains the configuration (security) for the server.
    - `config.ts`: Contains all configuration will use the server.
    - `index.ts`: Contains the server running.
    - `supabase.ts`: Contains the supabase client.
    - `types.ts`: Contains all the types used in the server
  - `.env`: Environment variables.
  - `package.json`: Dependencies and scripts.
  - `tsconfig.json`: TypeScript configuration (compile the ts code to js).

- `app.json`: Expo project configuration.
- `tsconfig.json`: TypeScript configuration (with path aliasing using `@`).
- `babel.config.js`: Babel configuration (with `@` alias support).
- `package.json`: Dependencies and scripts.
- `README.md`: Project documentation.

---

## Import Aliasing (`@`)

This project uses the `@` symbol as a path alias to refer to the `/src` folder. This makes imports cleaner and easier to manage:

### Instead of:

```ts
import LoginScreen from "../../../screens/LoginScreen";
import { colors } from "../../../constants/colors";
```

### You can write:

```ts
import LoginScreen from "@screens/LoginScreen";
import { colors } from "@utils";
```

---

## Best Practices for an Expo React Native Project

To ensure this project is maintainable, scalable, and efficient, here’s how I recommend you work with it:

### 1. **Organize Your Work**

- Stick to the existing folder structure. For example, place reusable components in `/src/components` and keep screen-specific logic in `/src/screens`.
- When adding new features, group related files together. For instance, if you create a new screen, include its styles and any custom hooks in the same directory.

### 2. **Use TypeScript Effectively**

- Always define types and interfaces for props, state, and API responses. This will help you catch errors early and make the code easier to understand.
- If you’re unsure about a type, check the `/src/types` folder or create a new type definition there.

### 3. **Build Reusable Components**

- When creating UI elements, think about whether they can be reused elsewhere. If so, add them to `/src/components`.
- Keep each component focused on a single responsibility to make it easier to maintain and test.

### 4. **Manage State Wisely**

- For simple state needs, use the Context API or hooks in `/src/hooks`.

### 5. **Focus on Performance**

- Use `React.memo` for components that don’t need to re-render often.
- Optimize images by compressing them or using Expo’s `ImageManipulator`.
- Avoid inline styles; instead, use `StyleSheet.create` for better performance.
- Use arrow functions to make the styles, and use it in the screen.

### 6. **Handle Errors Proactively**

- Think in every single error that can cause the logic, and handle it.

### 7. **[Write Clean Code](#how-to-code)**

- Use Prettier and ESLint to keep the codebase consistent. The project already includes configurations for these tools.
- Use early returns when is possible [Early returns](#early-returns).
- Follow the naming conventions used in the project to maintain readability.

### 8. **Test Your Code**

- Write unit tests for new components and utilities.
- When you finish coding, test the app by web and android, ensuring the code is well done.

### 9. **Secure Sensitive Data**

- Store sensitive information like tokens securely using `expo-secure-store`.
- All sensitive data, will be managed by the backend ([server](#project-structure)).

### 10. **Work with Git**

- Commit changes frequently with clear messages. For example, “Add login screen” is better than “Fix stuff.”
- Use feature branches for new functionality and merge them into the main branch via pull requests.

### 11. **Keep Dependencies Updated**

- Regularly check for updates to the Expo SDK and other dependencies. Run `npx expo install --check` to see what’s available (**TIP**: Do not use this with all your changes).
- After updating, test the app thoroughly to ensure everything works as expected.

---

## Recommended VS Code Extensions

Here is a list of essential and useful extensions for improving your development experience in this project:

### Required Extensions

1. **Code Spell Checker**  
   Helps catch spelling mistakes in your code, including variable names and comments. It provides suggestions for correct spelling while you type.  
   [Install Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)

2. **Spanish - Code Spell Checker**  
   Provides spell checking specifically for Spanish language, helping you spot and correct any errors in comments or strings written in Spanish.  
   [Install Spanish - Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker-spanish)

3. **ES7+ React/Redux/React-Native snippets**  
   This extension offers a collection of useful JavaScript and React snippets, including shortcuts for common code patterns like `function components`, `hooks`, and `Redux`.  
   [Install ES7+ React/Redux/React-Native snippets](https://marketplace.visualstudio.com/items?itemName=dsznajder.es7-react-js-snippets)

4. **Prettier - Code formatter**  
   Automatically formats your code to keep it clean and consistent across your project. It works with various languages and is particularly useful for React Native development.  
   [Install Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

5. **Better Comments**  
   Helps you write more readable and organized comments by highlighting different types of comments (e.g., TODOs, alerts, notes) with different colors.  
   [Install Better Comments](https://marketplace.visualstudio.com/items?itemName=aaron-bond.better-comments)

6. **React Native Tools**  
   Provides a rich set of tools for React Native development, including debugging, running apps, and running tests directly from VS Code. This extension is essential for React Native projects as it simplifies the development and debugging process.  
   [Install React Native Tools](https://marketplace.visualstudio.com/items?itemName=msjsdiag.vscode-react-native)

### Helpful Extensions

7. **Error Lens**  
   Displays errors and warnings inline in your code as you type, improving error visibility and reducing the need to constantly check the terminal or problems panel.  
   [Install Error Lens](https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens)

8. **Git History**  
   Provides an interactive history of your Git repositories, making it easier to explore your commits and branches. Great for navigating project history and diffs.  
   [Install Git History](https://marketplace.visualstudio.com/items?itemName=donjayamanne.githistory)

9. **GitLens — Git supercharged**  
   Supercharges your Git experience by providing detailed inline blame, commit history, and repository insights directly within VS Code.  
   [Install GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)

10. **Javascript Auto Backticks**  
    Automatically formats backticks in JavaScript/TypeScript to allow for easy multi-line strings and template literals.  
    [Install Javascript Auto Backticks](https://marketplace.visualstudio.com/items?itemName=adammaras.javascript-auto-backticks)

11. **npm Intellisense**  
    Provides IntelliSense (autocomplete) for npm modules, making it easier to import packages in your code by suggesting and auto-completing them.  
    [Install npm Intellisense](https://marketplace.visualstudio.com/items?itemName=christian-kohler.npm-intellisense)

12. **Path Intellisense**  
    Automatically completes file paths as you type in your import statements. It speeds up the development process by providing suggestions based on your file system structure.  
    [Install Path Intellisense](https://marketplace.visualstudio.com/items?itemName=christian-kohler.path-intellisense)

---

---

---

# How to code

## Early returns

Try using early returns where is possible, it is also possible with for

**Instead of**

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

**Write it like this:**

```typescript
const canLogin = (username: string, password: string): boolean => {
  // This makes the code more readable.
  if (username !== "user") return false;
  if (password !== "1234") return false;

  return true;
};
```

---

## JSDOC

/\*\*

- JSDoc is a standardized way to document JavaScript code. It uses special
- comment syntax to describe the purpose, parameters, return values, and
- other details of functions, classes, and other code elements. These comments
- can be processed by tools to generate documentation or provide in-editor
- assistance.
-
- Key elements of JSDoc:
- - `@param`: Describes a parameter of a function, including its name, type, and purpose.
- - `@returns`: Describes the return value of a function, including its type and purpose.
- - `@type`: Specifies the type of a variable or property.
- - `@example`: Provides an example of how to use the documented code.
- - `@deprecated`: Marks a function or feature as outdated and suggests alternatives.
- Example:

```typescript
/**
 * Adds two numbers together.
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number} The sum of the two numbers.
 * @example
 * log(add(2, 3)); // Outputs: 5
 *
 */
const add = (a: number, b: number): number => a + b;
```

- Using JSDoc improves code readability, maintainability, and helps developers understand the purpose and usage of the code.
- **TIP**: When a function or variable is documented with JSDoc, you can view its documentation by hovering over the function or variable in your code editor. This feature provides quick insights into the purpose, parameters, and return values of the function or variable, enhancing your development experience.

---

## Arrow Functions

Arrow functions are a concise way to write functions in JavaScript. They are especially useful for writing shorter function expressions and maintaining the `this` context in certain scenarios.

### Syntax

An arrow function uses the `=>` syntax:

```javascript
// Traditional function
function add(a, b) {
  return a + b;
}

// Arrow function
const add = (a, b) => a + b;
```

### Key Features

1. **Concise Syntax**  
   Arrow functions allow you to write shorter function expressions. If the function body contains only a single expression, you can omit the braces `{}` and the `return` keyword.

   ```typescript
   // Single-line arrow function
   const square = (x: number): number => x * x;
   ```

2. **Implicit Return**  
   When the function body is a single expression, the result of that expression is implicitly returned.

   ```typescript
   const greet = (name: Exclude<any, Falsy>): string => `Hello, ${name}!`;
   ```

3. **No `this` Binding**  
   Arrow functions do not have their own `this` context. Instead, they inherit `this` from the surrounding scope. This makes them ideal for use in callbacks and event handlers.

   ```javascript
   class Counter {
     count = 0;

     increment = () => {
       this.count++;
     };
   }
   ```

4. **No `arguments` Object**  
   Arrow functions do not have their own `arguments` object. If you need access to `arguments`, use a regular function.

   ```typescript
   const logArgs = (...args) => console.log(args);
   ```

### When to Use Arrow Functions

- For short, simple functions.
- When you need to preserve the `this` context.
- In array methods like `map`, `filter`, and `reduce`.

### When Not to Use Arrow Functions

- When defining methods in a class prototype (use regular functions instead).
- When you need access to the `arguments` object.

---

## Reusability

Everything can be reusable.

For example:

```typescript
const formatPhoneNumber = (phoneNumber: string, countryCode: string) => {
  if (countryCode.toLowerCase() === "mx") {
    return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  } else if (countryCode.toLowerCase() === "us") {
    //...
  }
};
```

This function can be use in other parts of the code, this function should be in the file **[/src/utils/functions.ts](#project-structure)**

---

## CamelCase

camelCase is a widely used naming convention in programming where the first word is written in lowercase, and each subsequent word starts with an uppercase letter. This style improves readability and helps distinguish between words in variable, function, and property names.

### Examples

```typescript
import { User } from "@types";

// Variable names
let userName: number = "JohnDoe";
let isLoggedIn: boolean = true;

// Function names
const calculateTotal = (price: number, tax: number): number => price + tax;

// Object properties
const user: User = {
  firstName: "John",
  lastName: "Doe",
};
```

### Why Use camelCase?

1. **Readability**  
   camelCase makes it easier to read, write and understand variable and function names, especially when they consist of multiple words.

2. **Consistency**  
   Following a consistent naming convention across your codebase improves maintainability and reduces confusion.

3. **Community Standards**  
   camelCase is the standard naming convention in JavaScript and many other programming languages, making your code more familiar to other developers.

## **Only English**

Write functions, variable names, documentation and any other thing only in english.

**Do not**

```typescript
const nombreDeUsuario: string = "Nico";
/**
 * Suma dos números.
 * @param {number} numero1 - El primer numero.
 * @param {number} b - El segundo numero.
 * @returns {number} La suma de los dos números.
 * @example
 * log(sumar(2, 3)); // Salida: 5
 *
 */
const sumar = (numero1: number, numero2: number): number => numero1 + numero2;
```

**Use only english**

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
// or
const addition = (num1: number, num2: number): number => num1 + num2;
```

**If the code is in any other language, the pull request will be reject, even if only one variable name is in another language.**

# Dependencies

This project uses the following dependencies to provide functionality and enhance the development experience:

### Core Dependencies

1. **`@react-native-async-storage/async-storage`**  
   Provides a simple, persistent, and asynchronous key-value storage system for React Native apps. Useful for storing small amounts of data like user preferences or none sensitive data.  
   [Learn more](https://github.com/react-native-async-storage/async-storage)

2. **`@react-navigation/native`**  
   The core library for navigation in React Native apps. It provides a flexible and customizable way to handle navigation between screens.  
   [Learn more](https://reactnavigation.org/)

3. **`@react-navigation/native-stack`**  
   A stack navigator for React Navigation, optimized for performance and ease of use. Ideal for managing screen transitions.  
   [Learn more](https://reactnavigation.org/docs/native-stack-navigator)

4. **`@supabase/supabase-js`**  
   A JavaScript client library for interacting with Supabase, a backend-as-a-service platform. This will be used only for authentication.  
   [Learn more](https://supabase.com/docs/reference/javascript)

5. **`axios`**  
   A promise-based HTTP client for making API requests. It simplifies handling requests and responses, including error handling and interceptors.  
   [Learn more](https://axios-http.com/)

### Expo-Specific Dependencies

6. **`expo-background-fetch`**  
   Enables background tasks to run periodically, even when the app is not in the foreground. Useful for tasks like syncing data.  
   [Learn more](https://docs.expo.dev/versions/latest/sdk/background-fetch/)

7. **`expo-build-properties`**  
   Allows customization of native build properties for Expo apps, such as Gradle or Xcode configurations, this is used only for http request (delete on production).  
   [Learn more](https://docs.expo.dev/versions/latest/sdk/build-properties/)

8. **`expo-notifications`**  
   Provides tools for managing push notifications, including scheduling and handling user interactions.  
   [Learn more](https://docs.expo.dev/versions/latest/sdk/notifications/)

9. **`expo-secure-store`**  
   Offers a secure way to store sensitive data like tokens or credentials using the device's secure storage mechanisms.  
   [Learn more](https://docs.expo.dev/versions/latest/sdk/securestore/)

10. **`expo-status-bar`**  
    A lightweight library for managing the status bar appearance, this will be use for theme handling.  
    [Learn more](https://docs.expo.dev/versions/latest/sdk/status-bar/)

### UI and Animation Libraries

11. **`react-native-paper`**  
    A library for building beautiful and customizable Material Design components in React Native.  
    [Learn more](https://callstack.github.io/react-native-paper/)

12. **`react-native-reanimated`**  
    A powerful animation library for creating smooth and complex animations in React Native.  
    [Learn more](https://docs.swmansion.com/react-native-reanimated/)

13. **`react-native-safe-area-context`**  
    Provides utilities for handling safe area insets, ensuring your app's UI is displayed correctly on devices with notches or rounded corners.  
    [Learn more](https://github.com/th3rdwave/react-native-safe-area-context)

14. **`react-native-screens`**  
    Optimizes screen rendering and transitions in React Native apps, improving performance and memory usage.  
    [Learn more](https://github.com/software-mansion/react-native-screens)

15. **`react-native-web`**  
    Enables React Native components to run on the web, allowing for cross-platform development.  
    [Learn more](https://necolas.github.io/react-native-web/)

---
