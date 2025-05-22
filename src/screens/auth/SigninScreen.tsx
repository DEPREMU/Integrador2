import React from "react";
import { useNavigation } from "@react-navigation/native";
import { View, Text, Button } from "react-native";
import { RootStackParamList } from "@navigation/navigationTypes";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type SigninScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Signin"
>;

export default function SigninScreen() {
  const navigation = useNavigation<SigninScreenNavigationProp>();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Signin Screen</Text>
      <Button title="Ir a Home" onPress={() => navigation.replace("Home")} />
    </View>
  );
}
