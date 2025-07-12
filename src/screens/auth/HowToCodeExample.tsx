/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  saveData,
  removeData,
  typeLanguages,
  saveDataSecure,
  interpolateMessage,
  removeDataSecure,
  loadDataSecure,
  KEYS_STORAGE,
  loadData,
  log,
} from "@utils";
import { UserSession } from "@types";
import { useModal } from "@context/ModalContext";
import { useLanguage } from "@context/LanguageContext";
import ButtonComponent from "@components/common/Button";
import { useUserContext } from "@context/UserContext";
import { useBackgroundTask } from "@context/BackgroundTaskContext";
import { useResponsiveLayout } from "@context/LayoutContext";
import React, { useEffect, useState } from "react";
import { View, TextInput, Text, StyleSheet, Switch } from "react-native";

const HowToCodeExample: React.FC = () => {
  // Importing styles, translations, and context hooks
  // useStylesLoginTest is a custom hook that returns styles for the Login component based on the device's responsive layout.
  const { styles, height, width } = useStylesLoginTest();
  // useLanguage provides translations for the app, allowing for multilingual support. translations is an object containing the translated strings, language is the current language code, and setLanguage is a function to change the language.
  const { t, language, changeLanguage } = useLanguage();
  // useModal provides methods to open and close modals, and set custom styles for them. openModal is used to display a modal with a title, body content, and buttons, while closeModal hides the modal.
  // setCustomStyles allows for dynamic styling of the modal based on the current theme or user preferences.
  const { openModal, closeModal, setCustomStyles } = useModal();
  // useBackgroundTask provides methods to manage background tasks in the app. It allows adding tasks to a queue and running them sequentially, ensuring that tasks are executed even if the user navigates away from the screen.
  // addTaskQueue is used to add a task to the queue, runTask executes a task immediately.
  const { addTaskQueue, runTask } = useBackgroundTask();
  // useUserContext provides user authentication methods and state management. It includes user information, login/logout functions, and loading state.
  // user is the current user object, isLoggedIn indicates if the user is authenticated, loading shows if the authentication process is ongoing, and login/logout methods handle user sessions.
  const { userSession, isLoggedIn, loading, signUp } = useUserContext();
  const customStylesButtonModal = StyleSheet.create({
    // eslint-disable-next-line react-native/no-unused-styles
    button: { marginVertical: 0 },
    // eslint-disable-next-line react-native/no-unused-styles
    textButton: {},
  });

  // Effect to handle the login process and data storage
  // UseEffect is used to run functions when the component mounts. If the second argument is an empty array, it will only run once when the component mounts. If the second argument is an array with dependencies, it will run when any of the dependencies change.
  useEffect(() => {
    const save = async () => {
      type typeValueToSave = { valueToSave: string } | string;
      const randomBoolean = Math.random() > 0.5;
      const valueToSave = Math.random().toString(36).substring(2, 15);
      // Ternary operator to determine the type of value to save based on a random boolean value. (Condition ? valueIfTrue : valueIfFalse)
      const rand: typeValueToSave = randomBoolean
        ? { valueToSave }
        : valueToSave;
      // This function (log) and (logError) are used to log messages to the console or a logging service.
      // If the app is in development, it will log to the console.
      // If the app is in preview, it will log to a logging service (API logs).
      // If the app is in production, the log won't show anything.
      // This is useful for debugging and tracking the app's behavior, making it safe to use in production without exposing sensitive information.
      runTask(() => log("Random value generated:", rand));
      // Add tasks to the background task queue
      // These tasks will be executed sequentially, allowing for asynchronous operations without blocking the main thread.
      // The addTaskQueue function is used to add tasks to the queue, which will be executed in the order they are added.
      addTaskQueue(async () => {
        // KEYS_STORAGE is an object that contains keys for secure and regular storage.
        // Values that starts with "_" are for secure storage
        // Values that starts with "@" are for regular storage.
        await saveData(KEYS_STORAGE.TEST2, rand);
      });
      addTaskQueue(async () => await saveDataSecure(KEYS_STORAGE.TEST1, rand));
      addTaskQueue(async () => {
        // loadData is used to retrieve data from regular storage
        // loadDataSecure is used to retrieve data from secure storage
        // DO NOT use loadData/saveData/removeData for sensitive data.
        // Each of these functions can have a callback.
        const data = await loadData<typeValueToSave>(KEYS_STORAGE.TEST2);
        log("Data loaded from regular storage:", data);
      });
      addTaskQueue(async () => {
        const data = await loadDataSecure<typeValueToSave>(KEYS_STORAGE.TEST1);
        log("Data loaded from secure storage:", data);
      });
      addTaskQueue(async () => {
        await removeData(KEYS_STORAGE.TEST2);
        log("Data removed from regular storage");
      });
      addTaskQueue(async () => {
        await removeDataSecure(KEYS_STORAGE.TEST1);
        log("Data removed from secure storage");
      });
      addTaskQueue(() => {
        log("All tasks completed successfully");
      });
    };

    save();
  }, [addTaskQueue, runTask]);

  // If loading is true (from userContext), display a welcome message
  if (loading) return <Text>{t("welcome")}</Text>;

  // Function to handle sign-up button press
  // This function calls the signUp method from userContext with the provided email and password.
  const handlePressSignUp = (email: string, password: string) => {
    signUp(email, password, (err) => {
      if (err) {
        openModal(
          // We give the modal a title, body, and buttons
          t("error"),
          `${t("errorSignUp")}\n${err.message}`,
          <ButtonComponent
            label={t("close")}
            handlePress={closeModal}
            customStyles={customStylesButtonModal}
          />,
        );
        return;
      }

      openModal(
        //Label
        t("successSignUp"),
        // Body
        `${t("successSignUpMessage")}\n${t("verifyEmail")}`,
        // Buttons
        <ButtonComponent
          label={t("close")}
          handlePress={closeModal}
          customStyles={customStylesButtonModal}
        />,
      );
    });
  };

  return (
    <View style={styles.container}>
      {/* This make the code more readable, if the first condition is true, it will render "UserLoggedIn" */}
      {isLoggedIn && <UserLoggedIn userSession={userSession} />}
      {!isLoggedIn && <AuthComponent handlePressSignUp={handlePressSignUp} />}
    </View>
  );
};
export default HowToCodeExample;

// LoginComponent handles the login form and user input
// This must be in a separate file to keep the component clean and maintainable.
// Example name of file: AuthComponent.tsx
interface AuthProps {
  handlePressSignUp: (email: string, password: string) => void;
}
const AuthComponent: React.FC<AuthProps> = ({ handlePressSignUp }) => {
  const { login } = useUserContext();
  const { styles } = useStylesLoginTest();
  const { t } = useLanguage();

  // Local state for email, password, and remember me toggle
  // These states are used to manage the login form inputs and feedback messages, all of these states are typed and initialized with default values.
  // All variables must be typed.
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  return (
    <View style={styles.containerAuth}>
      <Text style={styles.titleLogin}>{t("login")}</Text>

      <Text style={styles.label}>{t("email")}</Text>
      <TextInput
        style={styles.input}
        onChangeText={setEmail}
        value={email}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
      />
      <Text style={styles.label}>{t("password")}</Text>
      <TextInput
        style={styles.input}
        onChangeText={setPassword}
        autoComplete="password"
        value={password}
        secureTextEntry
      />
      <View style={styles.switchContainer}>
        <Text>{t("rememberMe")}</Text>
        <Switch value={rememberMe} onValueChange={setRememberMe} />
      </View>
      <ButtonComponent
        label={t("login")} // This is the label for the button
        handlePress={() => login(email, password, rememberMe)} // This is the function that will be called when the button is pressed
        touchableOpacity // This is a prop that makes the button a TouchableOpacity component
        Children={() => <Text style={styles.welcomeText}>{t("welcome")}</Text>} // This is a child component that will be rendered inside the button
        children={<Text style={styles.welcomeText}>{t("welcome")}</Text>} // This is another way to pass children to the button
        customStyles={{ button: styles.button, textButton: styles.textButton }}
        // This is used to add custom styles to the button and text
        // If you want to replace the styles, you can use replaceStyles prop
        replaceStyles={{
          button: styles.button,
          textButton: styles.textButton,
        }}
        disabled={!email || !password} // This disables the button if email or password is empty
        forceReplaceStyles // This forces the button to use the styles passed in replaceStyles prop, default is false
        handlerFocus={() => {
          // This function is called when the button is focused
          // It can be used to handle focus events, like showing a keyboard or changing styles
          log("Button focused");
        }}
        handlerHoverIn={() => {
          // This function is called when the button is hovered over
          // It can be used to handle hover events, like changing styles or showing a tooltip
          log("Button hovered in");
        }}
        handlerHoverOut={() => {
          // This function is called when the button is no longer hovered over
          // It can be used to handle hover out events, like changing styles or hiding a tooltip
          log("Button hovered out");
        }}
        touchableOpacityIntensity={0.2} // This sets the intensity of the TouchableOpacity effect, default is 0.7
      />
      <ButtonComponent
        label={t("signUp")}
        handlePress={() => handlePressSignUp(email, password)}
        touchableOpacity
      />
    </View>
  );
};

// UserLoggedIn component displays user information and a logout button
// This must be in a separate file to keep the component clean and maintainable.
// Example name of file: UserLoggedIn.tsx
interface UserLoggedInProps {
  userSession: UserSession | null;
}
const UserLoggedIn: React.FC<UserLoggedInProps> = ({ userSession }) => {
  const { logout } = useUserContext();
  const { t } = useLanguage();

  if (!userSession) return <Text>{t("notLoggedIn")}</Text>;

  return (
    <>
      <Text>
        {interpolateMessage(t("welcomeUser"), [
          userSession?.user?.id || "Unknown id",
        ])}
      </Text>
      <ButtonComponent label={t("logOut")} handlePress={logout} />
    </>
  );
};

// Custom hook to create styles based on responsive layout
// This must be in a separate file to keep the component clean and maintainable.
// Example name of file: stylesLoginTest.ts
const useStylesLoginTest = () => {
  const { height, width, isPhone, isTablet, isWeb } = useResponsiveLayout();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: isPhone ? 20 : isTablet ? 40 : 60,
      backgroundColor: "#f5f5f5",
    },
    button: {
      backgroundColor: "#6200ee",
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginTop: 10,
    },
    textButton: {
      color: "#fff",
      fontSize: isPhone ? 16 : isTablet ? 18 : 20,
      textAlign: "center",
      fontWeight: "500",
    },
    containerAuth: {
      width: isWeb ? 500 : "90%",
      padding: isPhone ? 20 : isTablet ? 30 : 40,
      backgroundColor: "#fff",
      borderRadius: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
    titleLogin: {
      fontSize: isPhone ? 26 : isTablet ? 30 : 34,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 30,
      color: "#333",
    },
    label: {
      fontSize: 16,
      fontWeight: "500",
      marginBottom: 5,
      color: "#555",
    },
    input: {
      height: 44,
      borderColor: "#ccc",
      borderWidth: 1,
      borderRadius: 8,
      marginBottom: 15,
      paddingHorizontal: 12,
      backgroundColor: "#fff",
    },
    switchContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 25,
    },
    welcomeText: {
      fontSize: 18,
      textAlign: "center",
      marginBottom: 20,
      color: "#333",
    },
  });

  return { styles, height, width };
};
