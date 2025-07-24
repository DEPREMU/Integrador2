import { StyleSheet } from "react-native";
import { useResponsiveLayout } from "@context/LayoutContext";

const useStylesChatbot = () => {
  const SIDEBAR_WIDTH = 250;

  const { isPhone, isTablet } = useResponsiveLayout();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: isPhone ? "column" : "row",
      backgroundColor: "#ecebea",
    },
    sidebar: {
      width: isPhone ? "100%" : isTablet ? 200 : SIDEBAR_WIDTH,
      height: isPhone ? 60 : "100%",
      backgroundColor: "#7cced4",
      borderRightWidth: isPhone ? 0 : 1,
      borderBottomWidth: isPhone ? 1 : 0,
      borderRightColor: "#ddd",
      borderBottomColor: "#ddd",
      padding: isPhone ? 8 : 16,
      flexDirection: isPhone ? "row" : "column",
      gap: isPhone ? 5 : 10,
    },
    sidebarTitle: {
      fontSize: isPhone ? 14 : isTablet ? 16 : 18,
      marginBottom: isPhone ? 5 : 10,
      color: "#00a69d",
      fontWeight: "bold",
    },
    sidebarButton: {
      backgroundColor: "#00a69d",
      borderRadius: 8,
      paddingVertical: isPhone ? 6 : 8,
      paddingHorizontal: isPhone ? 8 : 12,
      marginBottom: isPhone ? 5 : 10,
      alignItems: "center",
    },
    sidebarButtonText: {
      color: "white",
      fontSize: isPhone ? 12 : 15,
      fontWeight: "bold",
    },
    sidebarItem: {
      backgroundColor: "#e0f7fa",
      borderRadius: 12,
      paddingVertical: isPhone ? 6 : 10,
      paddingHorizontal: isPhone ? 8 : 14,
      marginBottom: isPhone ? 5 : 10,
    },
    convDate: {
      fontWeight: "bold",
      fontSize: isPhone ? 11 : 13,
      color: "#333",
      marginBottom: 4,
    },
    convPreview: {
      fontSize: isPhone ? 10 : 12,
      color: "#555",
    },
    flex1: {
      flex: 1,
    },
    paddingBottom12: {
      paddingBottom: 12,
    },
    main: {
      flex: 1,
      flexDirection: "column",
      maxWidth: "100%",
    },
    header: {
      backgroundColor: "#00a69d",
      padding: isPhone ? 12 : 16,
      alignItems: "center",
    },
    headerText: {
      color: "white",
      fontSize: isPhone ? 16 : isTablet ? 18 : 20,
      fontWeight: "bold",
    },
    chat: {
      flex: 1,
      padding: isPhone ? 8 : 16,
      backgroundColor: "#ecebea",
    },
    message: {
      maxWidth: isPhone ? "90%" : "80%",
      paddingVertical: isPhone ? 8 : 12,
      paddingHorizontal: isPhone ? 12 : 16,
      borderRadius: 18,
      marginBottom: 8,
      alignSelf: "flex-start",
    },
    user: {
      alignSelf: "flex-end",
      backgroundColor: "#60c4b4",
      color: "white",
      borderBottomRightRadius: 0,
    },
    bot: {
      alignSelf: "flex-start",
      backgroundColor: "#21aae1",
      color: "white",
      borderBottomLeftRadius: 0,
    },
    messageText: {
      color: "white",
      fontSize: isPhone ? 14 : 15,
      lineHeight: isPhone ? 18 : 20,
    },
    typing: {
      fontStyle: "italic",
      opacity: 0.7,
    },
    inputContainer: {
      flexDirection: isPhone ? "column" : "row",
      padding: isPhone ? 8 : 12,
      borderTopWidth: 1,
      borderTopColor: "#ccc",
      backgroundColor: "#ecebea",
      alignItems: isPhone ? "stretch" : "center",
      gap: isPhone ? 8 : 0,
    },
    input: {
      flex: 1,
      paddingVertical: isPhone ? 8 : 10,
      paddingHorizontal: isPhone ? 12 : 14,
      fontSize: isPhone ? 14 : 16,
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 8,
      marginRight: isPhone ? 0 : 8,
      backgroundColor: "white",
    },
    sendButton: {
      backgroundColor: "#00a69d",
      borderRadius: 8,
      paddingVertical: isPhone ? 8 : 10,
      paddingHorizontal: isPhone ? 14 : 16,
      alignItems: "center",
    },
    sendButtonText: {
      color: "white",
      fontSize: isPhone ? 14 : 16,
      fontWeight: "bold",
    },
  });
  return { styles };
};

export default useStylesChatbot;
