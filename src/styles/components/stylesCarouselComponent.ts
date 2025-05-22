import { useResponsiveLayout } from "@/context/LayoutContext";
import { StyleSheet } from "react-native";

export const stylesCarouselComponent = () => {
  const { isPhone, isWeb, width } = useResponsiveLayout();

  const styles = StyleSheet.create({
    container: {
      height: 180,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
    carouselContainer: {
      width: "100%",
      height: 180,
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
    },
    slider: {
      flexDirection: "row",
    },
    slide: {
      width: "100%",
      position: "absolute",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10,
      paddingHorizontal: 20,
    },
    text: {
      fontSize: 18,
      fontWeight: "bold",
      color: "black",
      textAlign: "center",
      zIndex: 10,
    },
    arrows: {
      position: "absolute",
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "transparent",
      justifyContent: "space-around",
    },
    arrowButton: {
      backgroundColor: "#60c4b4",
      borderRadius: 20,
      marginHorizontal: 35,
    },
    arrowText: {
      fontSize: 20,
      fontWeight: "bold",
    },
  });
  return { styles, width };
};
