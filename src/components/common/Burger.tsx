import Animated, {
  withTiming,
  useAnimatedStyle,
} from "react-native-reanimated";
import React from "react";
import ButtonComponent from "@components/common/Button";
import { useStylesBurger } from "@styles/components/stylesBurgerComponent";
import { View, Pressable } from "react-native";

type typeBurger = {
  toggleMenu: () => void;
  burgerComponent: React.JSX.Element;
};

/**
 * Custom hook to manage the state and animation of a burger (hamburger) menu button.
 *
 * @returns An object containing:
 *   - `toggleMenu`: Function to toggle the menu open/closed state.
 *   - `burgerComponent`: JSX element representing the animated burger button and overlay.
 *
 * @remarks
 * This hook handles the animation of the burger icon lines using `useAnimatedStyle` and `withTiming`.
 * It also manages the overlay that appears when the menu is open, and triggers the provided `open` and `close` callbacks.
 */
const useBurger = (): typeBurger => {
  const { styles, widthLine } = useStylesBurger();
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsOpen((prev) => {
      return !prev;
    });
  };

  const line1Style = useAnimatedStyle(() => ({
    top: withTiming(isOpen ? 18 : 0),
    width: withTiming(isOpen ? 0 : widthLine),
    left: withTiming(isOpen ? 27.5 : 0),
  }));

  const line2Style = useAnimatedStyle(() => ({
    transform: [{ rotateZ: withTiming(isOpen ? "45deg" : "0deg") }],
  }));

  const line3Style = useAnimatedStyle(() => ({
    transform: [{ rotateZ: withTiming(isOpen ? "-45deg" : "0deg") }],
  }));

  const line4Style = useAnimatedStyle(() => ({
    top: withTiming(isOpen ? 18 : 36),
    width: withTiming(isOpen ? 0 : widthLine),
    left: withTiming(isOpen ? 27.5 : 0),
  }));

  return {
    toggleMenu,
    burgerComponent: (
      <>
        {isOpen && <Pressable style={styles.overlay} onPress={toggleMenu} />}

        <ButtonComponent
          forceReplaceStyles
          handlePress={toggleMenu}
          replaceStyles={{ button: styles.button, textButton: {} }}
          children={
            <View style={styles.iconContainer}>
              <Animated.View style={[styles.line, line1Style]} />
              <Animated.View style={[styles.line, styles.top18, line2Style]} />
              <Animated.View style={[styles.line, styles.top18, line3Style]} />
              <Animated.View style={[styles.line, line4Style]} />
            </View>
          }
        />
      </>
    ),
  };
};

export default useBurger;
