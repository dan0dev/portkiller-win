use crate::utils::netstat::{parse_netstat_output, PortInfo};
use std::collections::HashMap;
use std::os::windows::process::CommandExt;
use std::process::Command;

const CREATE_NO_WINDOW: u32 = 0x08000000;

#[tauri::command]
pub async fn scan_ports() -> Result<Vec<PortInfo>, String> {
    // Run netstat to get all listening ports
    let netstat_output = Command::new("cmd")
        .args(["/C", "netstat -ano | findstr LISTENING"])
        .creation_flags(CREATE_NO_WINDOW)
        .output()
        .map_err(|e| format!("Failed to execute netstat: {}", e))?;

    let netstat_str = String::from_utf8_lossy(&netstat_output.stdout);
    let mut ports = parse_netstat_output(&netstat_str);

    // Get process names for all PIDs
    let pids: Vec<u32> = ports.iter().map(|p| p.pid).collect();
    let process_names = get_process_names(&pids);

    // Update ports with process names
    for port in &mut ports {
        if let Some(name) = process_names.get(&port.pid) {
            port.process_name = name.clone();
            port.process_type = detect_process_type(name, port.port);
        }
    }

    // Sort by port number
    ports.sort_by(|a, b| a.port.cmp(&b.port));

    Ok(ports)
}

#[tauri::command]
pub async fn get_port_details(port: u16) -> Result<Option<PortInfo>, String> {
    let ports = scan_ports().await?;
    Ok(ports.into_iter().find(|p| p.port == port))
}

fn get_process_names(pids: &[u32]) -> HashMap<u32, String> {
    let mut result = HashMap::new();

    // Use tasklist to get all processes
    let output = Command::new("cmd")
        .args(["/C", "tasklist /FO CSV /NH"])
        .creation_flags(CREATE_NO_WINDOW)
        .output();

    if let Ok(output) = output {
        let output_str = String::from_utf8_lossy(&output.stdout);
        for line in output_str.lines() {
            let parts: Vec<&str> = line.split(',').collect();
            if parts.len() >= 2 {
                let name = parts[0].trim_matches('"').to_string();
                if let Ok(pid) = parts[1].trim_matches('"').parse::<u32>() {
                    if pids.contains(&pid) {
                        result.insert(pid, name);
                    }
                }
            }
        }
    }

    result
}

fn detect_process_type(process_name: &str, port: u16) -> String {
    let name_lower = process_name.to_lowercase();

    // Web servers
    if name_lower.contains("nginx")
        || name_lower.contains("apache")
        || name_lower.contains("httpd")
        || name_lower.contains("iis")
        || port == 80
        || port == 443
        || port == 8080
        || port == 8443
    {
        return "Web".to_string();
    }

    // Databases
    if name_lower.contains("mysql")
        || name_lower.contains("postgres")
        || name_lower.contains("mongo")
        || name_lower.contains("redis")
        || name_lower.contains("sql")
        || port == 3306
        || port == 5432
        || port == 27017
        || port == 6379
        || port == 1433
    {
        return "Database".to_string();
    }

    // Development tools
    if name_lower.contains("node")
        || name_lower.contains("python")
        || name_lower.contains("ruby")
        || name_lower.contains("java")
        || name_lower.contains("dotnet")
        || name_lower.contains("code")
        || name_lower.contains("vite")
        || name_lower.contains("webpack")
        || (port >= 3000 && port <= 3999)
        || (port >= 4000 && port <= 4999)
        || (port >= 5000 && port <= 5999)
        || (port >= 8000 && port <= 8999)
    {
        return "Dev".to_string();
    }

    // System processes
    if name_lower.contains("system")
        || name_lower.contains("svchost")
        || name_lower.contains("services")
        || name_lower.contains("lsass")
        || name_lower.contains("wininit")
        || port < 1024
    {
        return "System".to_string();
    }

    "Other".to_string()
}
