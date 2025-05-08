import { DBWifiNetwork } from "../../types/network";
import styles from "./styles.module.scss";

type SeenNetworkEntryProps = {
  network: DBWifiNetwork;
};

const SeenNetworkEntry = ({ network }: SeenNetworkEntryProps) => {
  return (
    <div className={styles.seen_network_entry}>
      <div className={styles.ssid}>{network.ssid}</div>
      <div className={styles.security}>{network.security}</div>
      <div className={styles.mode}>{network.mode}</div>
      <div className={styles.bssid}>{network.bssid}</div>
    </div>
  );
};

export default SeenNetworkEntry;
