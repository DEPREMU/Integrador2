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
import stylesLoginScreen from "@styles/screens/stylesLoginScreen";
import { RootStackParamList } from "@navigation/navigationTypes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { isValidEmail, isValidPassword } from "@utils";
import { APP_ICON, log, SHOW_PASSWORD_ICON } from "@utils";
import React, { useEffect, useRef, useState } from "react";
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

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
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
      borderWidth: 2,
      borderColor: "#ff0000",
    }));
    return { shake, animatedStyle };
  });

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

  const handleLogin = () => {
    if (!email || !password) return setError(translations.errorEmpty);
    if (!isValidEmail(email)) return setError(translations.errorEmail);
    if (!isValidPassword(password)) return setError(translations.errorPassword);

    setError(null);
    navigation.replace("Home");
  };

  const handlerBlurInputEmail = () => {
    if (isValidEmail(email)) return;

    setValidations((prev) => ({
      ...prev,
      isEmailValid: false,
    }));
    triggerShake("email");
  };

  const handlerBlurInputPassword = () => {
    if (isValidPassword(password)) return;

    setValidations((prev) => ({
      ...prev,
      isPasswordValid: false,
    }));
    triggerShake("password");
  };

  useEffect(() => {
    log(JSON.stringify(validations, null, 2));
  }, [validations]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image source={APP_ICON} style={styles.logo} />

        <Text style={styles.title}>{translations.welcome}</Text>

        {/* Email space */}
        <Animated.View
          style={[
            styles.inputContainer,
            !validations.isEmailValid && shakeInputs[0].animatedStyle,
          ]}
        >
          <TextInput
            style={[styles.input]}
            placeholder={translations.emailPlaceholder}
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            onFocus={() => {
              if (Platform.OS !== "android") return;
              Keyboard.emit("keyboardDidShow");
            }}
            onBlur={handlerBlurInputEmail}
          />
        </Animated.View>

        {/* Password space */}
        <Animated.View
          style={[
            styles.inputContainer,
            !validations.isPasswordValid && shakeInputs[1].animatedStyle,
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
              Keyboard.emit("keyboardDidShow");
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
          handlePress={handleLogin}
          customStyles={{
            button: styles.loginButton,
            textButton: styles.buttonText,
          }}
        />

        <View style={styles.linksContainer}>
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
