import { ActionIcon, Group, Text } from '@mantine/core';
import { IconPlayerPause } from '@tabler/icons-react';
import { invoke } from '@tauri-apps/api/core';

interface ProgressViewProps {
  timeRemaining: number;
  setIsSessionActive: (isSessionActive: boolean) => void;
}

export default function ProgressView({ timeRemaining, setIsSessionActive }: ProgressViewProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePause = async () => {
    try {
      await invoke('stop_session');
      setIsSessionActive(false);
    } catch (error) {
      console.error('Failed to pause session:', error);
      setIsSessionActive(false);
    }
  };

  return (
    <div style={{
      textAlign: 'center',
      height: '220px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <Text
        size="3xl"
        fw={700}
        c="primary"
        ff="Baloo 2, sans-serif"
        style={{ fontSize: '3rem' }}
      >
        {formatTime(timeRemaining)}
      </Text>
      <Group>
        <ActionIcon variant='light' color='red' size='xl' onClick={handlePause}>
          <IconPlayerPause size={18} />
        </ActionIcon>

      </Group>
    </div>
  );
}
