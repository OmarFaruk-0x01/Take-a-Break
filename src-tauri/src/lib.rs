use tauri::{Manager, WebviewWindowBuilder, WebviewUrl, Emitter};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
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
async fn create_overlay_window(
    app_handle: tauri::AppHandle,
    message: String,
    delay: u64,
) -> Result<(), String> {
    let overlay_config = OverlayConfig { message, delay };

    // Get the primary monitor to get screen dimensions
    let primary_monitor = app_handle.primary_monitor()
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

    // Send the configuration to the overlay window
    overlay_window.emit("overlay-config", &overlay_config)
        .map_err(|e| format!("Failed to send config to overlay: {}", e))?;

    // Auto-close the overlay after the specified delay
    tokio::spawn(async move {
        println!("Starting timer for {} seconds", delay);
        tokio::time::sleep(tokio::time::Duration::from_secs(delay)).await;
        println!("Timer completed, closing overlay window after {} seconds", delay);
        match overlay_window.close() {
            Ok(_) => println!("Overlay window closed successfully"),
            Err(e) => println!("Failed to close overlay window: {}", e),
        }
    });

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, create_overlay_window])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
