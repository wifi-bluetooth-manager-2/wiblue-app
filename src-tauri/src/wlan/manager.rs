use super::{
    network_data::WifiNetwork,
    network_stats::{NetworkMonitor, NetworkStats},
    networkmanager_error::{StatsError, WifiConnectionError, WifiManagerError},
};
use tauri::{AppHandle, Emitter};

/// Trait defining operations for managing Wi-Fi connections
pub trait WifiManager {
    /// Scans for available Wi-Fi networks
    ///
    /// # Returns
    /// - `Ok(Vec<WifiNetwork>)` containing discovered networks
    /// - `Err(WifiManagerError)` if the scan fails
    fn scan() -> Result<Vec<WifiNetwork>, WifiManagerError>;

    /// Connects to a Wi-Fi network
    ///
    /// # Arguments
    /// * `bssid` - The BSSID of the network to connect to
    /// * `password` - Optional password for secured networks
    ///
    /// # Returns
    /// - `Ok(())` if connection succeeds
    /// - `Err(WifiConnectionError)` if connection fails
    fn connect(bssid: &str, password: Option<&str>) -> Result<(), WifiConnectionError>;

    /// Gets network interface statistics
    ///
    /// # Arguments
    /// * `interface_name` - name of the interface user wants to track data
    ///
    /// # Returns
    /// - `Ok(Option<NetworkStats>)` if getting statistics is successfull
    /// - `Err(StatsError)` if getting statistics fails
    async fn network_stats_onetime(
        interface_name: &str,
    ) -> Result<Option<NetworkStats>, StatsError>;

    /// Gets network interface statistics constantly
    ///
    /// # Arguments
    /// * `interface_name` - name of the interface user wants to track data
    ///
    /// # Returns
    /// - `Ok(Option<NetworkStats>)` if getting statistics is successfull
    /// - `Err(StatsError)` if getting statistics fails
    async fn network_stats_constat_monitoring(
        interface_name: &str,
        app_handle: AppHandle,
    ) -> Result<Option<NetworkStats>, StatsError>;

    fn scan_interfaces() -> Result<Vec<String>, ()>;
}

impl WifiManager for WifiNetwork {
    fn scan() -> Result<Vec<Self>, WifiManagerError> {
        super::get_networks::get_networks()
    }

    fn connect(bssid: &str, password: Option<&str>) -> Result<(), WifiConnectionError> {
        super::connect_network::connect_to_network(bssid, password)
    }

    async fn network_stats_onetime(
        interface_name: &str,
    ) -> Result<Option<NetworkStats>, StatsError> {
        let mut monitor = match NetworkMonitor::new(interface_name) {
            Ok(m) => m,
            Err(e) => return Err(e),
        };

        Ok(monitor.get_stats().await)
    }

    async fn network_stats_constat_monitoring(
        interface_name: &str,
        app_handle: AppHandle,
    ) -> Result<Option<NetworkStats>, StatsError> {
        let mut monitor = match NetworkMonitor::new(interface_name) {
            Ok(m) => m,
            Err(e) => return Err(e),
        };

        tokio::spawn(async move {
            monitor
                .monitor(10, move |stats| {
                    let _ = app_handle.emit("network_stats", &stats);
                })
                .await;
        });

        Ok(None)
    }

    fn scan_interfaces() -> Result<Vec<String>, ()> {
        super::get_interfaces::get_interfaces()
    }
}
