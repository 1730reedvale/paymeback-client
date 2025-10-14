// /src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./styles/theme.css";
import Layout from "./layouts/Layout";
import HomePage from "./home/HomePage";

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Default dashboard */}
        <Route index element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  );
}
