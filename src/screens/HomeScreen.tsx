import React from "react";
import CardComponent from "@components/Home/Card";
import { View, Image } from "react-native";
import { useLanguage } from "@context/LanguageContext";
import Header from "@components/common/Header";
import stylesHomeScreen from "@styles/screens/stylesHomeScreen";
import CarouselComponent from "@components/Home/Carousel";
import { PAST_IMA, SLOGAN_MSGS } from "@utils";

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
const HomeScreen: React.FC = () => {
  const { stylesHomeScreen: styles } = stylesHomeScreen();
  const { translations } = useLanguage();

  return (
    <View style={styles.viewContainer}>
      <Header />
      <CarouselComponent items={SLOGAN_MSGS} />
      <CardComponent
        title="Capsy"
        description={translations.capsysDescription}
      />
      <Image source={PAST_IMA} style={styles.image} />
    </View>
  );
};

export default HomeScreen;
