import React from "react";
import { View, Text } from "react-native";
import ButtonComponent from "@components/Button";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@navigation/navigationTypes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

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
