import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

interface AddTodoButtonProps {
  onPress: () => void;
}

const AddTodoButton: React.FC<AddTodoButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.fabContainer} onPress={onPress}>
      <View style={styles.fab}>
        <Text style={styles.fabText}>+</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    bottom: 30,
    right: 30,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  fabText: { color: "#fff", fontSize: 32, fontWeight: "bold" },
});

export default AddTodoButton;
