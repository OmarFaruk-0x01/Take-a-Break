use serde::{Deserialize, Serialize};
use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_store::StoreExt;
use serde_json::json;

#[derive(Serialize, Deserialize, Clone, Debug)]
struct SessionConfig {
    duration: u64, // in minutes
    message: String,
    delay: u64, // in seconds
    start_time: u64, // Unix timestamp when session started
}

#[derive(Serialize, Deserialize, Clone, Debug)]
struct OverlayConfig {
    message: String,
    delay: u64,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
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

    // Save session config to store
    let store = app_handle.store("session.json")
        .map_err(|e| format!("Failed to get store: {}", e))?;
    store.set("active-session", json!(session_config));
    store.save()
        .map_err(|e| format!("Failed to save session: {}", e))?;

    println!("Session started: {} minutes, started at {}", duration, start_time);

    // Start the backend timer
    let app_handle_clone = app_handle.clone();
    let message_clone = message.clone();
    let delay_clone = delay;
    tokio::spawn(async move {
        let duration_seconds = duration * 60;
        println!("Backend timer started for {} seconds", duration_seconds);

        tokio::time::sleep(tokio::time::Duration::from_secs(duration_seconds)).await;

        println!("Session timer completed, creating overlay");

        // Create overlay window
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
            // Parse the JSON value back to OverlayConfig
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
    // Get the primary monitor to get screen dimensions
    let primary_monitor = app_handle
        .primary_monitor()
        .map_err(|e| format!("Failed to get primary monitor: {}", e))?
        .ok_or("No primary monitor found")?;

    let screen_size = primary_monitor.size();

    // Create the overlay window using WebviewWindowBuilder
    let overlay_window = WebviewWindowBuilder::new(
        &app_handle,
        "overlay",
        WebviewUrl::App("overlay.html".into()),
    )
    .title("Break Reminder")
    .resizable(false)
    .maximizable(false)
    .minimizable(false)
    .closable(false)
    .always_on_top(true)
    .center()
    .inner_size(screen_size.width as f64, screen_size.height as f64)
    .decorations(false)
    .transparent(true)
    .build()
    .map_err(|e| format!("Failed to create overlay window: {}", e))?;

    // Save the session data to the store for the overlay to retrieve
    let store = app_handle.store("session.json")
        .map_err(|e| format!("Failed to get store: {}", e))?;
    store.set("session-config", json!({
        "message": message,
        "delay": delay
    }));
    store.save()
        .map_err(|e| format!("Failed to save store: {}", e))?;
    println!("Session data saved to store");

    // Auto-close the overlay after the specified delay
    tokio::spawn(async move {
        println!("Starting timer for {} seconds", delay);
        tokio::time::sleep(tokio::time::Duration::from_secs(delay)).await;
        println!(
            "Timer completed, closing overlay window after {} seconds",
            delay
        );
        match overlay_window.close() {
            Ok(_) => println!("Overlay window closed successfully"),
            Err(e) => println!("Failed to close overlay window: {}", e),
        }

        // Show the main window again after overlay closes
        if let Some(main_window) = app_handle.get_webview_window("main") {
            match main_window.show() {
                Ok(_) => println!("Main window shown again"),
                Err(e) => println!("Failed to show main window: {}", e),
            }
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
