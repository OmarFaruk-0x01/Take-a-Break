import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Pause, Play } from "lucide-react";
import { useState } from "react";
import "./App.css";

interface SessionConfig {
  duration: number;
  message: string;
  delay: number;
}

function App() {
  const [sessionConfig, setSessionConfig] = useState<SessionConfig>({
    duration: 0,
    message: "",
    delay: 0
  });
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

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
    setIsSessionActive(true);
    setTimeRemaining(sessionConfig.duration * 60); // Convert to seconds

    // Hide the main window immediately when session starts
    // try {
    //   await invoke("hide_main_window");
    // } catch (error) {
    //   console.error("Failed to hide main window:", error);
    // }

    // Start the timer
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Show overlay window
          showOverlayWindow();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Store timer reference for cleanup
    (window as any).sessionTimer = timer;
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

  const stopSession = () => {
    if ((window as any).sessionTimer) {
      clearInterval((window as any).sessionTimer);
      (window as any).sessionTimer = null;
    }
    setIsSessionActive(false);
    setTimeRemaining(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Custom Titlebar */}

      <div className="">
        <div className="bg-white">
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
              {!isSessionActive ? <Button
                onClick={startSession}
                size='sm'
                className="cursor-pointer bg-blue-600 hover:bg-blue-700"
                variant='default'
              >
                <Play className="w-3! h-3!" />
              </Button> : <Button
                onClick={stopSession}
                size='sm'
                className="cursor-pointer bg-red-600 hover:bg-red-700"
                variant='destructive'
              >
                <Pause className="w-3! h-3!" />
              </Button>}
            </div>
          </div>
        </div>
        <div className="max-w-md mx-auto">
          <Card className=" rounded-none p-3">
            <CardContent className="space-y-3 px-0">
              {!isSessionActive ? (
                <>
                  <div className="flex gap-x-3">
                    <div className="flex-1 flex items-cente space-x-2">
                      <Input
                        id="duration"
                        type="number"
                        min="0"
                        max="480"
                        value={sessionConfig.duration == -1 ? "" : sessionConfig.duration}
                        onChange={(e) => setSessionConfig(prev => ({
                          ...prev,
                          duration: e.target.valueAsNumber || 0
                        }))}
                        className="flex-1 text-xs p-2 h-8"
                        placeholder="Session Duration (min)"
                      />
                    </div>
                    <div className=" flex-1">
                      <Input
                        id="delay"
                        type="number"
                        min="0"
                        max="300"
                        value={sessionConfig.delay == -1 ? '' : sessionConfig.delay}
                        onChange={(e) => setSessionConfig(prev => ({
                          ...prev,
                          delay: e.target.valueAsNumber || 0
                        }))}
                        placeholder="Overlay stay for (sec)"

                        className="flex-1 text-xs p-2 h-8"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Input
                      id="message"
                      type="text"
                      value={sessionConfig.message}
                      onChange={(e) => setSessionConfig(prev => ({
                        ...prev,
                        message: e.target.value
                      }))}
                      placeholder="Break Message"
                      className="flex-1 text-xs p-2 h-8"
                    />
                  </div>

                </>
              ) : (
                <div className="text-center h-[76px] flex items-center justify-center">
                  <div className="text-4xl font-mono font-bold text-blue-600">
                    {formatTime(timeRemaining)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;