import { Card, Container, Text, Title } from '@mantine/core';
import { invoke } from "@tauri-apps/api/core";
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
    console.log("OverlayApp mounted, requesting session config from store");

    // Request session config from the store when the overlay is ready
    const loadSessionConfig = async () => {
      try {
        const sessionConfig = await invoke<OverlayConfig>("get_session_config");
        console.log("Received session config from store:", sessionConfig);
        setConfig(sessionConfig);
        setTimeRemaining(sessionConfig.delay);
      } catch (error) {
        console.error("Failed to load session config:", error);
      }
    };

    loadSessionConfig();
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
      <div style={{
        position: 'fixed',
        height: '100vh',
        width: '100vw',
        top: 0,
        left: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(12px)'
      }}>
        <Card shadow="xl" radius="md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)' }}>
          <Container p="xl" style={{ textAlign: 'center' }}>
            <Title order={2} c="dark">
              Loading...
            </Title>
          </Container>
        </Card>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      height: '100vh',
      width: '100vw',
      top: 0,
      left: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(12px)'
    }}>
      <Card
        shadow="xl"
        radius="md"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(8px)',
          maxWidth: '32rem',
          margin: '0 auto',
          border: 'none'
        }}
      >
        <Container p="xl" style={{ textAlign: 'center' }}>
          <Text size="8xl" mb="md">⏰</Text>
          <Title order={1} c="dark" mb="md">
            Break Time!
          </Title>
          <Text size="xl" c="dimmed" mb="lg" style={{ lineHeight: 1.6 }}>
            {config.message}
          </Text>
          <Text size="lg" c="dimmed" ff="monospace">
            Auto-closing in {timeRemaining} seconds
          </Text>
        </Container>
      </Card>
    </div>
  );
}

export default OverlayApp;
