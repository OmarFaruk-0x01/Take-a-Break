import { Card, Container, Stack } from '@mantine/core';
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import "./App.css";
import Header from './Header';
import IdleView from './IdleView';
import ProgressView from './ProgressView';

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
    duration: 5,
    message: "",
    delay: 0
  });
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

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
            await invoke("stop_session");
          }
        }
      } catch (error) {
        console.error("Failed to check existing session:", error);
      }
    };

    checkExistingSession();
  }, []);



  const startSession = async () => {
    try {
      await invoke("start_session", {
        duration: sessionConfig.duration,
        message: sessionConfig.message,
        delay: 0
      });

      setIsSessionActive(true);
      setTimeRemaining(sessionConfig.duration * 60);

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
            clearInterval(displayTimer);
            setIsSessionActive(false);
            setTimeRemaining(0);
          }
        } catch (error) {
          console.error("Failed to sync with backend timer:", error);
        }
      }, 1000);

      (window as any).displayTimer = displayTimer;

    } catch (error) {
      console.error("Failed to start session:", error);
    }
  };


  return (
    <div className='rounded overflow-hidden border h-screen w-screen bg-white'>
      <Header />
      <div>
        <Container px="md">
          <Card padding="md" radius="md">
            <Stack gap="lg" justify='center' align='center'>
              {!isSessionActive ? (
                <IdleView
                  sessionConfig={sessionConfig}
                  setSessionConfig={setSessionConfig}
                  startSession={startSession}
                />
              ) : (
                <ProgressView timeRemaining={timeRemaining} setIsSessionActive={setIsSessionActive}
                />
              )}
            </Stack>
          </Card>
        </Container>
      </div>
    </div>
  );
}

export default App;