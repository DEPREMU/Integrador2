import { useResponsiveLayout } from "@/context/LayoutContext";
import { StyleSheet } from "react-native";

/**
 * Hook que devuelve estilos responsivos para el carrusel,
 * usando el ancho dinámico del dispositivo para que las animaciones funcionen correctamente.
 */
export const stylesCarouselComponent = () => {
  const { width } = useResponsiveLayout();

  const styles = StyleSheet.create({
    container: {
      height: 180,
      width: "100%", // Contenedor padre ocupa todo el ancho disponible
      justifyContent: "center",
      alignItems: "center",
    },
    carouselContainer: {
      width, // Ancho dinámico para que coincida con el valor usado en animaciones
      height: 180,
      overflow: "hidden", // Oculta slides fuera de la vista
      justifyContent: "center",
      alignItems: "center",
    },
    slide: {
      width, // Cada slide ocupa el ancho completo de la pantalla
      position: "absolute", // Para posicionar slides uno encima de otro
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
