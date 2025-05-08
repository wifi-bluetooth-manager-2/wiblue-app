use std::time::{Duration, Instant};
use systemstat::{Platform, System};
use tauri::{AppHandle, Emitter};
use tokio::time;

use super::networkmanager_error::StatsError;

/// Network statistics including bytes, speeds, and totals
#[derive(Clone, serde::Serialize, Debug)]
pub struct NetworkStats {
    pub bytes_up: u64,
    pub bytes_down: u64,
    pub speed_up: f64,   // in bytes per second
    pub speed_down: f64, // in bytes per second
    pub total_up: u64,   // cumulative since monitor start
    pub total_down: u64, // cumulative since monitor start
}

/// Network monitor that keeps track of previous stats for speed calculation
pub struct NetworkMonitor {
    sys: System,
    interface: String,
    last_stats: Option<(u64, u64, Instant)>,
    total_up: u64,
    total_down: u64,
}

impl NetworkMonitor {
    /// Creates a new NetworkMonitor for the specified interface, validating it exists
    pub fn new(interface: &str) -> Result<Self, StatsError> {
        let sys = System::new();
        let interfaces = match sys.networks() {
            Ok(i) => {
                println!("Available network interfaces: {:?}", i); // Log available interfaces
                i
            }
            Err(e) => {
                eprintln!("Error checking interfaces {:?}", e);
                return Err(StatsError::InterfaceValidationError);
            }
        };

        if !interfaces.contains_key(interface) {
            eprintln!("Interface '{}' not found.", interface); // Log if the interface is not found
            return Err(StatsError::InvalidInterfaceName);
        }

        Ok(NetworkMonitor {
            sys,
            interface: interface.to_string(),
            last_stats: None,
            total_up: 0,
            total_down: 0,
        })
    }

    /// Gets current network statistics with speeds and cumulative totals
    pub async fn get_stats(&mut self) -> Option<NetworkStats> {
        match self.sys.network_stats(&self.interface) {
            Ok(net_stats) => {
                let now = Instant::now();
                let current_bytes_up = net_stats.tx_bytes.0;
                let current_bytes_down = net_stats.rx_bytes.0;

                let (speed_up, speed_down, up_diff, down_diff) =
                    if let Some((last_up, last_down, last_time)) = self.last_stats {
                        let elapsed = now.duration_since(last_time).as_secs_f64();
                        let up_diff = current_bytes_up.saturating_sub(last_up);
                        let down_diff = current_bytes_down.saturating_sub(last_down);

                        (
                            up_diff as f64 / elapsed,
                            down_diff as f64 / elapsed,
                            up_diff,
                            down_diff,
                        )
                    } else {
                        (0.0, 0.0, 0, 0)
                    };

                self.last_stats = Some((current_bytes_up, current_bytes_down, now));
                self.total_up = self.total_up.saturating_add(up_diff);
                self.total_down = self.total_down.saturating_add(down_diff);

                let stats = NetworkStats {
                    bytes_up: current_bytes_up,
                    bytes_down: current_bytes_down,
                    speed_up,
                    speed_down,
                    total_up: self.total_up,
                    total_down: self.total_down,
                };
                println!("Calculated stats: {:?}", stats); // Log the calculated stats
                Some(stats)
            }
            Err(e) => {
                eprintln!("Error getting network stats: {:?}", e);
                None
            }
        }
    }

    /// Continuously monitors network usage with a given interval
    pub async fn monitor(&mut self, interval_secs: u64, callback: impl Fn(NetworkStats)) {
        loop {
            if let Some(stats) = self.get_stats().await {
                callback(stats);
            }
            time::sleep(Duration::from_secs(interval_secs)).await;
        }
    }
}

// async fn example_usage(interface_name: String) {
//     match NetworkMonitor::new(&interface_name) {
//         Ok(mut monitor) => {
//             if let Some(stats) = monitor.get_stats().await {
//                 println!("Initial stats: {:?}", stats);
//             }
//
//             monitor.monitor(1, |stats| {
//                 println!("Speed: ↑ {:.2} KB/s ↓ {:.2} KB/s", stats.speed_up / 1024.0, stats.speed_down / 1024.0);
//                 println!("Total: ↑ {:.2} MB ↓ {:.2} MB", stats.total_up as f64 / 1048576.0, stats.total_down as f64 / 1048576.0);
//             }).await;
//         }
//         Err(err) => {
//             eprintln!("Failed to create monitor: {}", err);
//         }
//     }
// }
