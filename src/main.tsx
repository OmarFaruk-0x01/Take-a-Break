import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import { Notifications } from '@mantine/notifications';
import '@mantine/notifications/styles.css';
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import OverlayApp from "./OverlayApp";

// Check if we're in the overlay window
const isOverlay = window.location.pathname.includes('overlay.html');

const rootElement = document.getElementById(isOverlay ? "overlay-root" : "root") as HTMLElement;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <MantineProvider>
      <Notifications />
      {isOverlay ? <OverlayApp /> : <App />}
    </MantineProvider>
  </React.StrictMode>,
);
