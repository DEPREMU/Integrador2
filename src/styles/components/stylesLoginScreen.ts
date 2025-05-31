import { useResponsiveLayout } from "@/context/LayoutContext";
import { StyleSheet } from "react-native";

/**
 * Custom hook for generating styles for the LoginScreen component.
 * Uses responsive layout context to adapt styles based on screen size.
 *
 * @function stylesLoginScreen
 * @returns {{ styles: object, height: number, width: number }} An object containing the styles object and current layout dimensions.
 */
const stylesLoginScreen = () => {
  /**
   * Get current width and height from responsive layout context.
   * @type {{ width: number, height: number }}
   */
  const { width, height } = useResponsiveLayout();

  /**
   * Styles object for the LoginScreen component.
   * @type {object}
   */
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#00a69d",
      justifyContent: "center",
      alignItems: "center",
    },
    background: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "#00a69d",
    },
    content: {
      width: "90%",
      maxWidth: 400,
      backgroundColor: "#f0f4f7",
      borderRadius: 15,
      padding: 25,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    logo: {
      width: 120,
      height: 120,
      marginBottom: 25,
    },
    title: {
      fontSize: 22,
      fontWeight: "600",
      color: "#2c3e50",
      textAlign: "center",
      marginBottom: 30,
      width: "100%",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#fff",
      borderRadius: 10,
      marginBottom: 15,
      paddingHorizontal: 15,
      width: "100%",
      height: 50,
    },
    icon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      color: "#333",
      height: "100%",
    },
    // ESTILOS CORREGIDOS PARA EL BOTÓN DE MOSTRAR CONTRASEÑA
    showPasswordButton: {
      width: 30, // Tamaño adecuado para el área táctil
      height: 30, // Tamaño adecuado para el área táctil
      justifyContent: "center",
      alignItems: "center",
      padding: 0, // Elimina el padding innecesario
      marginLeft: 5, // Espaciado más pequeño
      zIndex: 2,
    },
    loginButton: {
      backgroundColor: "#3498db",
      borderRadius: 10,
      height: 50,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 25,
      width: "100%",
    },
    buttonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600",
    },
    linksContainer: {
      marginTop: 20,
      width: "100%",
      alignItems: "center",
    },
    linkText: {
      color: "#00a69d",
      fontSize: 14,
      marginVertical: 8,
      fontWeight: "500",
    },
    errorText: {
      color: "#e74c3c",
      fontSize: 14,
      textAlign: "center",
      marginTop: 15,
      width: "100%",
    },
  });

  /**
   * Returns the styles object and current layout dimensions.
   * @returns {{ styles: object, height: number, width: number }}
   */
  return { styles, height, width };
};

export default stylesLoginScreen;
