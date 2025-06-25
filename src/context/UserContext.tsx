import {
  supabase,
  logError,
  KEYS_STORAGE,
  loadDataSecure,
  saveDataSecure,
  removeDataSecure,
  getRouteAPI,
  fetchOptions,
  checkLanguage,
  hasPushNotifications,
  log,
} from "@utils";
import { UserSession } from "@types";
import React, { createContext, useState, useEffect } from "react";
import {
  User,
  ResponseLogin,
  TypeBodyLogin,
  TypeBodySignup,
  TypeBodyUpdateUserData,
  ResponseUpdateUserData,
} from "@typesAPI";

type UserContextType = {
  userSession: UserSession | null;
  userData: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: <T = void>(
    email: string,
    password: string,
    rememberMe?: boolean,
    callback?: (session: UserSession | null, err?: Error) => T
  ) => Promise<T>;
  signUp: <T = void>(
    email: string,
    password: string,
    callback?: (err?: Error) => T
  ) => Promise<T>;
  logout: (callback?: (message: string) => void) => Promise<void>;
  setUserSession: React.Dispatch<React.SetStateAction<UserSession | null>>;
  refreshToken: (refreshToken: string) => Promise<void>;
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
  keepOldExpiry: boolean = false
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
    : 0;
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
  const expiryDate = await loadDataSecure<number>(KEYS_STORAGE.SESSION_EXPIRY);

  if (!expiryDate || new Date().getTime() > expiryDate) {
    await clearSession();
    return null;
  }

  const session = await loadDataSecure<UserSession>(
    KEYS_STORAGE.USER_SESSION_STORAGE
  );
  if (session) return session;

  return null;
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
  await removeDataSecure(KEYS_STORAGE.USER_SESSION_STORAGE);
  await removeDataSecure(KEYS_STORAGE.SESSION_EXPIRY);
};

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();

      if (!session || !session?.access_token || !session?.user?.id)
        return false;

      setIsLoggedIn(true);
      setUserSession(session);
      return false;
    };
    const getUserData = async () => {
      if (!userSession || !userSession.user?.id) {
        setUserData(null);
        return;
      }

      const [language, pushNotifications] = await Promise.all([
        checkLanguage(),
        hasPushNotifications(),
      ]);

      const { data, error }: ResponseLogin = await fetch(
        getRouteAPI("/login"),
        fetchOptions<TypeBodyLogin>("POST", {
          uuid: userSession.user.id,
          language,
          pushNotifications,
        })
      )
        .then((res) => res.json())
        .catch((error) => {
          logError("Error fetching user data", error.message);
          setLoading(false);
          return {
            data: null,
            error: {
              message: error.message,
              timestamp: new Date().toISOString(),
            },
          };
        });

      if (error) {
        logError("Error fetching user data", error.message);
        setUserData(null);
      } else {
        setUserData(data?.user || null);
        setLoading(false);
      }
    };

    checkSession()
      .then(getUserData)
      .catch((error) => {
        logError("Error checking session", error.message);
        setLoading(false);
      });
  }, []);

  const refreshToken = async (refresh_token: string) => {
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
  };

  const signUp = async <T = void,>(
    email: string,
    password: string,
    callback: (err?: Error) => T = (_) => null as T
  ) => {
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return callback?.(new Error(error.message));

    const [language, pushNotifications] = await Promise.all([
      checkLanguage(),
      hasPushNotifications(),
    ]);

    const userData = (await fetch(
      getRouteAPI("/signup"),
      fetchOptions<TypeBodySignup>("POST", {
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
    )
      .then((res) => {
        log("User signed up successfully", res);
        return res.json();
      })
      .catch((err) => {
        logError("Error during sign up", err.message);
        return {
          data: null,
          error: {
            message: err.message,
            timestamp: new Date().toISOString(),
          },
        };
      })) as ResponseLogin;

    if (userData.error) {
      logError("Error during sign up", userData.error.message);
      return callback?.(new Error(userData.error.message));
    }
    setUserData(userData.data?.user || null);

    return callback?.();
  };

  const login = async <T = void,>(
    email: string,
    password: string,
    rememberMe: boolean = false,
    callback: (session: UserSession | null, err?: Error) => T = (_, __) =>
      null as T
  ) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return callback?.(null, new Error(error.message));

    const session = data?.session as unknown as UserSession;
    if (!session)
      return callback?.(null, new Error("No session data received"));

    await saveSession(session, rememberMe);
    const [language, pushNotifications] = await Promise.all([
      checkLanguage(),
      hasPushNotifications(),
    ]);
    const userData = (await fetch(
      getRouteAPI("/login"),
      fetchOptions<TypeBodyLogin>("POST", {
        uuid: session?.user?.id,
        language,
        pushNotifications,
      })
    )
      .then((res) => res.json())
      .catch((error) => {
        logError("Error fetching user data on login", error.message);
        return {
          data: null,
          error: {
            message: error.message,
            timestamp: new Date().toISOString(),
          },
        };
      })) as ResponseLogin;

    setIsLoggedIn(true);
    setUserSession(session);

    setUserData(userData.data?.user || null);
    return callback?.(session);
  };

  const logout = async (callback?: (message: string) => void) => {
    if (!userSession || !isLoggedIn)
      return callback?.("No user session to log out");

    await Promise.all([supabase.auth.signOut(), clearSession()]);
    setUserData(null);
    setIsLoggedIn(false);
    setUserSession(null);
    log("User logged out successfully");
    callback?.("User logged out successfully");
  };

  const contextValue = {
    signUp,
    loading,
    isLoggedIn,
    userSession,
    setUserSession,
    refreshToken,
    userData,
    logout,
    login,
  };

  useEffect(() => {
    log("UserContext initialized", {
      userSession,
      userData,
      isLoggedIn,
    });
    if (!userSession || !userData || !isLoggedIn) return;
    const updateUserData = async () => {
      const [language, pushNotifications] = await Promise.all([
        checkLanguage(),
        hasPushNotifications(),
      ]);

      const { success, user, error } = (await fetch(
        getRouteAPI("/updateUserData"),
        fetchOptions<TypeBodyUpdateUserData>("POST", {
          userId: userSession.user.id,
          userData: {
            userId: userSession.user.id,
            role: userData.role || "caregiver",
            name: userData.name || "",
            phone: userData.phone || "",
            imageId: userData.imageId || "",
            createdAt: new Date().toISOString(),
            description: userData.description || "",
            caregiverId: userData?.caregiverId || undefined,
            patientUserIds: userData?.patientUserIds || [],
            medicationIds: userData?.medicationIds || [],
          },
        })
      )
        .then((res) => res.json())
        .catch((error) => {
          logError("Error updating user data", error.message);
          return {
            data: null,
            error: {
              message: error.message,
              timestamp: new Date().toISOString(),
            },
          };
        })) as ResponseUpdateUserData;

      if (error || !success) {
        logError("Error updating user data", error?.message ?? "Unknown error");
      } else if (success) {
        setUserData(user ?? null);
      }
    };
    if (userSession?.user?.id === userData?.userId) updateUserData();
  }, [userSession, userData]);

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
