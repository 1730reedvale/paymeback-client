import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route, Navigate } from "react-router-dom";
import "./styles/theme.css";
import Layout from "./layouts/Layout";
import HomePage from "./home/HomePage";
export default function App() {
    return (_jsxs(Routes, { children: [_jsxs(Route, { element: _jsx(Layout, {}), children: [_jsx(Route, { index: true, element: _jsx(HomePage, {}) }), _jsx(Route, { path: "/home", element: _jsx(HomePage, {}) })] }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/home", replace: true }) })] }));
}
