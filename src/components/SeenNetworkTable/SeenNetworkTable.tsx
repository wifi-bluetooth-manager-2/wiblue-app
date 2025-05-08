import { DBWifiNetwork } from "../../types/network";
import SeenNetworkEntry from "../SeenNetworkEntry/SeenNetworkEntry";
import styles from "./styles.module.scss";

type SeenNetworkTableProps = {
  networks: DBWifiNetwork[];
};

const SeenNetworkTable = ({ networks }: SeenNetworkTableProps) => {
  return (
    <div className={styles.networks_container}>
      <div className={styles.title}>
        <div>Name</div>
        <div>Security</div>
        <div>Mode</div>
        <div>BSSID</div>
      </div>
      {networks.map((nt, i) => (
        <SeenNetworkEntry network={nt} key={i} />
      ))}
    </div>
  );
};

export default SeenNetworkTable;
