import Themes from "../constants/themes";
import { DBWifiNetwork, WifiNetwork } from "../types/network";
import { User as UserEntityType } from "../types/user";
import React, { ReactNode, createContext, useContext, useReducer } from "react";

type UserContextProviderProps = {
  children: ReactNode;
};

type UserAction =
  | {
      type: "setUsername";
      value: string | null;
    }
  | {
      type: "setTheme";
      value: "light" | "dark";
    }
  | {
      type: "setProfilePicture";
      value: string | null;
    }
  | {
      type: "setEmail";
      value: string | null;
    }
  | {
      type: "setId";
      value: string | null;
    }
  | {
      type: "setSeenNetworks";
      value: DBWifiNetwork[] | null;
    }
  | { type: "setStatsNetwork"; value: WifiNetwork | null }
  | { type: "setInterface"; value: string | null }
  | { type: "setToken"; value: string | null };

const UserReducer = (
  state: UserEntityType,
  action: UserAction,
): UserEntityType => {
  switch (action.type) {
    case "setUsername":
      return { ...state, username: action.value };
    case "setTheme":
      return { ...state, theme: action.value };
    case "setProfilePicture":
      return { ...state, profilePicture: action.value };
    case "setEmail":
      return { ...state, email: action.value };
    case "setId":
      return { ...state, userId: action.value };
    case "setSeenNetworks":
      return { ...state, seenNetworks: action.value };
    case "setStatsNetwork":
      return { ...state, statsNetwork: action.value };
    case "setInterface":
      return { ...state, interface: action.value };
    case "setToken":
      return { ...state, token: action.value };
    default:
      return state;
  }
};

type UserContextType = {
  User: UserEntityType;
  UserDispatch: React.Dispatch<UserAction>;
};

export const UserContext = createContext<UserContextType | null>(null);

export const UserContextProvider = ({ children }: UserContextProviderProps) => {
  const [User, UserDispatch] = useReducer(UserReducer, {
    username: null,
    email: null,
    profilePicture: null,
    theme: Themes.light,
    userId: null,
    accountVerified: null,
    passwordLength: null,
    authorities: null,
    accountNonExpired: null,
    accountNonLocked: null,
    credentialsNonExpired: null,
    seenNetworks: null,
    statsNetwork: null,
    interface: null,
    token: null,
  } as UserEntityType);

  return (
    <UserContext.Provider value={{ User, UserDispatch }}>
      {children}
    </UserContext.Provider>
  );
};

export default function useUserContext() {
  const context = useContext(UserContext);
  if (!context) throw new Error("User context musnt be null");
  return context;
}
