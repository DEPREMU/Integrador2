import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import ButtonComponent from "@components/Button";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@navigation/navigationTypes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { APP_ICON, PASS_ICON } from "@/utils";
import stylesLoginScreen from "@styles/screens/stylesLoginScreen";
import { isValidEmail, isValidPassword } from "@utils";

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<"en" | "es">("es"); // Language state

  const { styles } = stylesLoginScreen();

  // Object with all translations
  // This object contains translations for both English and Spanish languages.
  const translations = {
    en: {
      welcome: "Welcome to MediTime",
      emailPlaceholder: "Email",
      passwordPlaceholder: "Password",
      loginButton: "Log In",
      forgotPassword: "Forgot your password?",
      createAccount: "Create new account",
      errorEmpty: "Please fill in all fields",
      errorEmail: "Enter a valid email",
      languageButton: "ES",
    },
    es: {
      welcome: "Bienvenido a MediTime",
      emailPlaceholder: "Correo electrónico",
      passwordPlaceholder: "Contraseña",
      loginButton: "Iniciar Sesión",
      forgotPassword: "¿Olvidaste tu contraseña?",
      createAccount: "Crear nueva cuenta",
      errorEmpty: "Por favor complete todos los campos",
      errorEmail: "Ingrese un email válido",
      languageButton: "EN",
    },
  };

  // Obtain the current translations based on the selected language
  // This will allow us to dynamically change the text displayed in the UI.
  const translation = translations[language];

  /**
   * Handles the login button press.
   * Validates input fields and navigates to Home if valid.
   * Sets error messages if validation fails.
   * @function
   */
  const handleLogin = () => {
    if (!isValidEmail(email)) {
      setError(translation.errorEmpty);
      return;
    }
    if (!isValidPassword(password)) {
      setError(translation.errorEmail);
      return;
    }

    setError("");
    navigation.replace("Home");
  };

  /**
   * Dismisses the keyboard when called.
   * @function
   */
  const dismissKeyboard = () => Keyboard.dismiss();

  return (
    /**
     * Main render of the LoginScreen component. Handles keyboard dismiss, layout, and all UI elements.
     */
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={{ fontWeight: "bold" }}>
            {translation.languageButton}
          </Text>

          <Image source={APP_ICON} style={styles.logo} />

          <Text style={styles.title}>{translation.welcome}</Text>

          {/* Email space */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={translation.emailPlaceholder}
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              onFocus={() => {
                if (Platform.OS === "android") {
                  Keyboard.emit("keyboardDidShow");
                }
              }}
            />
          </View>

          {/* Password space */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={translation.passwordPlaceholder}
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              onFocus={() => {
                if (Platform.OS === "android") {
                  Keyboard.emit("keyboardDidShow");
                }
              }}
            />
            <TouchableOpacity
              style={styles.showPasswordButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Image source={PASS_ICON} style={{ width: 20, height: 20 }} />
            </TouchableOpacity>
          </View>

          {/* Error message */}
          {error !== null && <Text style={styles.errorText}>{error}</Text>}

          {/* Login button using personalized component */}
          <ButtonComponent
            label={translation.loginButton}
            touchableOpacity
            handlePress={handleLogin}
            customStyles={{
              button: styles.loginButton,
              textButton: styles.buttonText,
            }}
          />

          {/* Additional links */}
          <View style={styles.linksContainer}>
            <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)}>
              <Text style={styles.linkText}>{translation.forgotPassword}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
              <Text style={styles.linkText}>{translation.createAccount}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;
