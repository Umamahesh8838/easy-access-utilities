import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import { v4 as uuidv4 } from "uuid";

export interface Task {
  id: string;
  text: string;
  completed: boolean;
}

export type Filter = "all" | "active" | "completed";

interface TodoState {
  tasks: Task[];
  filter: Filter;
  accentColor: string;
  addTask: (text: string) => void;
  editTask: (id: string, text: string) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  reorderTasks: (startIndex: number, endIndex: number) => void;
  setFilter: (filter: Filter) => void;
  setAccentColor: (color: string) => void;
  clearCompleted: () => void;
}

const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      tasks: [],
      filter: "all",
      accentColor: "#3b82f6", // Default blue
      addTask: (text: string) => {
        if (!text.trim()) return;
        const newTask: Task = { id: uuidv4(), text, completed: false };
        set({ tasks: [...get().tasks, newTask] });
      },
      editTask: (id: string, text: string) => {
        set({
          tasks: get().tasks.map((task) =>
            task.id === id ? { ...task, text } : task
          ),
        });
      },
      deleteTask: (id: string) => {
        set({ tasks: get().tasks.filter((task) => task.id !== id) });
      },
      toggleTask: (id: string) => {
        set({
          tasks: get().tasks.map((task) =>
            task.id === id ? { ...task, completed: !task.completed } : task
          ),
        });
      },
      reorderTasks: (startIndex: number, endIndex: number) => {
        const result = Array.from(get().tasks);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        set({ tasks: result });
      },
      setFilter: (filter: Filter) => {
        set({ filter });
      },
      setAccentColor: (color: string) => {
        set({ accentColor: color });
      },
      clearCompleted: () => {
        set({ tasks: get().tasks.filter((task) => !task.completed) });
      },
    }),
    {
      name: "todo-list-storage",
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const str = Cookies.get(name);
          if (!str) return null;
          return JSON.parse(str);
        },
        setItem: (name, value) => {
          Cookies.set(name, JSON.stringify(value), { expires: 30 });
        },
        removeItem: (name) => {
          Cookies.remove(name);
        },
      })),
    }
  )
);

export default useTodoStore;
