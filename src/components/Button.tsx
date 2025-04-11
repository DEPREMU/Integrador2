import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

interface ButtonComponentProps {
  label?: string;
  Children?: React.FC<any>;
  touchableOpacity?: boolean;
  handlePress?: () => any;
}

/**
 * A reusable button component that supports custom labels, child components,
 * touchable opacity effects, and a press handler.
 *
 * @param {ButtonComponentProps} props - The properties for the button component.
 * @param {string} props.label - The text label to display on the button. Optional.
 * @param {React.FC} props.Children - A React functional component to render as a child inside the button. Optional.
 * @param {boolean} props.touchableOpacity - Determines if the button should have a touchable opacity effect when pressed. Optional.
 * @param {() => void} props.handlePress - The function to execute when the button is pressed. If not provided, a default function logs a message to the console. Optional.
 *
 * @returns {JSX.Element} A styled button component with optional label and child components.
 */
const ButtonComponent: React.FC<ButtonComponentProps> = ({
  label,
  Children,
  touchableOpacity,
  handlePress,
}) => {
  if (!handlePress) {
    handlePress = () => {
      console.log(
        "No se ha definido la función handlePress. ",
        label
          ? `label: ${label}`
          : Children
          ? `Children: ${Children}`
          : "sin label ni Children"
      );
    };
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { opacity: pressed && touchableOpacity ? 0.7 : 1 },
      ]}
      onPress={handlePress}
    >
      {label !== undefined && <Text style={styles.textButton}>{label}</Text>}
      {Children !== undefined && <Children />}
    </Pressable>
  );
};

export default ButtonComponent;

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  textButton: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    fontWeight: "bold",
  },
});
