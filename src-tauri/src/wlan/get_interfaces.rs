use std::process::Command;

/// Retrieves a list of all available network interfaces on the system.
///
/// This function runs the `ifconfig -a` command and parses its output
/// to extract the names of network interfaces. Interface names typically
/// appear at the beginning of a line and are followed by a colon (`:`).
///
/// # Returns
/// - `Ok(Vec<String>)`: A list of interface names (e.g., `["eth0", "lo", "wlp1s0"]`)
/// - `Err(())`: If the command fails or produces an unexpected output
///
/// # Examples
/// ```
/// let interfaces = get_interfaces().unwrap();
/// println!("{:?}", interfaces);
/// ```
///
/// # Notes
/// - This function assumes the presence of the `ifconfig` command (usually found on Unix-like systems).
/// - It trims trailing colons (`:`) from interface names.
/// - This function does not filter for active interfaces; it lists all, including down or virtual interfaces.
pub fn get_interfaces() -> Result<Vec<String>, ()> {
    let output = Command::new("ifconfig")
        .arg("-a")
        .output()
        .expect("Failed to execute `ifconfig -a`");

    if !output.status.success() {
        eprintln!(
            "Command failed: {}",
            String::from_utf8_lossy(&output.stderr)
        );
        return Err(());
    }

    let raw_output = String::from_utf8_lossy(&output.stdout);
    let mut interfaces = Vec::new();

    for line in raw_output.lines() {
        if let Some(first_token) = line.split_whitespace().next() {
            if first_token.ends_with(':') {
                let iface = first_token.trim_end_matches(':').to_string();
                interfaces.push(iface);
            }
        }
    }

    Ok(interfaces)
}
