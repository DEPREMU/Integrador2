import { RootStackParamList } from "./navigationTypes";
import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const navigate = (
  name: keyof RootStackParamList,
  params?: undefined,
) => {
  if (!navigationRef.isReady()) return;
  navigationRef.navigate(name, params);
};
