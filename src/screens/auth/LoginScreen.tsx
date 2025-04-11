import React from "react";
import { View, Text, Button } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/navigationTypes";
import { useNavigation } from "@react-navigation/native";
import ButtonComponent from "@/components/Button";

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Login Screen</Text>
      <ButtonComponent
        label="Press here"
        touchableOpacity
        handlePress={() => navigation.replace("Home")}
      />
    </View>
  );
}
