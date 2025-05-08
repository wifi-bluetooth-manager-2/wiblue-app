use systemstat::NetworkStats;
use tauri::{AppHandle, Emitter};
use wlan::manager::WifiManager;
use wlan::network_data::WifiNetwork;
use wlan::network_stats::NetworkMonitor;
use wlan::networkmanager_error::{StatsError, WifiConnectionError};
mod wlan;

#[derive(serde::Serialize, serde::Deserialize)]
struct JsonResponse {
    message: String,
    status: u16,
}

impl JsonResponse {
    fn new(msg: &str, status: u16) -> String {
        let response = JsonResponse {
            message: msg.to_string(),
            status,
        };

        let r = serde_json::to_string(&response).unwrap();
        println!("res: {}", r);
        return r;
    }
}

#[tauri::command]
fn scan() -> String {
    let networks = <WifiNetwork as WifiManager>::scan();
    match networks {
        Ok(net) => {
            serde_json::to_string(&net).unwrap_or_else(|_| "Error serializing networks".to_string())
        }
        Err(_) => "Error getting networks 400".to_string(),
    }
}

#[tauri::command]
fn network_connect(bssid: String, password: String) -> Result<String, String> {
    println!("bssid: {} \n password: {}", bssid.clone(), password.clone());
    let temp_password: Option<&str> = if password.is_empty() {
        None
    } else {
        Some(&password)
    };

    let connection_status = <WifiNetwork as WifiManager>::connect(&bssid, temp_password);

    match connection_status {
        Ok(_) => Ok(JsonResponse::new("Connected Successfully", 200)),
        Err(e) => match e {
            WifiConnectionError::NoSuchNetwork => Err(JsonResponse::new("No network", 404)),
            WifiConnectionError::NoPasswordProvided => {
                Err(JsonResponse::new("No password provided", 502))
            }
            WifiConnectionError::WrongPassword => Err(JsonResponse::new("Wrong password", 401)),
            WifiConnectionError::UnknownError | WifiConnectionError::AskingError => {
                Err(JsonResponse::new("Unknown error", 500))
            }
        },
    }
}

#[tauri::command]
async fn monitor_network_stats(app: AppHandle, interface: String) -> Result<String, String> {
    // Start monitoring network stats
    match network_stats_constat_monitoring(&interface, app).await {
        Ok(_) => Ok(JsonResponse::new("Started monitoring", 200)),
        Err(e) => {
            eprintln!("Error monitoring network stats: {:?}", e);
            Err(JsonResponse::new("Failed to start monitoring", 500))
        }
    }
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
                // Emit the stats to the frontend every second
                let _ = app_handle.emit("network_stats", &stats);
            })
            .await;
    });

    Ok(None)
}

#[tauri::command]
fn scan_interfaces() -> Result<String, String> {
    match <WifiNetwork as WifiManager>::scan_interfaces() {
        Ok(ifaces) => {
            return Ok(JsonResponse::new(
                &serde_json::to_string(&ifaces)
                    .unwrap_or_else(|_| "Error serializing networks".to_string()),
                200,
            ))
        }
        Err(_) => return Err(JsonResponse::new("Error getting interfaces", 500)),
    };
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            scan,
            network_connect,
            monitor_network_stats,
            scan_interfaces
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
