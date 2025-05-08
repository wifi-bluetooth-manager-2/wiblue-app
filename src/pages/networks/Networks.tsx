import { useEffect, useState } from "react";
import { DBWifiNetwork, NetworkMode, WifiNetwork } from "../../types/network";
import { invoke } from "@tauri-apps/api/core";
import NetworkTable from "../../components/NetworkTable/NetworksTable";
import toast from "react-hot-toast";
import styles from "./styles.module.scss";
import useUserContext from "../../contexts/userContextProvider";
import ApiLinks from "../../constants/apilinks";

export default function Networks() {
  const [nt, setNetworks] = useState<WifiNetwork[] | null>(null);

  const [isScanning, setIsScanning] = useState(false);

  const getNetworks = async () => {
    if (isScanning) return;
    setIsScanning(true);
    try {
      toast.success("scanning", { id: "scannertoast" });
      let raw_fetched_networks = await invoke<string>("scan");
      console.log(raw_fetched_networks);

      const fetched_networks: WifiNetwork[] = JSON.parse(
        raw_fetched_networks,
      ).map((network: any) => ({
        ...network,
        currentlyUsed: network.currently_used,
        signalStrength: network.signal_strength,
        networkMode: network.network_mode.toUpperCase() as NetworkMode,
      }));
      console.log(fetched_networks);
      setNetworks(fetched_networks);
    } catch (error) {
      console.error("Error fetching networks:", error);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    getNetworks();
    //timer();
  }, []);

  const timer = async () => {
    setInterval(async () => {
      await getNetworks();
      console.log("Scanning...");
    }, 1000000);
  };

  return (
    <>
      <main className={styles.container}>
        <input
          type="button"
          onClick={() => {
            getNetworks();
          }}
          value="Refresh"
          className={styles.refresh}
        />
        {nt ? (
          <NetworkTable networks={nt} refreshNetworks={getNetworks} />
        ) : (
          <div>No networks</div>
        )}
      </main>
    </>
  );
}
