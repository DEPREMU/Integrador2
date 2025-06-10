import {
  supabase,
  logError,
  KEYS_STORAGE,
  loadDataSecure,
  saveDataSecure,
  removeDataSecure,
} from "@utils";
import { UserSession, UserData } from "@types";
import React, { createContext, useState, useEffect } from "react";

type UserContextType = {
  userSession: UserSession | null;
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
  logout: () => Promise<void>;
  setUserSession: React.Dispatch<React.SetStateAction<UserSession | null>>;
  refreshToken: (refreshToken: string) => Promise<void>;
  userData: UserData | null;
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
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();

      setLoading(() => {
        if (!session || !session?.access_token || !session?.user?.id)
          return false;

        setIsLoggedIn(true);
        setUserSession(session);
        return false;
      });
    };

    checkSession();
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
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return callback?.(new Error(error.message));
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
    setIsLoggedIn(true);
    setUserSession(session);
    return callback?.(session);
  };

  const logout = async () => {
    if (!userSession || !isLoggedIn) return;

    await supabase.auth.signOut();
    await clearSession();
    setIsLoggedIn(false);
    setUserSession(null);
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
