import React from "react";
import { Pressable, Text } from "react-native";
import { useStylesButtonComponent } from "@styles/components/stylesButtonComponent";

type StylesButtonComponent = "button" | "textButton";
interface ButtonComponentProps {
  label?: string;
  customStyles?: Record<StylesButtonComponent, any>;
  replaceStyles?: Record<StylesButtonComponent, any>;
  children?: React.ReactNode;
  touchableOpacity?: boolean;
  handlePress: () => any;
}

/**
 * A reusable button component that supports custom styles, touchable opacity effects,
 * and optional child components or labels.
 *
 * @component
 * @param {ButtonComponentProps} props - The props for the ButtonComponent.
 * @param {string} props.label - The text label to display inside the button. Optional.
 * @param {React.FC | undefined} props.Children - A React functional component to render as a child inside the button. Optional.
 * @param {boolean} props.touchableOpacity - Determines if the button should have a touchable opacity effect when pressed.
 * @param {() => void} props.handlePress - The callback function to execute when the button is pressed.
 * @param {ReplaceStyles | undefined} props.replaceStyles - Custom styles to completely replace the default styles of the button and text. Optional.
 * @param {CustomStyles | undefined} props.customStyles - Additional custom styles to merge with the default styles of the button and text. Optional.
 *
 * @returns {JSX.Element} A styled button component with optional label and child components.
 */
const ButtonComponent: React.FC<ButtonComponentProps> = ({
  label,
  children,
  touchableOpacity,
  handlePress,
  replaceStyles,
  customStyles,
}) => {
  const styles = useStylesButtonComponent();

  return (
    <Pressable
      style={({ pressed }) => {
        const opacity = { opacity: pressed && touchableOpacity ? 0.7 : 1 };

        if (replaceStyles) return [replaceStyles.button, opacity];
        return [styles.button, opacity, customStyles?.button];
      }}
      onPress={handlePress}
    >
      {label !== undefined && (
        <Text
          style={
            replaceStyles
              ? replaceStyles.textButton
              : [styles.textButton, customStyles?.textButton]
          }
        >
          {label}
        </Text>
      )}
      {children}
    </Pressable>
  );
};

export default ButtonComponent;
