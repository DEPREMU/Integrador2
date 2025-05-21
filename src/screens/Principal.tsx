import React from "react";
import { View, Text, Button } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/navigationTypes";
import { useNavigation } from "@react-navigation/native";
import ButtonComponent from "@/components/Button";
import HeaderComponent from "@/components/Header";
import { stylesLoginScreen } from "@/styles/screens/stylesLoginScreen";
import CarouselComponent from "@/components/Carousel";

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

const messages = [
  "Your meds, on time. Simple.",
  "Where health meets punctuality.",
  "Right dose. Right time. Every time.",
];

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const styles = stylesLoginScreen();

  return (
    <View style={styles.viewContainer}>
      <HeaderComponent />
      <CarouselComponent items={messages} />

      <ButtonComponent
        label="Press here"
        touchableOpacity
        handlePress={() => navigation.replace("Home")}
      />
    </View>
  );
}
