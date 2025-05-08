import { WifiNetwork } from "../../types/network";
import NetworkEntry from "../NetworkEntry/NetworkEntry";
import styles from "./styles.module.scss";

export type NetworkTableProps = {
  networks: WifiNetwork[];
  refreshNetworks?: () => void;
};

export default function NetworkTable({
  networks,
  refreshNetworks,
}: NetworkTableProps) {
  return (
    <>
      <div className={styles.networks_container}>
        <div className={styles.title}>
          <div>Now used</div>
          <div>Name</div>
          <div>Signal</div>
          <div>Security</div>
          <div>Mode</div>
          <div>Frequency</div>
          <div>Hidden</div>
          <div>BSSID</div>
          {/* <div>Speed</div> */}
          <div>Connect</div>
        </div>
        {networks.map((nt, i) => (
          <NetworkEntry
            network={nt}
            key={i}
            onConnectSuccess={refreshNetworks}
          />
        ))}
      </div>
    </>
  );
}
