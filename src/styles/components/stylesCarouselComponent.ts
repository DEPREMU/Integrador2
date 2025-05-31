import { useResponsiveLayout } from "@/context/LayoutContext";
import { StyleSheet } from "react-native";

/**
 * Hook that returns responsive styles for the carousel,
 * using the device's dynamic width to ensure animations work correctly.
 */

export const stylesCarouselComponent = () => {
  const { width } = useResponsiveLayout();

  const styles = StyleSheet.create({
    container: {
      height: 180,
      width: "100%", 
      justifyContent: "center",
      alignItems: "center",
    },
    carouselContainer: {
      width, 
      height: 180,
      overflow: "hidden", 
      justifyContent: "center",
      alignItems: "center",
    },
    slide: {
      width, 
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
