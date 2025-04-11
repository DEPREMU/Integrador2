# Project Name: Integrador2

## Overview

This project is the Tetra 5 integrative.

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

## 📁 Project Structure

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

- `app.json`: Expo project configuration.
- `tsconfig.json`: TypeScript configuration (with path aliasing using `@`).
- `babel.config.js`: Babel configuration (with `@` alias support).
- `.env`: Environment variables.
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
