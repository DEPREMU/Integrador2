import Animated, {
  withTiming,
  SharedValue,
  withSequence,
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { ActivityIndicator, Switch } from "react-native-paper";
import { useModal } from "@context/ModalContext";
import ButtonComponent from "@components/common/Button";
import { useLanguage } from "@context/LanguageContext";
import { useNavigation } from "@react-navigation/native";
import stylesLoginScreen from "@styles/screens/stylesLoginScreen";
import { useUserContext } from "@context/UserContext";
import { TextInput, Text } from "react-native-paper";
import { RootStackParamList } from "@navigation/navigationTypes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { isValidEmail, isValidPassword } from "@utils";
import { APP_ICON, log, SHOW_PASSWORD_ICON } from "@utils";
import React, { useCallback, useEffect, useState } from "react";
import { View, Image, Keyboard, Platform } from "react-native";

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
  const { t } = useLanguage();
  const { login, isLoggedIn } = useUserContext();
  const { openModal, closeModal } = useModal();

  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState<string>("");
  const [loggingIn, setLoggingIn] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [validations, setValidations] = useState<
    Record<"isEmailValid" | "isPasswordValid", boolean>
  >({
    isEmailValid: true,
    isPasswordValid: true,
  });

  const shakeInputs: ShakeInput[] = [
    {
      shake: useSharedValue(0),
      animatedStyle: useAnimatedStyle(() => ({
        transform: [{ translateX: 0 }],
      })),
    },
    {
      shake: useSharedValue(0),
      animatedStyle: useAnimatedStyle(() => ({
        transform: [{ translateX: 0 }],
      })),
    },
  ];

  const handlePressLogin = useCallback(() => {
    if (loggingIn) return;
    setLoggingIn(true);
    login(email, password, rememberMe, (session, err) => {
      if (err) {
        setError(err.message);
        setLoggingIn(false);
        return log(err.message, email, password);
      }
      if (!session) {
        openModal(
          t("errorNoSession"),
          t("errorNoSessionMessage"),
          <ButtonComponent label={t("close")} handlePress={closeModal} />,
        );
        setLoggingIn(false);
        return log(t("errorNoSession"), email, password);
      }

      setLoggingIn(false);
      openModal(
        //Label
        t("successSignUp"),
        // Body
        `${t("successSignUpMessage")}\n${t("verifyEmail")}`,
        // Buttons
        <ButtonComponent label={t("close")} handlePress={closeModal} />,
      );
    });
  }, [email, password, rememberMe, openModal, t, closeModal, login, loggingIn]);

  const triggerShake = (which: "password" | "email") => {
    const valueToMove = 5;
    const duration = 50;

    (which === "email" ? shakeInputs[0] : shakeInputs[1]).shake.value =
      withSequence(
        withTiming(-valueToMove, { duration }),
        withTiming(valueToMove, { duration: duration * 2 }),
        withTiming(-valueToMove, { duration: duration * 2 }),
        withTiming(valueToMove, { duration: duration * 2 }),
        withTiming(0, { duration }),
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

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image source={APP_ICON} style={styles.logo} />

        <Text style={styles.title}>{t("welcome")}</Text>

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
            label={t("emailPlaceholder")}
            placeholderTextColor="#999"
            underlineColor="#00a69d"
            activeUnderlineColor="#00a69d"
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
            label={t("passwordPlaceholder")}
            underlineColor="#00a69d"
            activeUnderlineColor="#00a69d"
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
                style={styles.iconImageShowPassword}
              />
            }
          />
        </Animated.View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <ButtonComponent
          label={!loggingIn ? t("loginButton") : ""}
          touchableOpacity
          disabled={loggingIn}
          children={
            loggingIn ? (
              <ActivityIndicator
                size="small"
                color="#fff"
                style={styles.loadingIndicator}
              />
            ) : null
          }
          handlePress={handlePressLogin}
          customStyles={{
            button: styles.loginButton,
            textButton: styles.buttonText,
          }}
        />

        <View style={styles.linksContainer}>
          <View style={styles.rememberMeContainer}>
            <Text style={styles.rememberMeText}>{t("rememberMe")}</Text>
            <Switch
              color="#7cced4"
              value={rememberMe}
              onValueChange={setRememberMe}
            />
          </View>
          <ButtonComponent
            label={t("forgotPassword")}
            touchableOpacity
            handlePress={() => setShowPassword((prev) => !prev)}
            replaceStyles={{
              button: {},
              textButton: styles.linkText,
            }}
          />
          <ButtonComponent
            label={t("createAccount")}
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
