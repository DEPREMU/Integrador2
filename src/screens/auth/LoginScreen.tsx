import Animated, {
  withTiming,
  SharedValue,
  withSequence,
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { Switch } from "react-native-paper";
import { useModal } from "@context/ModalContext";
import ButtonComponent from "@components/common/Button";
import { useLanguage } from "@context/LanguageContext";
import { useNavigation } from "@react-navigation/native";
import stylesLoginScreen from "@styles/screens/stylesLoginScreen";
import { useUserContext } from "@context/UserContext";
import { RootStackParamList } from "@navigation/navigationTypes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { isValidEmail, isValidPassword } from "@utils";
import { APP_ICON, log, SHOW_PASSWORD_ICON } from "@utils";
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Image, Keyboard, Platform, TextInput } from "react-native";

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

type ShakeInput = {
  shake: SharedValue<number>;
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
};

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { styles } = stylesLoginScreen();
  const { translations } = useLanguage();
  const { login, isLoggedIn } = useUserContext();
  const { openModal, closeModal } = useModal();

  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [validations, setValidations] = useState<
    Record<"isEmailValid" | "isPasswordValid", boolean>
  >({
    isEmailValid: true,
    isPasswordValid: true,
  });

  const shakeInputs: ShakeInput[] = Array.from({ length: 2 }).map(() => {
    const shake = useSharedValue(0);
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: shake.value }],
    }));
    return { shake, animatedStyle };
  });

  const handlePressLogin = useCallback(() => {
    login(email, password, rememberMe, (session, err) => {
      if (err) {
        setError(err.message);
        return log(err.message, email, password);
      }
      if (!session) {
        openModal(
          translations.errorNoSession,
          translations.errorNoSessionMessage,
          <ButtonComponent
            label={translations.close}
            handlePress={closeModal}
          />
        );
        return log(translations.errorNoSession, email, password);
      }

      openModal(
        //Label
        translations.successSignUp,
        // Body
        `${translations.successSignUpMessage}\n${translations.verifyEmail}`,
        // Buttons
        <ButtonComponent label={translations.close} handlePress={closeModal} />
      );
    });
  }, [email, password, rememberMe, translations, openModal, closeModal, login]);

  const triggerShake = (which: "password" | "email") => {
    const valueToMove = 5;
    const duration = 50;

    (which === "email" ? shakeInputs[0] : shakeInputs[1]).shake.value =
      withSequence(
        withTiming(-valueToMove, { duration }),
        withTiming(valueToMove, { duration: duration * 2 }),
        withTiming(-valueToMove, { duration: duration * 2 }),
        withTiming(valueToMove, { duration: duration * 2 }),
        withTiming(0, { duration })
      );
  };

  useEffect(() => {
    if (isLoggedIn) navigation.replace("Home");
  }, [isLoggedIn, navigation]);

  const handlerBlurInputEmail = () => {
    if (isValidEmail(email)) {
      setValidations((prev) => ({
        ...prev,
        isEmailValid: true,
      }));
      return;
    }

    setValidations((prev) => ({
      ...prev,
      isEmailValid: false,
    }));
    triggerShake("email");
  };

  const handlerBlurInputPassword = () => {
    if (isValidPassword(password)) {
      setValidations((prev) => ({
        ...prev,
        isPasswordValid: true,
      }));
      return;
    }

    setValidations((prev) => ({
      ...prev,
      isPasswordValid: false,
    }));
    triggerShake("password");
  };

  useEffect(() => {
    log(JSON.stringify(validations, null, 2), email, password);
  }, [validations, email, password]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image source={APP_ICON} style={styles.logo} />

        <Text style={styles.title}>{translations.welcome}</Text>

        {/* Email space */}
        <Animated.View
          style={[
            styles.inputContainer,
            validations.isEmailValid ? null : shakeInputs[0].animatedStyle,
            validations.isEmailValid ? null : styles.inputError,
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder={translations.emailPlaceholder}
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            onFocus={() => {
              if (Platform.OS !== "android") return;
              if (typeof Keyboard.emit === "function")
                Keyboard?.emit("keyboardDidShow");
            }}
            onBlur={handlerBlurInputEmail}
          />
        </Animated.View>

        {/* Password space */}
        <Animated.View
          style={[
            styles.inputContainer,
            validations.isPasswordValid ? null : shakeInputs[1].animatedStyle,
            validations.isPasswordValid ? null : styles.inputError,
          ]}
        >
          <TextInput
            style={styles.input}
            placeholder={translations.passwordPlaceholder}
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            onFocus={() => {
              if (Platform.OS !== "android") return;
              if (typeof Keyboard.emit === "function")
                Keyboard?.emit("keyboardDidShow");
            }}
            onBlur={handlerBlurInputPassword}
          />
          <ButtonComponent
            replaceStyles={{
              button: styles.showPasswordButton,
              textButton: {},
            }}
            forceReplaceStyles
            handlePress={() => setShowPassword((prev) => !prev)}
            children={
              <Image
                source={SHOW_PASSWORD_ICON}
                style={{ width: 20, height: 20 }}
              />
            }
          />
        </Animated.View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <ButtonComponent
          label={translations.loginButton}
          touchableOpacity
          handlePress={handlePressLogin}
          customStyles={{
            button: styles.loginButton,
            textButton: styles.buttonText,
          }}
        />

        <View style={styles.linksContainer}>
          <View style={styles.rememberMeContainer}>
            <Text style={styles.rememberMeText}>{translations.rememberMe}</Text>
            <Switch
              color="#7cced4"
              value={rememberMe}
              onValueChange={setRememberMe}
            />
          </View>
          <ButtonComponent
            label={translations.forgotPassword}
            touchableOpacity
            handlePress={() => setShowPassword((prev) => !prev)}
            replaceStyles={{
              button: {},
              textButton: styles.linkText,
            }}
          />
          <ButtonComponent
            label={translations.createAccount}
            touchableOpacity
            handlePress={() => navigation.replace("SignUp")}
            replaceStyles={{
              button: {},
              textButton: styles.linkText,
            }}
            forceReplaceStyles
          />
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;
