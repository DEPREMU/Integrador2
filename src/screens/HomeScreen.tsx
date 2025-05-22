import React from "react";
import ButtonComponent from "@components/Button";
import HeaderComponent from "@components/Header";
import CarouselComponent from "@components/Carousel";
import { useNavigation } from "@react-navigation/native";
import { stylesLoginScreen } from "@styles/screens/stylesLoginScreen";
import { RootStackParamList } from "@navigation/navigationTypes";
import { View, Text, Button } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

const messages = [
  "Your meds, on time. Simple.",
  "Where health meets punctuality.",
  "Right dose. Right time. Every time.",
];



const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
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
};

export default HomeScreen;
