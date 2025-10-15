import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/theme.css";
const rootEl = document.getElementById("root");
if (!rootEl) {
    throw new Error("Root element #root not found");
}
ReactDOM.createRoot(rootEl).render(_jsx(React.StrictMode, { children: _jsx(BrowserRouter, { children: _jsx(App, {}) }) }));
