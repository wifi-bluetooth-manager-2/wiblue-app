export type WifiNetwork = {
  ssid: string;
  bssid: string;
  signalStrength: string;
  frequency: number;
  channel: number;
  security: WifiSecurity;
  isHidden: boolean;
  speed: number | null;
  currentlyUsed: boolean;
  networkMode: NetworkMode;
};

export type DBWifiNetwork = {
  ssid: string;
  bssid: string;
  security: WifiSecurity;
  mode: NetworkMode;
};

export enum WifiSecurity {
  OPEN,
  WEP,
  WPA,
  WPA2,
  WPA3,
  UNKNOWN,
}

export enum NetworkMode {
  INFRA,
  IBSS,
  MONITOR,
  MESH,
  CLIENT,
  AP,
  WDS,
  P2P,
  BRIDGE,
  REPEATER,
}
