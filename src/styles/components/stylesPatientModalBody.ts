// /src/styles/components/stylesPatientModalBody.ts
import { StyleSheet } from "react-native";

export const useStylesPatientModalBody = () =>
  StyleSheet.create({
    container: {
      width: "100%",
      alignContent: "center",
    },
    tabContainer: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderColor: "#ccc",
      marginBottom: 12,
    },
    tabButton: {
      flex: 1,
      paddingVertical: 12,
      alignItems: "center",
    },
    tabActive: {
      borderBottomWidth: 2,
      borderColor: "#00a69d",
    },
    tabText: {
      fontSize: 16,
      color: "#555",
    },
    tabTextActive: {
      color: "#00a69d",
      fontWeight: "600",
    },
    fixedContainer: {
      position: "relative",
      width: "100%",
      overflow: "hidden",
    },
    flexGrow: {
      flex: 1,
    },
    formWrapper: {
      paddingHorizontal: 0,
      paddingBottom: 16,
    },
    scrollHint: {
      position: "absolute",
      right: 4,
      top: 0,
      bottom: 0,
      width: 2,
      backgroundColor: "rgba(0, 0, 0, 0.1)",
      borderRadius: 1,
    },
  });
