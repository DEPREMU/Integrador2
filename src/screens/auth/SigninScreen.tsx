import React from "react";
import { View, Text, Button } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/navigationTypes";
import { useNavigation } from "@react-navigation/native";

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
