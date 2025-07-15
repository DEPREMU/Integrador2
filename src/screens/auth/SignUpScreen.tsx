import Animated, {
  withTiming,
  SharedValue,
  withSequence,
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import ButtonComponent from "@components/common/Button";
import { useLanguage } from "@context/LanguageContext";
import { useNavigation } from "@react-navigation/native";
import { useModal } from "@/context/ModalContext";
import stylesLoginScreen from "@styles/screens/stylesLoginScreen";
import { useUserContext } from "@context/UserContext";
import { Text, TextInput } from "react-native-paper";
import { ActivityIndicator } from "react-native-paper";
import { RootStackParamList } from "@navigation/navigationTypes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { isValidEmail, isValidPassword } from "@utils";
import { View, Image, Keyboard, Platform } from "react-native";
import { APP_ICON, log, SHOW_PASSWORD_ICON } from "@utils";
import React, { useCallback, useEffect, useState } from "react";

type SignUpScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

type ShakeInput = {
  shake: SharedValue<number>;
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
};

const SignUpScreen: React.FC = () => {
  const { t } = useLanguage();
  const { signUp } = useUserContext();
  const { styles } = stylesLoginScreen();
  const navigation = useNavigation<SignUpScreenNavigationProp>();
  const { openModal, closeModal } = useModal();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [signingUp, setSigningUp] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validations, setValidations] = useState<
    Record<"isEmailValid" | "isPasswordValid", boolean>
  >({
    isEmailValid: true,
    isPasswordValid: true,
  });

  const handlePressSignUp = useCallback(() => {
    setSigningUp(true);
    if (signingUp) return;
    signUp(email, password, (err) => {
      if (err) {
        setError(err.message);
        setSigningUp(false);
        return log(err.message, email, password);
      }

      setSigningUp(false);
      openModal(
        //Label
        t("successSignUp"),
        // Body
        `${t("successSignUpMessage")}\n${t("verifyEmail")}`,
        // Buttons
        <ButtonComponent
          label={t("close")}
          handlePress={() => {
            navigation.replace("Login");
            closeModal();
          }}
        />,
      );
    });
  }, [
    t,
    email,
    password,
    openModal,
    closeModal,
    signUp,
    signingUp,
    navigation,
  ]);

  const shakeInputs: ShakeInput[] = [
    { shake: useSharedValue(0), animatedStyle: {} },
    { shake: useSharedValue(0), animatedStyle: {} },
  ];

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
          label={!signingUp ? t("signUp") : ""}
          children={
            signingUp ? (
              <ActivityIndicator
                size="small"
                color="#fff"
                style={styles.marginRight10}
              />
            ) : null
          }
          disabled={signingUp}
          touchableOpacity
          handlePress={handlePressSignUp}
          customStyles={{
            button: styles.loginButton,
            textButton: styles.buttonText,
          }}
        />

        <View style={styles.linksContainer}>
          <ButtonComponent
            label={t("hasAccount")}
            touchableOpacity
            handlePress={() => navigation.replace("Login")}
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

export default SignUpScreen;
