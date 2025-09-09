import { Button, Card, Container, Group, Text, Title } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import "./App.css";

interface OverlayConfig {
  message: string;
  delay: number;
}

function OverlayApp() {
  const [config, setConfig] = useState<OverlayConfig | null>(null);
  const [isAutoCloseEnabled, setIsAutoCloseEnabled] = useState(true); // This will come from settings later

  useEffect(() => {
    console.log("OverlayApp mounted, requesting session config from store");

    // Request session config from the store when the overlay is ready
    const loadSessionConfig = async () => {
      try {
        const sessionConfig = await invoke<OverlayConfig>("get_session_config");
        console.log("Received session config from store:", sessionConfig);
        setConfig(sessionConfig);
      } catch (error) {
        console.error("Failed to load session config:", error);
      }
    };

    loadSessionConfig();
  }, []);

  // Debug: Log when component renders
  useEffect(() => {
    console.log("OverlayApp rendered with config:", config);
  }, [config]);

  // Auto-close timer (only when auto-close is enabled)
  useEffect(() => {
    if (!config || !isAutoCloseEnabled) return;

    const timer = setInterval(() => {
      // Auto-close logic will be handled by the backend timer
      // This is just for cleanup if needed
    }, 1000);

    return () => clearInterval(timer);
  }, [config, isAutoCloseEnabled]);

  const handleCloseOverlay = async () => {
    try {
      console.log("Close overlay clicked");

      // Stop any active session
      await invoke("stop_session");

      // Use the backend command to close overlay and show main window
      await invoke("close_overlay_window");

      console.log("Overlay closed successfully");
    } catch (error) {
      console.error("Failed to close overlay:", error);
    }
  };

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

          {/* Manual Control Buttons */}
          <Group justify="center" gap="md" mt="xl">
            <Button
              size="lg"
              color="red"
              variant="outline"
              leftSection={<IconX size={20} />}
              onClick={handleCloseOverlay}
              loading={false}
              disabled={false}
              spellCheck={false}
            >
              Close
            </Button>
          </Group>
        </Container>
      </Card>
    </div>
  );
}

export default OverlayApp;
