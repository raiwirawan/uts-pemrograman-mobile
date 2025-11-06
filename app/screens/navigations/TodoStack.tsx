import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TodoListScreen from "../todo/TodoListScreen";
import AddTodoScreen from "../todo/AddTodoScreen";

export type TodoStackParamList = {
  TodoList: undefined;
  AddTodo: undefined;
};

const Stack = createNativeStackNavigator<TodoStackParamList>();

export default function TodoStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TodoList"
        component={TodoListScreen}
        options={{ headerShown: false }} // HILANGKAN HEADER
      />
      <Stack.Screen
        name="AddTodo"
        component={AddTodoScreen}
        options={{ headerShown: false }} // HILANGKAN HEADER
      />
    </Stack.Navigator>
  );
}
