use std::process::{Command, Output};

use super::networkmanager_error::WifiConnectionError;

/// Connects to a Wi-Fi network using nmcli
///
/// # Arguments
/// * `bssid` - The BSSID of the network to connect to
/// * `password` - Optional password for secured networks
///
/// # Returns
/// - `Ok(())` if connection succeeds
/// - `Err(WifiConnectionError)` if connection fails
pub fn connect_to_network(bssid: &str, password: Option<&str>) -> Result<(), WifiConnectionError> {
    let mut command = Command::new("nmcli");

    let args = match password {
        Some(pass) => vec!["dev", "wifi", "connect", bssid, "password", pass],
        None => vec!["dev", "wifi", "connect", bssid],
    };

    let output = command
        .args(&args)
        .output()
        .map_err(|_| WifiConnectionError::UnknownError)?;

    if output.status.success() {
        Ok(())
    } else {
        let outputclone = output.clone();
        let error = String::from_utf8_lossy(&outputclone.stderr);
        handle_connection_error(bssid, output, password, error.to_string())
    }
}

/// Handles connection errors and maps them to appropriate error types
fn handle_connection_error(
    bssid: &str,
    output: Output,
    password: Option<&str>,
    error: String,
) -> Result<(), WifiConnectionError> {
    if error.contains("Passwords or encryption keys are required") && password.is_none() {
        Err(WifiConnectionError::NoPasswordProvided)
    } else if error.contains("No suitable network found") {
        Err(WifiConnectionError::NoSuchNetwork)
    } else if error.contains("activation failed") && password.is_some() {
        Err(WifiConnectionError::WrongPassword)
    } else {
        eprintln!("Connection error (BSSID: {}): {}", bssid, error);
        Err(WifiConnectionError::UnknownError)
    }
}
