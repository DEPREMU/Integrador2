import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
} from "react-native";

interface MenuProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (option: string) => void;
}

const Menu: React.FC<MenuProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  if (!visible) return null;

  const handlePress =
    (option: string) => (event: GestureResponderEvent) => {
      onSelect(option);
      onClose();
    };

  return (
    <View style={styles.menu}>
      <TouchableOpacity onPress={handlePress("Perfil")} style={styles.menuItem}>
        <Text style={styles.menuText}>Perfil</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handlePress("Cerrar sesión")} style={styles.menuItem}>
        <Text style={styles.menuText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
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
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  menuText: {
    fontSize: 16,
    color: "#333",
  },
});
