use std::process::{Command, Child};
use std::sync::Mutex;
use tauri::{Manager, State, RunEvent};

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;
use std::fs::File;
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons, MessageDialogKind};

struct BackendState(Mutex<Option<Child>>);

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_auth_token() -> Result<String, String> {
    let mut possible_paths = vec![];
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(parent) = exe_path.parent() {
            // Production path
            possible_paths.push(parent.join("data/.jwt_token"));
        }
    }
    // Development paths fallback
    possible_paths.push(std::path::PathBuf::from("../../WEBSITE/BACKEND/data/.jwt_token"));
    possible_paths.push(std::path::PathBuf::from("../WEBSITE/BACKEND/data/.jwt_token"));
    possible_paths.push(std::path::PathBuf::from("WEBSITE/BACKEND/data/.jwt_token"));
    possible_paths.push(std::path::PathBuf::from("data/.jwt_token"));

    for path in possible_paths {
        if let Ok(content) = std::fs::read_to_string(path) {
            return Ok(content.trim().to_string());
        }
    }
    
    Ok("".to_string())
}

async fn check_knemos(port: u16) -> bool {
    let client = reqwest::Client::builder().timeout(std::time::Duration::from_secs(1)).build().unwrap();
    let url = format!("http://127.0.0.1:{}/api/system/health", port);
    if let Ok(res) = client.get(&url).send().await {
        if let Ok(json) = res.json::<serde_json::Value>().await {
            if json.get("backend_version").is_some() {
                return true;
            }
        }
    }
    false
}

#[tauri::command]
async fn start_backend(app: tauri::AppHandle, state: State<'_, BackendState>) -> Result<u16, String> {
    let mut target_port = 8765;
    
    // 1. Check if backend is already running
    if std::net::TcpStream::connect(("127.0.0.1", 8765)).is_ok() {
        if check_knemos(8765).await {
            println!("[KNEMOS] Backend already running on 8765");
            return Ok(8765);
        } else {
            let _ = app.dialog()
                .message("Port 8765 is already in use by another application. KNEMOS will fallback to a dynamic port.")
                .kind(MessageDialogKind::Warning)
                .buttons(MessageDialogButtons::Ok)
                .title("Port Conflict Detected")
                .show(|_| {});
                
            for p in 8766..8800 {
                if std::net::TcpStream::connect(("127.0.0.1", p)).is_err() {
                    target_port = p;
                    break;
                }
            }
        }
    }
    
    // 2. Not running. Spawn it.
    std::fs::create_dir_all("logs").unwrap_or_default();
    let log_file = File::create("logs/backend.log").unwrap();
    let log_file_err = log_file.try_clone().unwrap();

    let mut cmd;
    if std::path::Path::new("backend.exe").exists() {
        cmd = Command::new("backend.exe");
        cmd.args(["--port", &target_port.to_string()]);
    } else {
        // Fallback to python for local development or non-packaged backend
        cmd = Command::new("python");
        let fallback_path = "C:/Users/ahadd/Documents/GitHub/Knemos/WEBSITE/BACKEND/main.py";
        let relative_path = "../../WEBSITE/BACKEND/main.py";
        
        if std::path::Path::new(relative_path).exists() {
            cmd.args([relative_path, "--port", &target_port.to_string()]);
        } else {
            cmd.args([fallback_path, "--port", &target_port.to_string()]);
        }
    }
    
    cmd.stdout(std::process::Stdio::from(log_file));
    cmd.stderr(std::process::Stdio::from(log_file_err));
    
    // Hidden window on Windows
    #[cfg(target_os = "windows")]
    {
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        cmd.creation_flags(CREATE_NO_WINDOW);
    }
    
    match cmd.spawn() {
        Ok(child) => {
            println!("[KNEMOS] Spawned backend process on port {}", target_port);
            let mut guard = state.0.lock().unwrap();
            *guard = Some(child);
            Ok(target_port)
        },
        Err(e) => {
            Err(format!("Failed to spawn backend: {}", e))
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_deep_link::init())
        .manage(BackendState(Mutex::new(None)))
        .invoke_handler(tauri::generate_handler![greet, get_auth_token, start_backend])
        .build(tauri::generate_context!())
        .expect("error while building tauri application");
        
    builder.run(|app_handle, event| {
        if let RunEvent::Exit = event {
            let state: State<BackendState> = app_handle.state();
            let mut guard = state.0.lock().unwrap();
            #[allow(unused_mut)]
            if let Some(mut child) = guard.take() {
                println!("[KNEMOS] Cleaning up backend process tree...");
                
                // Graceful shutdown attempt
                for port in [8765, 8766] {
                    if let Ok(mut stream) = std::net::TcpStream::connect(("127.0.0.1", port)) {
                        use std::io::Write;
                        let _ = stream.write_all(b"POST /api/system/shutdown HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n");
                    }
                }
                
                std::thread::sleep(std::time::Duration::from_secs(3));
                
                #[cfg(target_os = "windows")]
                {
                    const CREATE_NO_WINDOW: u32 = 0x08000000;
                    let _ = Command::new("taskkill")
                        .args(["/F", "/T", "/PID", &child.id().to_string()])
                        .creation_flags(CREATE_NO_WINDOW)
                        .output();
                }
                #[cfg(not(target_os = "windows"))]
                {
                    let _ = child.kill();
                }
            }
        }
    });
}
