import { ActionIcon, Button, Card, Container, Group, Stack, Text, TextInput } from '@mantine/core';
import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useState } from "react";
import "./App.css";

interface SessionConfig {
  duration: number;
  message: string;
  delay: number;
}

interface BackendSessionConfig {
  duration: number;
  message: string;
  delay: number;
  start_time: number;
}

function App() {
  const [sessionConfig, setSessionConfig] = useState<SessionConfig>({
    duration: 0,
    message: "",
    delay: 0
  });
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Check for existing session on app load
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const backendSession = await invoke<BackendSessionConfig | null>("get_session_status");
        if (backendSession) {
          const now = Math.floor(Date.now() / 1000);
          const elapsed = now - backendSession.start_time;
          const remaining = (backendSession.duration * 60) - elapsed;

          if (remaining > 0) {
            setIsSessionActive(true);
            setTimeRemaining(remaining);

            // Start display timer
            const displayTimer = setInterval(async () => {
              try {
                const currentSession = await invoke<BackendSessionConfig | null>("get_session_status");
                if (currentSession) {
                  const currentTime = Math.floor(Date.now() / 1000);
                  const currentElapsed = currentTime - currentSession.start_time;
                  const currentRemaining = (currentSession.duration * 60) - currentElapsed;

                  if (currentRemaining <= 0) {
                    clearInterval(displayTimer);
                    setTimeRemaining(0);
                    setIsSessionActive(false);
                  } else {
                    setTimeRemaining(currentRemaining);
                  }
                } else {
                  clearInterval(displayTimer);
                  setIsSessionActive(false);
                  setTimeRemaining(0);
                }
              } catch (error) {
                console.error("Failed to sync with backend timer:", error);
              }
            }, 1000);

            (window as any).displayTimer = displayTimer;
          } else {
            // Session expired, clean it up
            await invoke("stop_session");
          }
        }
      } catch (error) {
        console.error("Failed to check existing session:", error);
      }
    };

    checkExistingSession();
  }, []);

  const handleMinimize = async () => {
    try {
      const window = getCurrentWindow();
      await window.minimize();
    } catch (error) {
      console.error("Failed to minimize window:", error);
    }
  };

  const handleClose = async () => {
    try {
      const window = getCurrentWindow();
      await window.close();
    } catch (error) {
      console.error("Failed to close window:", error);
    }
  };

  const startSession = async () => {
    try {
      // Start the session using the backend timer
      await invoke("start_session", {
        duration: sessionConfig.duration,
        message: sessionConfig.message,
        delay: sessionConfig.delay
      });

      setIsSessionActive(true);
      setTimeRemaining(sessionConfig.duration * 60); // Convert to seconds for display

      // Start a display timer that syncs with the backend
      const displayTimer = setInterval(async () => {
        try {
          const backendSession = await invoke<BackendSessionConfig | null>("get_session_status");
          if (backendSession) {
            const now = Math.floor(Date.now() / 1000);
            const elapsed = now - backendSession.start_time;
            const remaining = (backendSession.duration * 60) - elapsed;

            if (remaining <= 0) {
              clearInterval(displayTimer);
              setTimeRemaining(0);
              setIsSessionActive(false);
            } else {
              setTimeRemaining(remaining);
            }
          } else {
            // Session was stopped
            clearInterval(displayTimer);
            setIsSessionActive(false);
            setTimeRemaining(0);
          }
        } catch (error) {
          console.error("Failed to sync with backend timer:", error);
        }
      }, 1000);

      // Store timer reference for cleanup
      (window as any).displayTimer = displayTimer;

    } catch (error) {
      console.error("Failed to start session:", error);
    }
  };

  const showOverlayWindow = async () => {
    try {
      // Create overlay window with Tauri
      await invoke("create_overlay_window", {
        message: sessionConfig.message,
        delay: sessionConfig.delay
      });
    } catch (error) {
      console.error("Failed to create overlay window:", error);
    }
    setIsSessionActive(false);
  };

  const stopSession = async () => {
    try {
      // Stop the session in the backend
      await invoke("stop_session");

      // Clear the display timer
      if ((window as any).displayTimer) {
        clearInterval((window as any).displayTimer);
        (window as any).displayTimer = null;
      }

      setIsSessionActive(false);
      setTimeRemaining(0);
    } catch (error) {
      console.error("Failed to stop session:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'white' }}>
      {/* Custom Titlebar */}
      <div>
        <div style={{ backgroundColor: 'white' }}>
          {/* Full Draggable Titlebar */}
          <div
            className="relative flex items-center justify-between px-4 py-2 cursor-move select-none w-full gap-x-4"
            data-tauri-drag-region
          >
            <div className="flex py-2 items-center space-x-2">
              <button onClick={handleClose} data-tauri-drag-region="false" className="w-3 h-3 bg-red-500 rounded-full cursor-pointer"></button>
              <button onClick={handleMinimize} data-tauri-drag-region="false" className="w-3 h-3 bg-yellow-500 rounded-full cursor-pointer"></button>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center space-y-0" >
              <h1 className="text-sm font-bold" data-tauri-drag-region>Break Reminder</h1>
              <p className="text-[10px] text-gray-500">
                Release your mind and take a break
              </p>
            </div>
            <div className="flex items-center space-x-1">
              {!isSessionActive ? (
                <ActionIcon
                  onClick={startSession}
                  size="md"
                  color="blue"
                >
                  <IconPlayerPlay size={12} />
                </ActionIcon>
              ) : (
                <Button
                  onClick={stopSession}
                  size="md"
                  color="red"
                >
                  <IconPlayerPause size={12} />
                </Button>
              )}
            </div>
          </div>
        </div>
        <Container px="md">
          <Card padding="md" radius="md">
            <Stack gap="md">
              {!isSessionActive ? (
                <>
                  <Group grow>
                    <TextInput
                      type="number"
                      min={0}
                      max={480}
                      value={sessionConfig.duration === 0 ? "" : sessionConfig.duration}
                      onChange={(e) => setSessionConfig(prev => ({
                        ...prev,
                        duration: parseInt(e.target.value) || 0
                      }))}
                      placeholder="Session Duration (min)"
                      size="xs"
                    />
                    <TextInput
                      type="number"
                      min={0}
                      max={300}
                      value={sessionConfig.delay === 0 ? "" : sessionConfig.delay}
                      onChange={(e) => setSessionConfig(prev => ({
                        ...prev,
                        delay: parseInt(e.target.value) || 0
                      }))}
                      placeholder="Overlay stay for (sec)"
                      size="xs"
                    />
                  </Group>

                  <TextInput
                    value={sessionConfig.message}
                    onChange={(e) => setSessionConfig(prev => ({
                      ...prev,
                      message: e.target.value
                    }))}
                    placeholder="Break Message"
                    size="xs"
                  />
                </>
              ) : (
                <div style={{ textAlign: 'center', height: '76px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Text size="xl" fw={700} c="blue" ff="monospace">
                    {formatTime(timeRemaining)}
                  </Text>
                </div>
              )}
            </Stack>
          </Card>
        </Container>
      </div>
    </div>
  );
}

export default App;