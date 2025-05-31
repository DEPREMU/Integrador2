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
import stylesLoginScreen from "@/styles/components/stylesLoginScreen";

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState<"en" | "es">("es"); // Estado para el idioma

  const { styles } = stylesLoginScreen();

  // Objeto con todas las traducciones
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

  // Función para cambiar idioma
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "es" ? "en" : "es"));
  };

  // Obtener las traducciones actuales
  const t = translations[language];

  /**
   * Handles the login button press.
   * Validates input fields and navigates to Home if valid.
   * Sets error messages if validation fails.
   * @function
   */
  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      setError(t.errorEmpty);
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t.errorEmail);
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
          {/* Botón para cambiar idioma */}
          <TouchableOpacity
            onPress={toggleLanguage}
            style={[
              {
                position: "absolute",
                top: 20,
                right: 20,
                padding: 10,
                backgroundColor: "#e0e0e0",
                borderRadius: 5,
              },
            ]}
          >
            <Text style={{ fontWeight: "bold" }}>{t.languageButton}</Text>
          </TouchableOpacity>

          <Image source={APP_ICON} style={styles.logo} />

          <Text style={styles.title}>{t.welcome}</Text>

          {/* Campo Email */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t.emailPlaceholder}
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

          {/* Campo Contraseña */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t.passwordPlaceholder}
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

          {/* Mensaje de error */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Botón de Login usando tu componente personalizado */}
          <ButtonComponent
            label={t.loginButton}
            touchableOpacity
            handlePress={handleLogin}
            customStyles={{
              button: styles.loginButton,
              textButton: styles.buttonText,
            }}
          />

          {/* Enlaces adicionales */}
          <View style={styles.linksContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={styles.linkText}>{t.forgotPassword}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.linkText}>{t.createAccount}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
