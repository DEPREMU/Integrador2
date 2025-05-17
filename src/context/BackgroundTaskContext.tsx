import {
  RootStackParamList,
  ScreensAvailable,
} from "@navigation/navigationTypes";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { createContext, useContext, useEffect, useState } from "react";

type BackgroundTask = () => Promise<void> | void;

interface BackgroundTaskContextType {
  runTask: (task: BackgroundTask) => void;
  addTaskQueue: (task: BackgroundTask) => void;
  updateScreen: (screen: ScreensAvailable, force?: boolean) => void;
  getCurrentRouteName: () => ScreensAvailable;
}

const BackgroundTaskContext = createContext<BackgroundTaskContextType | null>(
  null
);

/**
 * A React context provider component for managing background tasks.
 *
 * This provider maintains a queue of background tasks and ensures they are executed
 * sequentially. It provides methods to add tasks to the queue and to run tasks directly.
 *
 * @param children - The child components that will have access to the context.
 *
 * @returns A context provider that supplies the `runTask` and `addTaskQueue` methods.
 *
 * @remarks
 * - The `tasksQueue` state holds the queue of background tasks.
 * - The `addTaskQueue` function adds a new task to the queue.
 * - The `runTask` function executes a given task immediately.
 * - The `useEffect` hook monitors the `tasksQueue` and ensures tasks are executed
 *   sequentially, removing each task from the queue after execution.
 *
 * @example
 * ```tsx
 * const { addTaskQueue } = useContext(BackgroundTaskContext);
 *
 * addTaskQueue(() => {
 *   console.log("Task 1 executed");
 * });
 * ```
 *
 * Practical example:
 * ```tsx
 * const { addTaskQueue } = useContext(BackgroundTaskContext);
 * const updateDB = async () => {
 * // This function will be executed in the background
 * // This is good for updating a database or making an API call
 * // without blocking the main thread. And avoiding the cancellation of the task
 * // if the user closes the app or navigates to another screen.
 * await fetch("https://example.com/api/update", {
 *  method: "POST",
 *  body: JSON.stringify({ data: "new data" }),
 *  headers: {
 *      "Content-Type": "application/json",
 *  },
 *  });
 *  console.log("Database updated");
 * };
 *
 * addTaskQueue(updateDB);
 * ```
 *
 */
export const BackgroundTaskProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [tasksQueue, setTasksQueue] = useState<BackgroundTask[]>([]);
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  /**
   * Retrieves the name of the current route from the navigation state.
   *
   * @returns {ScreensAvailable} The name of the current route as a `ScreensAvailable` type.
   */
  const getCurrentRouteName = () =>
    useNavigationState((state) => {
      const route = state.routes[state.index];
      return route.name as ScreensAvailable;
    });

  /**
   * Adds a new background task to the task queue.
   *
   * @param task - The background task to be added to the queue.
   */
  const addTaskQueue = (task: BackgroundTask) => {
    setTasksQueue((prev) => [...prev, task]);
  };
  /**
   * Runs a given task immediately.
   *
   * @param task - The task to run.
   *
   * @remarks
   * - This function executes the task immediately, without adding it to the queue.
   * - It is useful for tasks that need to be executed right away, rather than waiting for the queue.
   *
   * @example
   * ```tsx
   * const { runTask } = useContext(BackgroundTaskContext);
   * runTask(() => {
   *  console.log("Task executed immediately");
   * });
   * ```
   *
   * Practical example:
   * ```tsx
   * const { runTask } = useContext(BackgroundTaskContext);
   * const updateDB = async () => {
   * // This function will be executed immediately
   * // This is good for updating a database or making an API call
   * // without blocking the main thread. And avoiding the cancellation of the task
   * // if the user closes the app or navigates to another screen.
   * await fetch("https://example.com/api/update", {
   *  method: "POST",
   * body: JSON.stringify({ data: "new data" }),
   * headers: {
   *     "Content-Type": "application/json",
   * },
   * });
   * console.log("Database updated");
   * };
   *
   * runTask(updateDB);
   * ```
   *
   */
  const runTask = (task: BackgroundTask) => task();
  /**
   * Updates the current screen in the navigation stack.
   *
   * @param screen - The screen to navigate to.
   * @param force - If true, replaces the current screen regardless of the current route.
   *
   * @remarks
   * - If `force` is true, the current screen is replaced with the specified screen.
   * - If `force` is false and the specified screen is the current screen, it is replaced.
   * - If `force` is false and the specified screen is not the current screen, a message is logged.
   *
   * @example
   * ```tsx
   * updateScreen("Home");
   * ```
   *
   * Practical example:
   * ```tsx
   * const { updateScreen, addTaskQueue, getCurrentRouteName } = useContext(BackgroundTaskContext);
   * const updateDB = async () => {
   * // Simulate a background task
   * // After the task is done, update the screen
   * // This is just in case the data on the screen must be updated
   * updateScreen(getCurrentRouteName());
   * };
   *
   * addTaskQueue(updateDB);
   * ```
   */
  const updateScreen = (screen: ScreensAvailable, force?: boolean) => {
    const currentRouteName = getCurrentRouteName();

    if (force) {
      navigation.replace(screen);
    } else if (currentRouteName === screen) {
      navigation.replace(screen);
    } else {
      console.log("The screen given is not the current screen");
    }
  };

  useEffect(() => {
    if (tasksQueue.length === 0) return;

    setTasksQueue((prev) => {
      const firstTask = prev[0];
      firstTask();
      return prev.slice(1);
    });
  }, [tasksQueue]);

  return (
    <BackgroundTaskContext.Provider
      value={{ runTask, addTaskQueue, updateScreen, getCurrentRouteName }}
    >
      {children}
    </BackgroundTaskContext.Provider>
  );
};

export const useBackgroundTask = () => {
  const ctx = useContext(BackgroundTaskContext);
  if (!ctx)
    throw new Error(
      "useBackgroundTask debe usarse dentro de BackgroundTaskProvider"
    );
  return ctx;
};
