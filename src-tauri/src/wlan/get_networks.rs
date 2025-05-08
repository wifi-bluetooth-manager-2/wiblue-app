use std::{collections::VecDeque, process::Command};

use crate::wlan::network_data::{NetworkMode, WifiSecurity};

use super::{network_data::WifiNetwork, networkmanager_error::WifiManagerError};

pub fn get_networks() -> Result<Vec<WifiNetwork>, WifiManagerError> {
    let mut wifi_networks: Vec<WifiNetwork> = Vec::new();

    let output_without_ssid = Command::new("nmcli")
        .args([
            "-f",
            "ACTIVE,BSSID,SIGNAL,FREQ,CHAN,SECURITY,MODE",
            "device",
            "wifi",
        ])
        .output()
        .expect("Failed to execute nmcli, recommended to download it");

    if !output_without_ssid.status.success() {
        eprintln!(
            "nmcli command failed: {}",
            String::from_utf8_lossy(&output_without_ssid.stderr)
        );
        return Err(WifiManagerError::CommandExecutionFailure);
    }

    let stdout_without_ssid = String::from_utf8_lossy(&output_without_ssid.stdout);

    for line in stdout_without_ssid.lines().skip(1) {
        println!("{}", line);
        let fields: Vec<&str> = line.split_whitespace().collect();

        if fields.len() < 7 {
            continue;
        }

        let currently_used: bool = fields[0] == "yes";
        let bssid = fields[1].to_string();
        let signal_strength = fields[2].parse::<i32>().unwrap_or_default();
        let frequency = fields[3].parse::<u32>().unwrap_or_default();
        let channel = fields[4].parse::<u8>().unwrap_or_default();
        let security = match fields[6] {
            "OPEN" => WifiSecurity::Open,
            "WEP" => WifiSecurity::Wep,
            "WPA" => WifiSecurity::Wpa,
            "WPA2" => WifiSecurity::Wpa2,
            "WPA3" => WifiSecurity::Wpa3,
            _ => WifiSecurity::Unknown,
        };

        let network_mode = match fields[7] {
            "Infra" => NetworkMode::Infra,
            "Ad-Hoc" => NetworkMode::Ibss,
            "Monitor" => NetworkMode::Monitor,
            "Mesh" => NetworkMode::Mesh,
            "Client" => NetworkMode::Client,
            "AP" => NetworkMode::Ap,
            "WDS" => NetworkMode::Wds,
            "P2P" => NetworkMode::P2p,
            "Bridge" => NetworkMode::Bridge,
            "Repeater" => NetworkMode::Repeater,
            _ => NetworkMode::Unknown,
        };
        let modes = vec![
            NetworkMode::Infra,
            NetworkMode::Ibss,
            NetworkMode::Monitor,
            NetworkMode::Mesh,
            NetworkMode::Client,
            NetworkMode::Ap,
            NetworkMode::Wds,
            NetworkMode::P2p,
            NetworkMode::Bridge,
            NetworkMode::Repeater,
        ];

        let mode_strings: Vec<String> = modes.iter().map(|mode| mode.to_string()).collect();
        let mode_strings_lower: Vec<String> = mode_strings
            .iter()
            .map(|mode| mode.to_lowercase())
            .collect();
        let mode_strings_capital_first: Vec<String> = mode_strings_lower
            .iter()
            .map(|mode| {
                let mut chars = mode.chars();
                match chars.next() {
                    Some(first) => first.to_uppercase().collect::<String>() + chars.as_str(),
                    None => String::new(),
                }
            })
            .collect();

        let bssid_search_output = Command::new("nmcli")
            .args(["device", "wifi", "list", "bssid", &bssid])
            .output()
            .expect("Failed to execute nmcli");

        if !bssid_search_output.status.success() {
            eprintln!(
                "nmcli command failed: {}",
                String::from_utf8_lossy(&bssid_search_output.stderr)
            );
            continue;
        }

        let bssid_search_fields = String::from_utf8_lossy(&bssid_search_output.stdout);

        let mut ssid = String::new();
        let mut ssid_parts = Vec::new();
        for line in bssid_search_fields.lines().skip(1) {
            let parts: Vec<&str> = line.split_whitespace().collect();

            if parts.len() > 1 {
                let mut deque = VecDeque::from(parts);
                deque.pop_front();

                for part in deque {
                    if mode_strings.contains(&part.to_string())
                        || mode_strings_lower.contains(&part.to_string())
                        || mode_strings_capital_first.contains(&part.to_string())
                    {
                        break;
                    }
                    ssid_parts.push(part.to_string());
                }

                ssid = ssid_parts.join(" ");
                break;
            }
        }

        wifi_networks.push(WifiNetwork {
            ssid,
            bssid,
            signal_strength,
            frequency,
            channel,
            security,
            is_hidden: false,
            speed: None,
            currently_used,
            network_mode,
        });
    }

    Ok(wifi_networks)
}
// Scans available Wi-Fi networks using `nmcli` and returns their details.

// This function executes two `nmcli` commands:
// - The first gathers network metadata excluding SSID.
// - The second gathers SSID by querying the BSSID individually.

// It parses the output, maps fields to the `WifiNetwork` struct,
// and returns a vector of detected networks or an error.

// # Returns
// `Ok(Vec<WifiNetwork>)` on success, or `Err(WifiManagerError)` on failure.

// # Example
// use your_crate::wlan::networkmanager::get_networks;

// match get_networks() {
//     Ok(networks) => {
//         for net in networks {
//             println!("SSID: {}, Signal: {}", net.ssid, net.signal_strength);
//         }
//     }
//     Err(e) => eprintln!("Error fetching networks: {:?}", e),
// }
