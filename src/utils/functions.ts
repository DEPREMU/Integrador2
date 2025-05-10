/**
 * Validates whether a given string is a properly formatted email address.
 *
 * @param email - The email address to validate.
 * @returns `true` if the email address is valid, otherwise `false`.
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates if a given password meets the required criteria.
 *
 * The password must:
 * - Be at least 8 characters long.
 * - Contain at least one letter (uppercase or lowercase).
 * - Contain at least one numeric digit.
 *
 * @param password - The password string to validate.
 * @returns `true` if the password is valid, otherwise `false`.
 */
export const isValidPassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Retrieves the file name of the caller function from the stack trace.
 *
 * @returns The file name as a string if it can be determined, otherwise "unknown".
 *
 * @remarks
 * This function uses the `Error` stack trace to extract the file name of the caller.
 * It parses the stack trace and attempts to match the file name using a regular expression.
 * Note that the accuracy of this function depends on the structure of the stack trace,
 * which may vary between environments (e.g., browsers, Node.js).
 *
 * @example
 * ```typescript
 * const fileName = getFileName();
 * console.log(fileName); // Outputs the file name of the caller or "unknown".
 * ```
 */
export const getFileName = (): string => {
  const stack = new Error().stack;
  if (stack) {
    const fileName = stack.split("\n")[2].trim();
    const fileNameMatch = fileName.match(/at (.+):\d+:\d+/);
    if (fileNameMatch) {
      return fileNameMatch[1];
    }
  }
  return "unknown";
};

/**
 * Retrieves the line number of the code that called this function.
 *
 * This function uses the stack trace of a newly created `Error` object
 * to determine the line number of the caller. If the stack trace is not
 * available or the line number cannot be determined, it returns `-1`.
 *
 * @returns The line number of the caller, or `-1` if it cannot be determined.
 */
export const getLineNumber = (): number => {
  const stack = new Error().stack;
  if (stack) {
    const lineNumber = stack.split("\n")[2].trim();
    const lineNumberMatch = lineNumber.match(/:(\d+):/);
    if (lineNumberMatch) {
      return parseInt(lineNumberMatch[1], 10);
    }
  }
  return -1;
};
