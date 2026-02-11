import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { PondProvider } from './context/PondContext';
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <PondProvider>
      <App />
    </PondProvider>
  </React.StrictMode>
);