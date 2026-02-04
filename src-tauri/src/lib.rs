mod commands;
mod utils;

use tauri::{
    image::Image,
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager,
};
use tauri_plugin_autostart::MacosLauncher;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--minimized"]),
        ))
        .setup(|app| {
            // Create system tray menu
            let quit = MenuItem::with_id(app, "quit", "Quit PortKiller", true, None::<&str>)?;
            let show = MenuItem::with_id(app, "show", "Show Window", true, None::<&str>)?;
            let refresh = MenuItem::with_id(app, "refresh", "Refresh Ports", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show, &refresh, &quit])?;

            // Load the icon
            let icon = Image::from_bytes(include_bytes!("../icons/icon.png"))
                .expect("Failed to load tray icon");

            // Build tray icon
            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .icon(icon)
                .tooltip("PortKiller - Port Management")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "refresh" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.emit("tray-refresh", ());
                        }
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::ports::scan_ports,
            commands::ports::get_port_details,
            commands::process::kill_process,
            commands::process::get_process_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
