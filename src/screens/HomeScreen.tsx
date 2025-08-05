import React from "react";
import CardComponent from "@components/Home/Card";
import { View, Image, ScrollView, Text, Platform } from "react-native";
import { useLanguage } from "@context/LanguageContext";
import HeaderComponent from "@components/common/Header";
import stylesHomeScreen from "@styles/screens/stylesHomeScreen";
import CarouselComponent from "@components/Home/Carousel";
import { PAST_IMA, SLOGAN_MSGS, APP_NAME } from "@utils";

/**
 * HomeScreen component that displays the main screen of the app.
 * It includes a header, carousel with messages, an informational card,
 * a centered product image, and a footer (web only). The content is scrollable for better
 * user experience on different screen sizes.
 *
 * @component
 * @returns {JSX.Element} The rendered home screen with scrollable content, centered image and conditional footer.
 *
 * @example
 * <HomeScreen />
 */
const HomeScreen: React.FC = () => {
  const { stylesHomeScreen: styles } = stylesHomeScreen();
  const { t } = useLanguage();

  return (
    <View style={styles.viewContainer}>
      <HeaderComponent />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <CarouselComponent items={SLOGAN_MSGS} />
        <CardComponent title="Capsy" description={t("capsysDescription")} />

        <View style={styles.imageContainer}>
          <Image source={PAST_IMA} style={styles.image} />
        </View>

        {Platform.OS === "web" && (
          <View style={styles.footerContainer}>
            <Text style={styles.footerTitle}>{APP_NAME}</Text>
            <Text style={styles.footerDescription}>
              {t("footerDescription")}
            </Text>
            <Text style={styles.footerCopyright}>
              © 2025 Capsy. All rights reserved.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default HomeScreen;
