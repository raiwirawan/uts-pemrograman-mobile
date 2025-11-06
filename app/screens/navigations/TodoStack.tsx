// screens/todo/TodoStack.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationIndependentTree } from "@react-navigation/native";

import TodoListScreen from "../todo/TodoListScreen";
import AddTodoScreen from "../todo/AddTodoScreen";

const Stack = createNativeStackNavigator();

export default function TodoStack() {
  return (
    // 👇 Pembungkus ini membuat navigasi kamu berdiri sendiri,
    // jadi tidak bentrok dengan NavigationContainer utama milik tim lain
    <NavigationIndependentTree>
      <Stack.Navigator>
        <Stack.Screen
          name="TodoList"
          component={TodoListScreen}
          options={{ title: "Daftar To-Do" }}
        />
        <Stack.Screen
          name="AddTodo"
          component={AddTodoScreen}
          options={{ title: "Tambah To-Do" }}
        />
      </Stack.Navigator>
    </NavigationIndependentTree>
  );
}
