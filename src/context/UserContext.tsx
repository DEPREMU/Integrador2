import {
  saveDataSecure,
  loadData,
  saveData,
} from "../utils/functions/storageManagement";
import { KEYS_STORAGE } from "../utils/constants/keysStorage";
import { reasonNotification, ReasonNotification } from "../utils/constants/notifications";

import { log, logError, getRouteAPI, fetchOptions, checkLanguage, hasPushNotifications, handleCancelNotification } from "../utils/functions";
import { supabase } from "../utils/supabase";
import { stringifyData } from "../utils/functions/appManagement";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  User,
  ResponseAuth,
  TypeBodyLogin,
  TypeBodySignup,
  TypeBodyUpdateUserData,
  ResponseUpdateUserData,
} from "@typesAPI";
import { Notifications, UserSession } from "@types";
import { UserData } from "../types/TypesUser";
import React, { createContext, useState, useEffect, useCallback } from "react";

type UserContextType = {
  userSession: UserSession | null;
  userData: UserData | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
    callback?: (session: UserSession | null, err?: Error) => void,
  ) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    callback?: (err?: Error) => void,
  ) => Promise<void>;
  logout: (callback?: (message: string) => void) => Promise<void>;
  setUserSession: React.Dispatch<React.SetStateAction<UserSession | null>>;
  refreshToken: (refreshToken: string) => Promise<void>;
  updateUserData: (
    userData: UserData,
    callback?: (success: boolean, error?: Error) => void,
  ) => Promise<void | undefined>;
};

interface UserProviderProps {
  children: React.ReactNode;
}

const UserContext = createContext<UserContextType | null>(null);

/**
 * Saves the user session data securely and sets the session expiry date.
 *
 * @param session - The user session object to be saved.
 * @param rememberMe - If true, sets the session expiry to 15 days from now; otherwise, sets expiry to 0.
 * @returns A promise that resolves when the session data and expiry date have been saved.
 */
const saveSession = async (
  session: UserSession,
  rememberMe: boolean,
  keepOldExpiry: boolean = false,
): Promise<void> => {
  const newSession: UserSession = {
    ...session,
    user: {
      ...session.user,
      identities: null,
    },
  };
  await saveDataSecure(KEYS_STORAGE.USER_SESSION_STORAGE, newSession);

  if (keepOldExpiry) return;

  const expiryDate = rememberMe
    ? new Date().getTime() + 15 * 24 * 60 * 60 * 1000
    : -1;
  await saveDataSecure(KEYS_STORAGE.SESSION_EXPIRY, expiryDate.toString());
};

/**
 * Retrieves the current user session if it exists and is not expired.
 *
 * This function checks the session expiry date stored securely. If the session has expired
 * or does not exist, it clears the session and returns a default user object with null tokens and uuid.
 * Otherwise, it loads and returns the user session data.
 *
 * @returns {Promise<User>} A promise that resolves to the current user session, or a default user object if no valid session exists.
 */
const getSession = async (): Promise<UserSession | null> => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      // Web
      const session = window.localStorage.getItem("userSession");
      return session ? JSON.parse(session) : null;
    } else {
      // React Native
      const session = await AsyncStorage.getItem("userSession");
      return session ? JSON.parse(session) : null;
    }
  } catch {
    return null;
  }
};

/**
 * Asynchronously clears the user session data from secure storage.
 *
 * This function removes both the user session information and its expiry data
 * from the secure storage, effectively logging the user out.
 *
 * @returns {Promise<void>} A promise that resolves when the session data has been cleared.
 */
const clearSession = async (): Promise<void> => {
  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.removeItem("userSession");
  } else {
    await AsyncStorage.removeItem("userSession");
  }
};

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [updatedInfo, setUpdatedInfo] = useState<boolean>(false);
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  const refreshToken = useCallback(async (refresh_token: string) => {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });
    const session = data?.session as unknown as UserSession;

    if (error || !session) {
      logError("Error while updating the access_token", error?.message);
      await clearSession();
      return;
    }
    await saveSession(session, false, true);
  }, []);

  // signUp compatible con web: async normal, sin genéricos ni useCallback
  async function signUp(
    email: string,
    password: string,
    callback: (err?: Error) => void = (_) => null
  ) {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) return callback?.(new Error(error.message));
    const [language, pushNotifications] = await Promise.all([
      checkLanguage(),
      hasPushNotifications(),
    ]);
    let userData: any = null;
    try {
      const res = await fetch(
        getRouteAPI("/signup"),
        fetchOptions("POST", {
          userId: data.session?.user?.id || "",
          role: "caregiver",
          userConfig: {
            userId: data.session?.user?.id || "",
            language,
            pushNotifications,
          },
          createdAt: new Date().toISOString(),
          imageId: "",
          description: "",
          name: "",
          phone: "",
        })
      );
      userData = await res.json();
    } catch (err: any) {
      logError("Error during sign up", err?.message || String(err));
      return callback?.(new Error(err?.message || String(err)));
    }
    if (userData?.error) {
      logError("Error during sign up", userData.error.message);
      return callback?.(new Error(userData.error.message));
    }
    const u = userData.data?.user;
    setUserData(u ? {
      id: u.userId || "",
      email: "",
      name: u.name || "",
      surname: "",
      phone: u.phone || "",
      address: "",
      birthdate: ""
    } : null);
    return callback?.();
  }
  // (Eliminada declaración duplicada de logout y contextValue, solo queda la versión final al final del archivo)

  const login = useCallback(
    async (
      email: string,
      password: string,
      rememberMe: boolean = false,
      callback?: (session: UserSession | null, err?: Error) => void
    ): Promise<void> => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return callback?.(null, new Error(error.message));

      const session = data?.session as unknown as UserSession;
      if (!session)
        return callback?.(null, new Error("No session data received"));

      // Guardar sesión persistente
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("userSession", JSON.stringify(session));
      } else {
        await AsyncStorage.setItem("userSession", JSON.stringify(session));
      }

      const [language, pushNotifications] = await Promise.all([
        checkLanguage(),
        hasPushNotifications(),
      ]);
      const uuid = session?.user?.id;
      log("LOGIN FETCH", {
        endpoint: getRouteAPI("/login"),
        uuid,
        language,
        pushNotifications,
        body: {
          uuid,
          language,
          pushNotifications,
        }
      });
      // Mostrar el uuid en consola y pantalla solo una vez
        // ...eliminado para producción
      // Fetch user data y validar respuesta
      let userData: ResponseAuth | null = null;
      let rawText = "";
      try {
        const response = await fetch(
          getRouteAPI("/login"),
          fetchOptions<TypeBodyLogin>("POST", {
            uuid: session?.user?.id,
            language,
            pushNotifications,
          }),
        );
        rawText = await response.text();
        // Si la respuesta parece HTML, mostrar error y no actualizar estado
        if (rawText.trim().startsWith("<")) {
          logError("Error: El backend devolvió HTML en vez de JSON", rawText);
          setUserData(null);
          setIsLoggedIn(false);
          return callback?.(null, new Error("El backend devolvió HTML en vez de JSON"));
        }
        userData = JSON.parse(rawText);
      } catch (err) {
        logError("Error parsing user data en login", String(err));
        setUserData(null);
        setIsLoggedIn(false);
        return callback?.(null, new Error("Respuesta inválida del backend"));
      }
      setIsLoggedIn(true);
      setUserSession(session);
      const u = userData?.data?.user;
      console.log("Datos recibidos de backend en login:", u);
      setUserData(u ? {
        id: u.userId || "",
        email: "",
        name: u.name || "",
        surname: "",
        phone: u.phone || "",
        address: "",
        birthdate: ""
      } : null);
      return callback?.(session);
    },
    [],
  );

  const logout = useCallback(
    async (callback?: (message: string) => void) => {
      if (!userSession || !isLoggedIn)
        return callback?.("No user session to log out");

      const [, , notificationsData] = await Promise.all([
        supabase.auth.signOut(),
        clearSession(),
        loadData<Notifications>(KEYS_STORAGE.NOTIFICATIONS_STORAGE),
      ]);
      reasonNotification.forEach(async (reason: string) => {
        if (!notificationsData[reason as ReasonNotification]) return;
        notificationsData[reason as ReasonNotification] = null;
        await handleCancelNotification(notificationsData, reason as ReasonNotification);
      });
      setUserData(null);
      setIsLoggedIn(false);
      setUserSession(null);
      log("User logged out successfully");
      callback?.("User logged out successfully");
      await saveData(
        KEYS_STORAGE.NOTIFICATIONS_STORAGE,
        stringifyData(notificationsData),
      );
    },
    [isLoggedIn, userSession],
  );

  const updateUserData = useCallback(
    async (
      newData?: { [key: string]: unknown },
      callback?: (success: boolean, error?: Error) => void,
    ) => {
      if (!userData || !newData)
        return callback?.(false, new Error("No user data to update"));
      const res: ResponseUpdateUserData = await fetch(
        getRouteAPI("/updateUserData"),
        fetchOptions<TypeBodyUpdateUserData>("POST", {
          userId: userData.id || "",
          userData: (newData as User) || {},
        }),
      )
        .then((res) => res.json())
        .catch((error) => {
          logError("Error updating user data", error.message);
          return {
            success: false,
            user: null,
            error: {
              message: error.message,
              timestamp: new Date().toISOString(),
            },
          };
        });

      if (res.error || !res.success) {
        logError(
          "Error updating user data",
          res.error?.message || "Unknown error",
        );
        return callback?.(
          false,
          new Error(res.error?.message || "Unknown error"),
        );
      }
      const u = res.user;
      setUserData(u ? {
        id: u.userId || userData.id || "",
        email: userData.email || "",
        name: u.name || userData.name || "",
        surname: userData.surname || "",
        phone: u.phone || userData.phone || "",
        address: userData.address || "",
        birthdate: userData.birthdate || ""
      } : userData);
      setUpdatedInfo(true);
      log("User data updated successfully");
      return callback?.(true);
    },
    [userData],
  );

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (!session || !session?.access_token || !session?.user?.id) return;
      setIsLoggedIn(true);
      setUserSession(session);
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (!userSession || !userSession.user?.id) return;

    const getUserData = async () => {
      const [language, pushNotifications] = await Promise.all([
        checkLanguage(),
        hasPushNotifications(),
      ]);

      const response = await fetch(
        getRouteAPI("/login"),
        fetchOptions<TypeBodyLogin>("POST", {
          uuid: userSession.user.id,
          language,
          pushNotifications,
        }),
      );
      const rawText = await response.text();
      console.log("Raw response from /login:", rawText);
      let data, error;
      try {
        const parsed = JSON.parse(rawText);
        data = parsed.data;
        error = parsed.error;
      } catch (err) {
        logError("Error parsing user data response", String(err));
        setLoading(false);
        data = null;
        error = { message: "Invalid JSON response", raw: rawText };
      }

      setUpdatedInfo(true);
      if (error || !data) {
        logError("Error fetching user data", error?.message);
        setUserData(null);
      } else {
        const u = data.user;
        console.log("Datos recibidos de backend en useEffect:", u);
        setUserData(u ? {
          id: u.userId || "",
          email: "",
          name: u.name || "",
          surname: "",
          phone: u.phone || "",
          address: "",
          birthdate: ""
        } : null);
        setUpdatedInfo(true);
        setLoading(false);
      }
    };

    getUserData();
  }, [userSession]);

  useEffect(() => {
    if (!userSession || !userData || !isLoggedIn || updatedInfo) return;
    if (userSession.user?.id !== userData.id) return;

    updateUserData(userData);
  }, [userSession, userData, updatedInfo, isLoggedIn, updateUserData]);

  const contextValue = {
    signUp,
    loading,
    isLoggedIn,
    userSession,
    updateUserData,
    setUserSession,
    refreshToken,
    userData,
    logout,
    login,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
