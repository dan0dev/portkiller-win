use regex::Regex;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PortInfo {
    pub port: u16,
    pub pid: u32,
    pub protocol: String,
    pub local_address: String,
    pub state: String,
    pub process_name: String,
    pub process_type: String,
}

pub fn parse_netstat_output(output: &str) -> Vec<PortInfo> {
    let mut ports = Vec::new();
    let re = Regex::new(r"^\s*(TCP|UDP)\s+(\S+):(\d+)\s+(\S+)\s+(LISTENING|ESTABLISHED)?\s*(\d+)")
        .unwrap();

    for line in output.lines() {
        if let Some(caps) = re.captures(line) {
            let protocol = caps.get(1).map(|m| m.as_str()).unwrap_or("TCP");
            let local_address = caps.get(2).map(|m| m.as_str()).unwrap_or("0.0.0.0");
            let port_str = caps.get(3).map(|m| m.as_str()).unwrap_or("0");
            let state = caps.get(5).map(|m| m.as_str()).unwrap_or("LISTENING");
            let pid_str = caps.get(6).map(|m| m.as_str()).unwrap_or("0");

            if let (Ok(port), Ok(pid)) = (port_str.parse::<u16>(), pid_str.parse::<u32>()) {
                // Skip duplicate ports (same port might appear multiple times for different addresses)
                if !ports.iter().any(|p: &PortInfo| p.port == port && p.pid == pid) {
                    ports.push(PortInfo {
                        port,
                        pid,
                        protocol: protocol.to_string(),
                        local_address: local_address.to_string(),
                        state: state.to_string(),
                        process_name: String::new(),
                        process_type: String::from("Other"),
                    });
                }
            }
        }
    }

    ports
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_netstat() {
        let sample = r#"
  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING       1234
  TCP    0.0.0.0:445            0.0.0.0:0              LISTENING       4
  TCP    127.0.0.1:3000         0.0.0.0:0              LISTENING       5678
"#;
        let ports = parse_netstat_output(sample);
        assert_eq!(ports.len(), 3);
        assert_eq!(ports[0].port, 135);
        assert_eq!(ports[0].pid, 1234);
        assert_eq!(ports[1].port, 445);
        assert_eq!(ports[2].port, 3000);
    }
}
