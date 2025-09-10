import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import OverlayApp from "./OverlayApp";

const searchParams = new URLSearchParams(window.location.search)

const isOverlay = searchParams.get('screen') === 'overlay';

const rootElement = document.getElementById(isOverlay ? "overlay-root" : "root") as HTMLElement;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <MantineProvider theme={{
      fontFamily: 'Baloo 2, sans-serif',
      primaryColor: 'primary',
      colors: {
        primary: ["#f7f2f3",
          "#e7e3e3",
          "#d1c3c4",
          "#bca2a3",
          "#aa8586",
          "#a07274",
          "#9b696b",
          "#88585a",
          "#7a4d4f",
          "#5c3739"
        ],
      }
    }}>
      <Notifications />
      {isOverlay ? <OverlayApp /> : <App />}
    </MantineProvider>
  </React.StrictMode>,
);
