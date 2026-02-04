use serde::Serialize;
use std::os::windows::process::CommandExt;
use std::process::Command;

const CREATE_NO_WINDOW: u32 = 0x08000000;

#[derive(Debug, Serialize)]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub command_line: String,
    pub memory_usage: String,
}

#[tauri::command]
pub async fn kill_process(pid: u32, force: bool) -> Result<bool, String> {
    // First try graceful kill
    let pid_str = pid.to_string();
    let args = if force {
        vec!["/PID", &pid_str, "/F"]
    } else {
        vec!["/PID", &pid_str]
    };

    let output = Command::new("taskkill")
        .args(&args)
        .creation_flags(CREATE_NO_WINDOW)
        .output()
        .map_err(|e| format!("Failed to execute taskkill: {}", e))?;

    if output.status.success() {
        return Ok(true);
    }

    // If graceful kill failed and we weren't already forcing, try force kill
    if !force {
        let force_output = Command::new("taskkill")
            .args(["/PID", &pid.to_string(), "/F"])
            .creation_flags(CREATE_NO_WINDOW)
            .output()
            .map_err(|e| format!("Failed to execute force taskkill: {}", e))?;

        if force_output.status.success() {
            return Ok(true);
        }

        let error_msg = String::from_utf8_lossy(&force_output.stderr);
        return Err(format!("Failed to kill process: {}", error_msg));
    }

    let error_msg = String::from_utf8_lossy(&output.stderr);
    Err(format!("Failed to kill process: {}", error_msg))
}

#[tauri::command]
pub async fn get_process_info(pid: u32) -> Result<ProcessInfo, String> {
    // Get process name and memory using tasklist
    let tasklist_output = Command::new("cmd")
        .args([
            "/C",
            &format!("tasklist /FI \"PID eq {}\" /FO CSV /NH", pid),
        ])
        .creation_flags(CREATE_NO_WINDOW)
        .output()
        .map_err(|e| format!("Failed to get process info: {}", e))?;

    let tasklist_str = String::from_utf8_lossy(&tasklist_output.stdout);
    let mut name = String::from("Unknown");
    let mut memory_usage = String::from("N/A");

    for line in tasklist_str.lines() {
        let parts: Vec<&str> = line.split(',').collect();
        if parts.len() >= 5 {
            name = parts[0].trim_matches('"').to_string();
            memory_usage = parts[4].trim_matches('"').to_string();
            break;
        }
    }

    // Get command line using WMIC
    let wmic_output = Command::new("cmd")
        .args([
            "/C",
            &format!(
                "wmic process where processid={} get commandline /format:list",
                pid
            ),
        ])
        .creation_flags(CREATE_NO_WINDOW)
        .output();

    let command_line = if let Ok(output) = wmic_output {
        let wmic_str = String::from_utf8_lossy(&output.stdout);
        wmic_str
            .lines()
            .find(|l| l.starts_with("CommandLine="))
            .map(|l| l.replace("CommandLine=", ""))
            .unwrap_or_else(|| name.clone())
    } else {
        name.clone()
    };

    Ok(ProcessInfo {
        pid,
        name,
        command_line,
        memory_usage,
    })
}
