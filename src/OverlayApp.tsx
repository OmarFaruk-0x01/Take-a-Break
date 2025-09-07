import { Card, CardContent } from "@/components/ui/card";
import { listen } from "@tauri-apps/api/event";
import { useEffect, useState } from "react";
import "./App.css";

interface OverlayConfig {
  message: string;
  delay: number;
}

function OverlayApp() {
  const [config, setConfig] = useState<OverlayConfig | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    // Listen for the overlay configuration from the main window
    const unlisten = listen<OverlayConfig>("overlay-config", (event) => {
      setConfig(event.payload);
      setTimeRemaining(event.payload.delay);
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, []);

  useEffect(() => {
    if (!config) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [config]);

  if (!config) {
    return (
      <div className="fixed h-screen w-screen inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-xl" >
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="text-2xl font-bold text-gray-800">
              Loading...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed h-screen w-screen inset-0 flex items-center justify-center z-50">
      <Card className="bg-white/95 backdrop-blur-sm shadow-2xl max-w-2xl mx-auto border-0 bg-transparent">
        <CardContent className="p-12 text-center">
          <div className="text-8xl mb-6">⏰</div>
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            Break Time!
          </h1>
          <p className="text-2xl text-gray-600 mb-8 leading-relaxed">
            {config.message}
          </p>
          <div className="text-xl text-gray-500 font-mono">
            Auto-closing in {timeRemaining} seconds
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default OverlayApp;
