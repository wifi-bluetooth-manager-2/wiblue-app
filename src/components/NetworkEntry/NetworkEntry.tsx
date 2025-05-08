import { invoke } from "@tauri-apps/api/core";
import { WifiNetwork } from "../../types/network";
import styles from "./styles.module.scss";
import { JsonResponse } from "../../types/jsonresponse";
import { useState } from "react";
import toast from "react-hot-toast";
import ToastFormNetworkPassword from "../ToastForm/ToastFormNetworkPassword";
import { Link } from "react-router-dom";
import useUserContext from "../../contexts/userContextProvider";

export type NetworkEntryProps = {
  network: WifiNetwork;
  onConnectSuccess?: () => void;
};

export default function NetworkEntry({
  network,
  onConnectSuccess,
}: NetworkEntryProps) {
  //console.log(Name: ${network.ssid} \n Mode: ${network.networkMode});
  const [_password, setPassword] = useState<string>("");
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const { UserDispatch } = useUserContext();

  const connect = (_bssid: string, p: string = "") => {
    invoke("network_connect", {
      bssid: _bssid,
      password: p,
    })
      .then((r) => {
        const response: JsonResponse = JSON.parse(r as string);
        console.log(response.message);
        toast.success("Connected successfully!");
        if (onConnectSuccess) onConnectSuccess();
      })
      .catch((er) => {
        const errorResponse: JsonResponse = JSON.parse(er as string);
        const status = errorResponse.status;
        console.log(errorResponse.message);
        console.log(status);

        if (status === 502) {
          toast(
            (t) => (
              <ToastFormNetworkPassword
                t={t}
                _bssid={_bssid}
                connect={(bssid, password) => connect(bssid, password)}
              />
            ),
            {
              id: "toast",
              duration: Infinity,
            },
          );
        } else if (status === 401) {
          toast.error("Wrong password");
        } else if (status === 500) {
          toast.error("Unknown Error");
        } else if (status === 404) {
          toast.error("No such network");
        }
        setErrorStatus(status);
      });
  };

  return (
    <>
      <div className={styles.networks_container}>
        {network.currentlyUsed === true ? (
          <div className={styles.currently_used}>*</div>
        ) : (
          <div></div>
        )}
        <div className={styles.ssid}>{network.ssid}</div>
        <div className={styles.signal}>{network.signalStrength}</div>
        <div className={styles.security}>{network.security}</div>
        {network.networkMode ? (
          <div className={styles.network_mode}>{network.networkMode}</div>
        ) : (
          <div>Unknown</div>
        )}
        <div className={styles.frequency}>{network.frequency}</div>
        {network.isHidden ? <div>Yes</div> : <div>No</div>}
        <div className={styles.bssid}>{network.bssid}</div>
        {/* <div className={styles.ssid}>{network.speed}</div> */}
        {/* as an argument to connect will be bssid since it is allways correct and password will be needed when network needs it and will be stored for future use in db or locally however user wants */}
        <div className={styles.connect} onClick={() => connect(network.bssid)}>
          Connect
        </div>
      </div>
    </>
  );
}
