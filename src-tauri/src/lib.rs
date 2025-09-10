use serde::{Deserialize, Serialize};
use tauri::{Manager, WebviewUrl, WebviewWindowBuilder, LogicalSize};
use tauri_plugin_store::StoreExt;
use serde_json::json;

#[derive(Serialize, Deserialize, Clone, Debug)]
struct SessionConfig {
    duration: u64,
    message: String,
    delay: u64,
    start_time: u64,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
struct OverlayConfig {
    message: String,
    delay: u64,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn start_session(
    app_handle: tauri::AppHandle,
    duration: u64,
    message: String,
    delay: u64,
) -> Result<(), String> {
    let start_time = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| format!("Failed to get current time: {}", e))?
        .as_secs();

    let session_config = SessionConfig {
        duration,
        message: message.clone(),
        delay,
        start_time,
    };

    let store = app_handle.store("session.json")
        .map_err(|e| format!("Failed to get store: {}", e))?;
    store.set("active-session", json!(session_config));
    store.save()
        .map_err(|e| format!("Failed to save session: {}", e))?;

    println!("Session started: {} minutes, started at {}", duration, start_time);

    let app_handle_clone = app_handle.clone();
    let message_clone = message.clone();
    let delay_clone = delay;
    tokio::spawn(async move {
        let duration_seconds = duration * 60;
        println!("Backend timer started for {} seconds", duration_seconds);

        tokio::time::sleep(tokio::time::Duration::from_secs(duration_seconds)).await;

        println!("Session timer completed, creating overlay");

        if let Err(e) = create_overlay_window(app_handle_clone, message_clone, delay_clone).await {
            println!("Failed to create overlay window: {}", e);
        }
    });

    Ok(())
}

#[tauri::command]
async fn get_session_status(app_handle: tauri::AppHandle) -> Result<Option<SessionConfig>, String> {
    let store = app_handle.store("session.json")
        .map_err(|e| format!("Failed to get store: {}", e))?;

    match store.get("active-session") {
        Some(session_value) => {
            let session: SessionConfig = serde_json::from_value(session_value.clone())
                .map_err(|e| format!("Failed to parse session config: {}", e))?;
            Ok(Some(session))
        }
        None => Ok(None)
    }
}

#[tauri::command]
async fn close_overlay_window(app_handle: tauri::AppHandle) -> Result<(), String> {
    if let Some(overlay_window) = app_handle.get_webview_window("overlay") {
        overlay_window.close().map_err(|e| format!("Failed to close overlay window: {}", e))?;
        println!("Overlay window closed via command");
    }

    if let Some(main_window) = app_handle.get_webview_window("main") {
        main_window.show().map_err(|e| format!("Failed to show main window: {}", e))?;
        println!("Main window shown after overlay close");
    }

    Ok(())
}

#[tauri::command]
async fn stop_session(app_handle: tauri::AppHandle) -> Result<(), String> {
    let store = app_handle.store("session.json")
        .map_err(|e| format!("Failed to get store: {}", e))?;

    store.delete("active-session");
    store.save()
        .map_err(|e| format!("Failed to save store: {}", e))?;

    println!("Session stopped");
    Ok(())
}

#[tauri::command]
async fn get_session_config(app_handle: tauri::AppHandle) -> Result<OverlayConfig, String> {
    let store = app_handle.store("session.json")
        .map_err(|e| format!("Failed to get store: {}", e))?;

    match store.get("session-config") {
        Some(config_value) => {
            let config: OverlayConfig = serde_json::from_value(config_value.clone())
                .map_err(|e| format!("Failed to parse session config: {}", e))?;
            println!("Retrieved session config from store: {:?}", config);
            Ok(config)
        }
        None => Err("No session config found in store".to_string())
    }
}

#[tauri::command]
async fn hide_main_window(app_handle: tauri::AppHandle) -> Result<(), String> {
    if let Some(main_window) = app_handle.get_webview_window("main") {
        main_window.hide().map_err(|e| format!("Failed to hide main window: {}", e))?;
        println!("Main window hidden from frontend");
        Ok(())
    } else {
        Err("Main window not found".to_string())
    }
}

#[tauri::command]
async fn minimize_window(app_handle: tauri::AppHandle) -> Result<(), String> {
    if let Some(main_window) = app_handle.get_webview_window("main") {
        main_window.minimize().map_err(|e| format!("Failed to minimize window: {}", e))?;
        Ok(())
    } else {
        Err("Main window not found".to_string())
    }
}

#[tauri::command]
async fn maximize_window(app_handle: tauri::AppHandle) -> Result<(), String> {
    if let Some(main_window) = app_handle.get_webview_window("main") {
        if main_window.is_maximized().map_err(|e| format!("Failed to check if maximized: {}", e))? {
            main_window.unmaximize().map_err(|e| format!("Failed to unmaximize window: {}", e))?;
        } else {
            main_window.maximize().map_err(|e| format!("Failed to maximize window: {}", e))?;
        }
        Ok(())
    } else {
        Err("Main window not found".to_string())
    }
}

#[tauri::command]
async fn close_window(app_handle: tauri::AppHandle) -> Result<(), String> {
    if let Some(main_window) = app_handle.get_webview_window("main") {
        main_window.close().map_err(|e| format!("Failed to close window: {}", e))?;
        Ok(())
    } else {
        Err("Main window not found".to_string())
    }
}

#[tauri::command]
async fn create_overlay_window(
    app_handle: tauri::AppHandle,
    message: String,
    delay: u64,
) -> Result<(), String> {
    let primary_monitor = app_handle
        .primary_monitor()
        .map_err(|e| format!("Failed to get primary monitor: {}", e))?
        .ok_or("No primary monitor found")?;

    let screen_size = primary_monitor.size();
    let scale_factor = primary_monitor.scale_factor();
    let logical_size: LogicalSize<f64> = screen_size.to_logical(scale_factor);

    let overlay_window = WebviewWindowBuilder::new(
        &app_handle,
        "overlay",
        WebviewUrl::App("index.html?screen=overlay".into()),
    )
    .title("Take a Break")
    .resizable(false)
    .maximizable(false)
    .minimizable(false)
    .closable(false)
    .always_on_top(true)
    .center()
    .skip_taskbar(true)
    .inner_size(logical_size.width as f64, logical_size.height as f64)
    .decorations(false)
    .transparent(true)
    .build()
    .map_err(|e| format!("Failed to create overlay window: {}", e))?;

    overlay_window.show().map_err(|e| format!("Failed to show overlay window: {}", e))?;
    println!("Overlay window created and shown successfully");

    let store = app_handle.store("session.json")
        .map_err(|e| format!("Failed to get store: {}", e))?;
    store.set("session-config", json!({
        "message": message,
        "delay": delay
    }));
    store.save()
        .map_err(|e| format!("Failed to save store: {}", e))?;
    println!("Session data saved to store");

    tokio::spawn(async move {
        let actual_delay = if delay == 0 { 5 } else { delay };
        println!("Starting timer for {} seconds (original delay: {})", actual_delay, delay);
        tokio::time::sleep(tokio::time::Duration::from_secs(actual_delay)).await;
        println!(
            "Timer completed, closing overlay window after {} seconds",
            actual_delay
        );

        let auto_close_enabled = false; // This will be read from settings

        if auto_close_enabled {
            match overlay_window.close() {
                Ok(_) => println!("Overlay window closed successfully"),
                Err(e) => println!("Failed to close overlay window: {}", e),
            }

            if let Some(main_window) = app_handle.get_webview_window("main") {
                match main_window.show() {
                    Ok(_) => println!("Main window shown again"),
                    Err(e) => println!("Failed to show main window: {}", e),
                }
            }
        } else {
            println!("Auto-close disabled, overlay remains open for manual control");
        }
    });

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            start_session,
            get_session_status,
            stop_session,
            close_overlay_window,
            create_overlay_window,
            get_session_config,
            hide_main_window,
            minimize_window,
            maximize_window,
            close_window
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
