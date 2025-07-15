import React from "react";
import { View, Text } from "react-native";
import { useStylesCardComponent } from "@styles/components/stylesCardComponent";

interface CardProps {
  /**
   * Title text to display in the card.
   * @type {string}
   */
  title: string;

  /**
   * Description text to display below the title.
   * @type {string}
   */
  description: string;
}

/**
 * Card component that displays a title, description, and optionally an image.
 *
 * @param {CardProps} props - The props for the Card component.
 * @param {string} props.title - The title text.
 * @param {string} props.description - The description text.
 * @returns {JSX.Element} A styled card component.
 *
 * @example
 * <Card
 *   title="Welcome"
 *   description="This is a sample card description."
 * />
 */
const CardComponent: React.FC<CardProps> = ({ title, description }) => {
  const styles = useStylesCardComponent();

  return (
    <View style={styles.card}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
};

export default CardComponent;
