import { ActionIcon, TextInput } from '@mantine/core';
import { IconPlayerPlay } from '@tabler/icons-react';
import React from 'react';

interface SessionConfig {
    duration: number;
    message: string;
    delay: number;
}

interface IdleViewProps {
    sessionConfig: SessionConfig;
    setSessionConfig: React.Dispatch<React.SetStateAction<SessionConfig>>;
    startSession: () => void;
}

export default function IdleView({ sessionConfig, setSessionConfig, startSession }: IdleViewProps) {
    return <>
        <div>
            <TextInput
                type="number"
                min={0}
                max={480}
                value={sessionConfig.duration === -1 ? "" : sessionConfig.duration}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSessionConfig(prev => ({
                    ...prev,
                    duration: parseInt(e.target.value) || -1
                }))}
                placeholder="00"
                spellCheck={false}
                styles={{
                    input: {
                        textAlign: 'center',
                        fontSize: '3rem',
                        fontFamily: 'Baloo 2, sans-serif',
                        height: '4rem',
                        border: 0,
                        borderRadius: 0,
                        cursor: 'default',
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        outline: 'none',
                        padding: 0,
                        margin: 0,
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        userSelect: 'none',
                        WebkitUserDrag: 'none',
                        MozUserDrag: 'none',
                        msUserDrag: 'none',
                        userDrag: 'none',
                    }
                }}
            />
            <span className="text-md text-gray-500 text-center block">min</span>
        </div>
        <ActionIcon
            className='border-shape'
            onClick={startSession}
            size="3rem"
            radius='md'
        >
            <IconPlayerPlay size={24} />
        </ActionIcon>

        <TextInput
            value={sessionConfig.message}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSessionConfig(prev => ({
                ...prev,
                message: e.target.value
            }))}
            placeholder="Break Message"
            size="md"
            spellCheck={false}
            w='100%'
        />
    </>
}