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


  useEffect(() => {
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

  const handleCloseOverlay = async () => {
    try {
      await invoke("stop_session");
      await invoke("close_overlay_window");
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
        backgroundColor: 'transparent',
        backdropFilter: 'blur(12px)'
      }}>
        <Card shadow="xl" radius="md" style={{ backgroundColor: 'rgba(255, 255, 255, 0)', backdropFilter: 'blur(8px)' }}>
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
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)'
    }}>
      <Card
        shadow="xl"
        radius="md"
        style={{
          backgroundColor: 'transparent',
          maxWidth: '32rem',
          margin: '0 auto',
          border: 'none'
        }}
      >
        <Container p="xl" bg="transparent" style={{ textAlign: 'center', background: 'transparent' }}>
          <Title order={1} c="white" mb="md">
            Break Time!
          </Title>
          {config.message.trim() !== "" && (
            <div className="mb-lg bg-gray-300/50 rounded-md p-2 border border-gray-300/50">
              <Text size="xl" c="white" style={{ lineHeight: 1.6 }}>
                {config.message}
              </Text>
            </div>
          )}
          <Group justify="center" gap="md" mt="xl">
            <Button
              size="xs"
              color="white"
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
