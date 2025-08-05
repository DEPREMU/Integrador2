
// This file is auto-generated. Do not edit it manually if it's not necessary.
// Generated on 2025-08-05T04:15:38.985Z
import { Platform } from "react-native";
const isDev = process.env.NODE_ENV === "development";
export const API_URL = !isDev
  ? "http://141.148.162.194:8080/api/v1"
  : Platform.OS === "web"
    ? "http://localhost:8080/api/v1"
    : "http://192.168.1.70:8080/api/v1";
export const URL_WEB_SOCKET = !isDev
  ? "ws://141.148.162.194:8080"
  : Platform.OS === "web"
    ? "ws://localhost:8080/"
    : "ws://192.168.1.70:8080/";
