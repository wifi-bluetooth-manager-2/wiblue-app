use serde::Serialize;
use strum_macros::Display;

/// Represents the security protocol used by a Wi-Fi network
#[derive(Debug, Clone, Serialize)]
pub enum WifiSecurity {
    /// Open network with no encryption
    Open,
    /// WEP (outdated and insecure)
    Wep,
    /// WPA (improved security over WEP)
    Wpa,
    /// WPA2 (common security protocol)
    Wpa2,
    /// WPA3 (most secure protocol)
    Wpa3,
    /// Unknown security protocol
    Unknown,
}

/// Represents the operation mode of a Wi-Fi network
#[derive(Debug, Clone, Serialize, Display)]
pub enum NetworkMode {
    /// Standard infrastructure network
    Infra,
    /// Ad-hoc network (peer-to-peer)
    Ibss,
    /// Monitor mode for traffic analysis
    Monitor,
    /// Mesh network
    Mesh,
    /// Client mode
    Client,
    /// Access point mode
    Ap,
    /// Wireless distribution system
    Wds,
    /// Peer-to-peer connection
    P2p,
    /// Network bridge
    Bridge,
    /// Signal repeater
    Repeater,
    /// Unknown mode
    Unknown,
}

/// Represents a Wi-Fi network with all its properties
#[derive(Debug, Clone, Serialize)]
pub struct WifiNetwork {
    /// Network name (SSID)
    pub ssid: String,
    /// MAC address of the access point (BSSID)
    pub bssid: String,
    /// Signal strength in dBm
    pub signal_strength: i32,
    /// Frequency in MHz
    pub frequency: u32,
    /// Channel number
    pub channel: u8,
    /// Security protocol
    pub security: WifiSecurity,
    /// Whether the network is hidden
    pub is_hidden: bool,
    /// Maximum connection speed in Mbps (if available)
    pub speed: Option<u32>,
    /// Network operation mode
    pub network_mode: NetworkMode,
    /// Whether this network is currently connected
    pub currently_used: bool,
}

/// Represents a network as reported by NetworkManager CLI
pub struct NmcliNetwork {
    /// Network name (SSID)
    pub ssid: String,
    /// MAC address of the access point (BSSID)
    pub bssid: String,
    /// Network operation mode
    pub mode: NetworkMode,
}
