import { DBWifiNetwork, WifiNetwork } from "./network";

export type User = {
  seenNetworks: DBWifiNetwork[] | null;
  username: string | null;
  profilePicture: string | null;
  theme: string;
  userId: string | number | null;
  email: string | null;
  accountVerified: boolean | null;
  passwordLength: number | null;
  authorities: string | string[] | null;
  accountNonExpired: boolean | null;
  accountNonLocked: boolean | null;
  credentialsNonExpired: boolean | null;
  token: string | null;
  statsNetwork: WifiNetwork | null;
  interface: string | null;
};
