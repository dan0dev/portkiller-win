export interface PortInfo {
  port: number;
  pid: number;
  protocol: string;
  local_address: string;
  state: string;
  process_name: string;
  process_type: ProcessType;
}

export type ProcessType = 'Web' | 'Database' | 'Dev' | 'System' | 'Other';

export interface ProcessInfo {
  pid: number;
  name: string;
  command_line: string;
  memory_usage: string;
}

export interface Settings {
  refreshInterval: number;
  launchAtStartup: boolean;
  showNotifications: boolean;
  minimizeToTray: boolean;
  theme: 'dark' | 'light';
}

export type ViewMode = 'list' | 'tree';
export type SortField = 'port' | 'process_name' | 'pid' | 'process_type';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}
