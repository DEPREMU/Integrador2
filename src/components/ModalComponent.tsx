import Animated, {
  withTiming,
  SharedValue,
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import React, { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { useStylesModalComponent } from "@styles/components/stylesModalComponent";

interface ModalProps {
  title: string;
  body: React.ReactNode;
  buttons: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  hideModal: boolean;
  setHideModal: React.Dispatch<React.SetStateAction<boolean>>;
  customStyles?: Record<
    "overlay" | "modal" | "title" | "body" | "buttons",
    object | undefined
  >;
}

/**
 * ModalComponent is a reusable modal component that displays a title, body content, and buttons.
 * It uses React Native Reanimated for smooth animations and transitions.
 *
 * @param {string} title - The title of the modal.
 * @param {React.ReactNode} body - The body content of the modal.
 * @param {React.ReactNode} buttons - The buttons to be displayed in the modal.
 * @param {boolean} isOpen - A boolean indicating whether the modal is open or closed.
 * @param {function} onClose - A function to be called when the modal is closed.
 * @param {boolean} hideModal - A boolean indicating whether to hide the modal.
 * @param {function} setHideModal - A function to set the hideModal state.
 */
const ModalComponent: React.FC<ModalProps> = ({
  title,
  body,
  buttons,
  isOpen,
  onClose,
  hideModal,
  setHideModal,
  customStyles,
}) => {
  const position: SharedValue<number> = useSharedValue(0);
  const { styles, height } = useStylesModalComponent();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: position.value }],
  }));

  useEffect(() => {
    const options = { duration: 500 };

    if (isOpen) {
      setHideModal(false);
      position.value = withTiming(0, options);
    } else {
      setTimeout(() => setHideModal(true), 750);
      position.value = withTiming(height + 200, options);
    }
  }, [isOpen]);

  return (
    <Animated.View
      style={[
        styles.overlay,
        animatedStyle,
        { display: hideModal ? "none" : "flex" },
        customStyles?.overlay,
      ]}
    >
      <Pressable
        style={[styles.overlay, customStyles?.overlay]}
        onPress={onClose}
      >
        <Pressable style={[styles.modal, customStyles?.modal]}>
          <Text style={[styles.title, customStyles?.title]}>{title}</Text>
          {body !== null && (
            <View style={[styles.body, customStyles?.body]}>{body}</View>
          )}
          {buttons !== null && (
            <View style={[styles.buttons, customStyles?.buttons]}>
              {buttons}
            </View>
          )}
        </Pressable>
      </Pressable>
    </Animated.View>
  );
};

export default ModalComponent;
