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
  logExpoGoWarning,
} from "@utils";
import { UserSession } from "@types";
import React, { createContext, useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  User,
  ResponseAuth,
  TypeBodyLogin,
  TypeBodySignup,
  TypeBodyUpdateUserData,
  ResponseUpdateUserData,
} from "@types";

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
  updateUserData: (
    userData: User,
    callback?: (success: boolean, error?: Error) => void
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
 * @param rememberMe - If true, sets the session expiry to 15 days from now; otherwise, sets expiry to 8 hours.
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
  const isMountedRef = useRef(true);
  const hasInitialized = useRef(false);
  const isInitializing = useRef(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Show development warning about expo-notifications in Expo Go
  useEffect(() => {
    logExpoGoWarning();
  }, []);

  const saveSessionCallback = useCallback(async (
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
  }, []);

  useEffect(() => {
    if (hasInitialized.current || isInitializing.current || !isMountedRef.current) return;
    
    const performInitialization = async () => {
      isInitializing.current = true;

      try {
        const session = await getSession();

        if (!isMountedRef.current) return;

        if (!session?.access_token || !session?.user?.id) {
          setLoading(false);
          hasInitialized.current = true;
          return;
        }

        // Fetch user data immediately
        const [language, pushNotifications] = await Promise.all([
          checkLanguage(),
          hasPushNotifications(),
        ]);

        const { data, error }: ResponseAuth = await fetch(
          getRouteAPI("/login"),
          fetchOptions<TypeBodyLogin>("POST", {
            uuid: session.user.id,
            language,
            pushNotifications,
          })
        )
          .then((res) => res.json())
          .catch((error) => {
            logError("Error fetching user data", error.message);
            return {
              data: null,
              error: {
                message: error.message,
                timestamp: new Date().toISOString(),
              },
            };
          });

        if (!isMountedRef.current) return;

        if (error || !data) {
          logError("Error fetching user data", error?.message);
          setLoading(false);
        } else {
          // Set all state at once to avoid multiple re-renders
          setIsLoggedIn(true);
          setUserSession(session);
          setUserData(data.user);
          setLoading(false);
        }
        
        hasInitialized.current = true;
      } finally {
        isInitializing.current = false;
      }
    };

    performInitialization();
  }, []);

  const refreshToken = useCallback(
    async (refresh_token: string) => {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token,
      });
      const session = data?.session as unknown as UserSession;

      if (error || !session) {
        logError("Error while updating the access_token", error?.message);
        await clearSession();
        return;
      }
      await saveSessionCallback(session, false, true);
    },
    [saveSessionCallback]
  );

  const signUp = useCallback(
    async <T = void,>(
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
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
        })) as ResponseAuth;

      if (userData.error) {
        logError("Error during sign up", userData.error.message);
        return callback?.(new Error(userData.error.message));
      }
      if (isMountedRef.current) {
        setUserData(userData.data?.user || null);
      }

      return callback?.();
    },
    []
  );

  const login = useCallback(
    async <T = void,>(
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

      await saveSessionCallback(session, rememberMe);
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
        })) as ResponseAuth;

      if (isMountedRef.current) {
        setIsLoggedIn(true);
        setUserSession(session);
        setUserData(userData.data?.user || null);
        hasInitialized.current = true;
      }
      return callback?.(session);
    },
    [saveSessionCallback]
  );

  const logout = useCallback(
    async (callback?: (message: string) => void) => {
      if (!userSession || !isLoggedIn)
        return callback?.("No user session to log out");

      await Promise.all([supabase.auth.signOut(), clearSession()]);
      if (isMountedRef.current) {
        setUserData(null);
        setIsLoggedIn(false);
        setUserSession(null);
        hasInitialized.current = false;
        isInitializing.current = false;
      }
      log("User logged out successfully");
      callback?.("User logged out successfully");
    },
    [isLoggedIn, userSession]
  );

  const updateUserData = useCallback(
    async (
      newData?: { [key: string]: any },
      callback?: (success: boolean, error?: Error) => void
    ) => {
      if (!userData || !newData)
        return callback?.(false, new Error("No user data to update"));
      const res: ResponseUpdateUserData = await fetch(
        getRouteAPI("/updateUserData"),
        fetchOptions<TypeBodyUpdateUserData>("POST", {
          userId: userData?.userId || "",
          userData: (newData as User) || {},
        })
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
          res.error?.message || "Unknown error"
        );
        return callback?.(
          false,
          new Error(res.error?.message || "Unknown error")
        );
      }
      setUserData(res.user || null);
      log("User data updated successfully");
      return callback?.(true);
    },
    [userData]
  );

  const contextValue = useMemo(() => ({
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
  }), [
    signUp,
    loading,
    isLoggedIn,
    userSession,
    updateUserData,
    refreshToken,
    userData,
    logout,
    login
  ]);

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
