import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import OverlayApp from "./OverlayApp";

// Check if we're in the overlay window
const isOverlay = window.location.pathname.includes('overlay.html');

const rootElement = document.getElementById(isOverlay ? "overlay-root" : "root") as HTMLElement;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {isOverlay ? <OverlayApp /> : <App />}
  </React.StrictMode>,
);
