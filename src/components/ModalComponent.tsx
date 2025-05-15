import { useResponsiveLayout } from "@/context/LayoutContext";
import { useStylesModalComponent } from "@/styles/components/stylesModalComponent";
import React, { useEffect } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  AnimatableValue,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface ModalProps {
  title: string;
  body: React.ReactNode;
  buttons: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  hideModal: boolean;
  setHideModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const ModalComponent: React.FC<ModalProps> = ({
  title,
  body,
  buttons,
  isOpen,
  onClose,
  hideModal,
  setHideModal,
}) => {
  const position: SharedValue<number> = useSharedValue(0);
  const styles = useStylesModalComponent();
  const { height } = useResponsiveLayout();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: position.value }],
  }));

  useEffect(() => {
    const options = { duration: 500 };

    if (isOpen) {
      setHideModal(false);
      position.value = withTiming(0, options);
    } else {
      setTimeout(() => {
        setHideModal(true);
      }, 750);
      position.value = withTiming(height + 200, options);
    }
  }, [isOpen]);

  return (
    <Animated.View
      style={[
        styles.overlay,
        animatedStyle,
        { display: hideModal ? "none" : "flex" },
      ]}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modal}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.body}>{body}</View>
          <View style={styles.buttons}>{buttons}</View>
        </Pressable>
      </Pressable>
    </Animated.View>
  );
};

export default ModalComponent;
