import Animated, {
  withTiming,
  SharedValue,
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import React, { useEffect } from "react";
import { useResponsiveLayout } from "@/context/LayoutContext";
import { Pressable, Text, View } from "react-native";
import { useStylesModalComponent } from "@/styles/components/stylesModalComponent";

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
          {body !== null && <View style={styles.body}>{body}</View>}
          {buttons !== null && <View style={styles.buttons}>{buttons}</View>}
        </Pressable>
      </Pressable>
    </Animated.View>
  );
};

export default ModalComponent;
