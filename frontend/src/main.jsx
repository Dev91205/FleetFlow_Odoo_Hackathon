import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter } from "react-router-dom";

import App from "./App";

import { FleetProvider } from "./context/FleetContext";

import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")).render(

  <React.StrictMode>

    <FleetProvider>

      <BrowserRouter>

        <App />

      </BrowserRouter>

    </FleetProvider>

  </React.StrictMode>

);