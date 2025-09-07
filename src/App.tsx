import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { invoke } from "@tauri-apps/api/core";
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
    message: "Make Coffee",
    delay: 3
  });
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const startSession = async () => {
    setIsSessionActive(true);
    setTimeRemaining(sessionConfig.duration * 60); // Convert to seconds

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
    <div className="min-h-screen bg-transparent p-4">
      <div className="max-w-md mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">Break Reminder</CardTitle>
            <CardDescription>
              Set your session duration and reminder message
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isSessionActive ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="duration">Session Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="480"
                    value={sessionConfig.duration}
                    onChange={(e) => setSessionConfig(prev => ({
                      ...prev,
                      duration: parseInt(e.target.value) || 15
                    }))}
                    placeholder="15"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Reminder Message</Label>
                  <Input
                    id="message"
                    type="text"
                    value={sessionConfig.message}
                    onChange={(e) => setSessionConfig(prev => ({
                      ...prev,
                      message: e.target.value
                    }))}
                    placeholder="Make Coffee"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delay">Reminder Screen Delay (seconds)</Label>
                  <Input
                    id="delay"
                    type="number"
                    min="5"
                    max="300"
                    value={sessionConfig.delay}
                    onChange={(e) => setSessionConfig(prev => ({
                      ...prev,
                      delay: parseInt(e.target.value) || 30
                    }))}
                    placeholder="30"
                  />
                </div>

                <Button
                  onClick={startSession}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Start Session
                </Button>
              </>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-4xl font-mono font-bold text-blue-600">
                  {formatTime(timeRemaining)}
                </div>
                <p className="text-gray-600">
                  Session in progress...
                </p>
                <Button
                  onClick={stopSession}
                  variant="outline"
                  className="w-full"
                >
                  Stop Session
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;