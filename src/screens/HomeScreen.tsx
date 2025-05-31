import React from "react";
import { View, Image } from "react-native";
import HeaderComponent from "@components/Header";
import CarouselComponent from "@components/Carousel";
import Card from "@components/Card";
import { PAST_IMA, SLOGAN_MSGS } from "@utils";
import stylesHomeScreen from "@styles/screens/stylesHomeScreen";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@navigation/navigationTypes";
import { useLanguage } from "@/context/LanguageContext";

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

/**
 * HomeScreen component that displays the main screen of the app.
 * It includes a header, carousel with messages, an informational card,
 * and an image related to the product.
 *
 * @component
 * @returns {JSX.Element} The rendered home screen.
 *
 * @example
 * <HomeScreen />
 */
const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { stylesHomeScreen: styles } = stylesHomeScreen();
  const { translations } = useLanguage();
  

  return (
    <View style={styles.viewContainer}>
      <HeaderComponent />
      <CarouselComponent items={SLOGAN_MSGS} />
      <Card
        title="Capsy"
        description= {translations.capsysDescription}
      />
      <Image source={PAST_IMA} style={styles.image} />
    </View>
  );
};

export default HomeScreen;
