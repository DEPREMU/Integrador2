import React from "react";
import {
  View,
  StyleSheet,
  GestureResponderEvent,
  TouchableWithoutFeedback,
} from "react-native";
import ButtonComponent from "@components/Button";

interface MenuProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (option: string) => void;
}

const Menu: React.FC<MenuProps> = ({ visible, onClose, onSelect }) => {
  if (!visible) return null;

  const handlePress = (option: string) => (event: GestureResponderEvent) => {
    onSelect(option);
    onClose();
  };

  return (
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={StyleSheet.absoluteFill}>
        <TouchableWithoutFeedback>
          <View style={styles.menu}>
            <ButtonComponent
              handlePress={() => handlePress("Perfil")}
              label="Perfil"
              touchableOpacity
              replaceStyles={styles}
            />
            <ButtonComponent
              handlePress={() => handlePress("Cerrar sesión")}
              replaceStyles={styles}
              touchableOpacity
              label="Cerrar"
            />
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Menu;

const styles = StyleSheet.create({
  menu: {
    position: "absolute",
    top: 55,
    left: 40,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingVertical: 5,
    width: 150,
    zIndex: 1000,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  textButton: {
    fontSize: 16,
    color: "#333",
  },
});
