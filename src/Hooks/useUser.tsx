import React from "react";
import { UserContextType } from "../types/types";

const UserContext = React.createContext<UserContextType>(undefined);

// Default user state (null = logged out)
const defaultUser = null;

/**
 * react hook to access current user context
 * @returns the user context instance
 */
export function useUser() {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error("`useUser` must be used within a `UserProviderComponent`");
  }
  return context;
}

export const UserProviderComponent = (props) => {
  const [user, setUser] = React.useState(defaultUser);

  // Placeholder login function - will be replaced with real auth
  const login = (userData) => {
    setUser(userData);
  };

  // Placeholder logout function
  const logout = () => {
    setUser(null);
  };

  // For testing the UI, you can uncomment this to simulate a logged-in user:
  // React.useEffect(() => {
  //   setUser({
  //     name: "Test User",
  //     email: "test@example.com",
  //     avatar: null,
  //   });
  // }, []);

  const value = {
    user,
    isLoggedIn: !!user,
    login,
    logout,
  };

  return <UserContext.Provider value={value}>{props.children}</UserContext.Provider>;
};
